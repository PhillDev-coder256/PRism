<?php
// api.php - V5.0 The Complete Multi-Language Engine

ini_set('display_errors', 1);
error_reporting(E_ALL);

require __DIR__ . '/vendor/autoload.php';

use PhpParser\ParserFactory;
use PhpParser\Node;
use PhpParser\NodeVisitorAbstract;
use PhpParser\NodeTraverser;
use PhpParser\Error as PhpParserError;

// --- Headers & Global Setup ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

// --- GitHub API Helper ---
function get_github_data($url) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Context-Keeper-App');
    // For a real app, you would add an Authorization header to increase rate limits:
    // curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: token YOUR_GITHUB_TOKEN']);
    $output = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($httpcode >= 400) {
        $msg = json_decode($output, true)['message'] ?? 'GitHub API HTTP Error: ' . $httpcode;
        return ['error_message' => $msg];
    }
    return json_decode($output, true);
}


// --- PHP ANALYSIS: The Fingerprinting Visitor (From V4) ---
class PhpStructureVisitor extends NodeVisitorAbstract {
    public array $structure = [];
    private ?string $currentClass = null;

    public function enterNode(Node $node) {
        if ($node instanceof Node\Stmt\Class_) $this->currentClass = $node->name->toString();
        
        if ($node instanceof Node\Stmt\Function_ || $node instanceof Node\Stmt\ClassMethod) {
            $name = ($this->currentClass ? $this->currentClass . '::' : '') . $node->name->toString();
            $params = [];
            foreach ($node->getParams() as $param) {
                $params[] = ($param->type ? $param->type->toString() . ' ' : '') . '$' . $param->var->name;
            }
            $returnType = $node->getReturnType() ? ': ' . $node->getReturnType()->toString() : '';
            
            $this->structure[$name] = [
                'signature' => "function {$name}(" . implode(', ', $params) . "){$returnType}",
                'body_hash' => md5(serialize($node->stmts))
            ];
        }
    }
    public function leaveNode(Node $node) {
        if ($node instanceof Node\Stmt\Class_) $this->currentClass = null;
    }
}

// --- PHP ANALYSIS: The AST Parser Function (From V4) ---
function get_php_structure($code, $parser) {
    $visitor = new PhpStructureVisitor();
    $traverser = new NodeTraverser();
    $traverser->addVisitor($visitor);
    try {
        $ast = $parser->parse($code);
        $traverser->traverse($ast);
        return $visitor->structure;
    } catch (PhpParserError $e) { return ['parsing_error' => $e->getMessage()]; }
}


// --- JAVASCRIPT / TYPESCRIPT ANALYSIS: The Regex Parser Function (NEW) ---
function get_javascript_structure($code) {
    $structure = [];
    // This regex looks for common function declaration patterns in JS/TS
    $pattern = '/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)\s*\(|^(?:\s*)?(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:async)?\s*\(.*?\)\s*=>/';
    preg_match_all($pattern, $code, $matches, PREG_SET_ORDER);

    foreach ($matches as $match) {
        // Find the first non-empty capture group which contains the function name
        $name = !empty($match[1]) ? $match[1] : (!empty($match[2]) ? $match[2] : null);
        if ($name) {
             // We use the function's existence and name as its signature for this lighter parser
            $structure[$name] = ['signature' => "function {$name}()"];
        }
    }
    return $structure;
}


// --- MAIN LOGIC ---

$input_data = json_decode(file_get_contents('php://input'), true);
$pr_url = $input_data['url'] ?? '';

if (!preg_match('/github\.com\/([^\/]+)\/([^\/]+)\/pull\/(\d+)/', $pr_url, $matches)) {
    http_response_code(400); echo json_encode(['error' => 'Invalid GitHub PR URL.']); exit;
}
[, $owner, $repo, $pull_number] = $matches;

$pr_detail_url = "https://api.github.com/repos/{$owner}/{$repo}/pulls/{$pull_number}";
$pr_details = get_github_data($pr_detail_url);
if (!($base_sha = $pr_details['base']['sha'] ?? null)) {
    http_response_code(500); echo json_encode(['error' => 'Could not determine base commit SHA from PR details.']); exit;
}

$api_files_url = "https://api.github.com/repos/{$owner}/{$repo}/pulls/{$pull_number}/files";
$files_data = get_github_data($api_files_url);
if (!is_array($files_data) || isset($files_data['error_message'])) {
    http_response_code(500); echo json_encode(['error' => 'GitHub API Error: ' . ($files_data['error_message'] ?? 'Could not fetch file list.')]); exit;
}

$php_parser = (new ParserFactory)->createForHostVersion();
$storyline = [];
$prompts = [];
$raw_diff = '';

foreach ($files_data as $file) {
    $filename = $file['filename'];
    $patch_data = $file['patch'] ?? '';
    $raw_diff .= "--- Changes for {$filename} ---\n" . $patch_data . "\n\n";

    if (in_array($file['status'], ['deleted', 'renamed'])) {
        $storyline[] = "File `{$filename}` was {$file['status']}.";
        continue;
    }
    
    // --- ROUTER: Call the correct analyzer based on file extension ---
    $analysis_result = [];
    if (preg_match('/\.php$/', $filename)) {
        $analysis_result = analyze_php_file($file, $base_sha, $owner, $repo, $php_parser);
    } elseif (preg_match('/\.(js|jsx|ts|tsx)$/', $filename)) {
        $analysis_result = analyze_js_ts_file($file, $base_sha, $owner, $repo);
    }
    // No 'else' needed; non-matching files will have no specific story and that's okay.
    
    // --- Process the result ---
    if (!empty($analysis_result['story'])) {
        $storyline[] = "In `{$filename}`:\n- " . implode("\n- ", $analysis_result['story']);
        $prompts = array_merge($prompts, $analysis_result['prompts']);
    } else {
        $storyline[] = "File `{$filename}` was {$file['status']}, but no high-level changes were detected by the analyzer for this file type.";
    }
}

if (empty($storyline)) { $storyline[] = "No files were analyzed."; }
$response = [
    'storyline' => implode("\n\n", $storyline),
    'prompts' => array_unique($prompts),
    'raw_diff' => $raw_diff
];

echo json_encode($response);


// --- Refactored Analysis Function for PHP ---
function analyze_php_file($file, $base_sha, $owner, $repo, $parser) {
    $prompts = [];
    $after_content = @file_get_contents($file['raw_url']);
    if (empty($after_content)) return ['story' => [], 'prompts' => []];

    $structure_after = get_php_structure($after_content, $parser);
    $structure_before = [];

    if ($file['status'] === 'modified') {
        $before_content_url = "https://raw.githubusercontent.com/{$owner}/{$repo}/{$base_sha}/{$file['filename']}";
        $before_content = @file_get_contents($before_content_url);
        if(!empty($before_content)) $structure_before = get_php_structure($before_content, $parser);
    }
    
    $file_changes = [];
    $after_keys = array_keys($structure_after);
    $before_keys = array_keys($structure_before);

    $added_methods = array_diff($after_keys, $before_keys);
    $removed_methods = array_diff($before_keys, $after_keys);
    $potentially_changed_methods = array_intersect($after_keys, $before_keys);

    foreach($added_methods as $name) {
        $file_changes[] = "✅ **New function/method added:** `{$name}`.";
        $prompts[] = "ACTION: Write documentation for the new `{$name}` method in `{$file['filename']}`.";
    }
    foreach($removed_methods as $name) { $file_changes[] = "❌ **Function/method removed:** `{$name}`."; }

    foreach($potentially_changed_methods as $name) {
        if ($structure_before[$name]['signature'] !== $structure_after[$name]['signature']) {
            $file_changes[] = "Signature changed for `{$name}`.";
            $prompts[] = "REVIEW: The signature for `{$name}` in `{$file['filename']}` has changed. Ensure all calls are updated.";
        } elseif ($structure_before[$name]['body_hash'] !== $structure_after[$name]['body_hash']) {
            $file_changes[] = "💡 **Implementation changed inside:** `{$name}`.";
        }
    }
    
    return ['story' => $file_changes, 'prompts' => $prompts];
}

// --- Refactored Analysis Function for JS/TS ---
function analyze_js_ts_file($file, $base_sha, $owner, $repo) {
    $prompts = [];
    $after_content = @file_get_contents($file['raw_url']);
    if (empty($after_content)) return ['story' => [], 'prompts' => []];

    $structure_after = get_javascript_structure($after_content);
    $structure_before = [];

    if ($file['status'] === 'modified') {
        $before_content_url = "https://raw.githubusercontent.com/{$owner}/{$repo}/{$base_sha}/{$file['filename']}";
        $before_content = @file_get_contents($before_content_url);
        if(!empty($before_content)) $structure_before = get_javascript_structure($before_content);
    }
    
    $file_changes = [];
    $added = array_diff_key($structure_after, $structure_before);
    $removed = array_diff_key($structure_before, $structure_after);

    foreach ($added as $name => $data) {
        $file_changes[] = "✅ **New function/method added:** `{$name}`.";
        $prompts[] = "ACTION: Write a summary for the new `{$name}` function.";
    }
    foreach ($removed as $name => $data) {
        $file_changes[] = "❌ **Function/method removed:** `{$name}`.";
    }
    
    return ['story' => $file_changes, 'prompts' => $prompts];
}
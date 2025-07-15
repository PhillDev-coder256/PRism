<?php
// send-feedback.php

// --- CORS HEADERS & BASIC SETUP (Same as api.php) ---
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// --- Email Configuration ---
$recipient_email = "phillipphilcourts540@gmail.com";


// --- Process the Incoming Data ---
$input_data = json_decode(file_get_contents('php://input'), true);

// 1. Sanitize Inputs (Very Important for Security)
$feedback_type = filter_var($input_data['feedbackType'] ?? 'Not Specified', FILTER_SANITIZE_STRING);
$feedback_text = filter_var($input_data['feedbackText'] ?? '', FILTER_SANITIZE_STRING);

if (empty($feedback_text)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Feedback text cannot be empty.']);
    exit;
}

// 2. Prepare the Email Content
$subject = "New Feedback for Context Keeper: " . ucfirst($feedback_type);

$body = "
<html>
<head>
  <style>
    body { font-family: sans-serif; color: #333; }
    .container { padding: 20px; border: 1px solid #ddd; border-radius: 8px; max-width: 600px; }
    h2 { color: #00AFFF; }
    strong { color: #555; }
    p { background-color: #f9f9f9; padding: 15px; border-radius: 4px; white-space: pre-wrap; }
  </style>
</head>
<body>
  <div class='container'>
    <h2>New Feedback Received!</h2>
    <p>
      <strong>Feedback Type:</strong> " . htmlspecialchars($feedback_type) . "<br><br>
      <strong>Message:</strong><br>" . nl2br(htmlspecialchars($feedback_text)) . "
    </p>
  </div>
</body>
</html>
";

// 3. Set Email Headers for HTML content and to prevent spam
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= 'From: <feedback-bot@context-keeper.com>' . "\r\n"; // Use a "no-reply" style address


// 4. Send the Email
if (mail($recipient_email, $subject, $body, $headers)) {
    echo json_encode(['success' => true]);
} else {
    // This error usually happens on localhost if 'sendmail' isn't configured.
    // On a real web server (Vercel, etc.), this should work.
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server failed to send email.']);
}

?>
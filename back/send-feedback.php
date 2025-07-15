<?php
// A SIMPLIFIED EXAMPLE for send-feedback.php using a library like SendGrid

require __DIR__ . '/vendor/autoload.php'; // Required for SendGrid library

// ... CORS Headers and Input Processing ...

// --- This part changes ---
$email = new \SendGrid\Mail\Mail(); 
$email->setFrom("feedback-bot@prism.vercel.com", "Context Keeper Feedback");
$email->setSubject("New Feedback: " . ucfirst($feedback_type));
$email->addTo("phillipphilcourts540@gmail.com", "Your Name");
$email->addContent("text/html", $html_body_we_created_earlier);

// Fetch the API Key from an Environment Variable (NEVER hardcode it)
$sendgrid_api_key = getenv('SENDGRID_API_KEY'); 

$sendgrid = new \SendGrid($sendgrid_api_key);
try {
    $response = $sendgrid->send($email);
    if ($response->statusCode() >= 200 && $response->statusCode() < 300) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'SendGrid failed']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Exception when sending email']);
}
?>
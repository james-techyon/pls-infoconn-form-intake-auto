# Email Workaround for Apps Script

If email aliases cannot be set up, use this modified email code in your Apps Script:

## Option 1: Remove the 'from' parameter
This will send all emails from Kyle@prestigelaborsolutions.com but personalize the name:

```javascript
// Replace lines 102-109 in appscript.js with:
MailApp.sendEmail({
  to: recipientEmail,
  subject: subject,
  body: body,
  attachments: attachments,
  name: senderName + " - Prestige Labor Solutions"
  // Removed 'from' parameter - will use script owner's email
});
```

## Option 2: Use replyTo instead of from
This keeps Kyle as sender but sets reply-to address:

```javascript
// Replace lines 102-109 in appscript.js with:
MailApp.sendEmail({
  to: recipientEmail,
  subject: subject,
  body: body,
  attachments: attachments,
  replyTo: senderEmail,  // Changed from 'from' to 'replyTo'
  name: senderName + " - Prestige Labor Solutions"
});
```

## Option 3: Add email signature with correct contact
Keep the original code but modify the email body:

```javascript
// Replace line 82 with:
var body = "Thank you for your interest in Prestige Labor Solutions.\n\nPlease find attached our rate sheets and servicing cities information.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\n" + senderName + "\nPrestige Labor Solutions Team\n\nDirect Contact: " + senderEmail;
```

Choose the option that best fits your needs. Option 2 (replyTo) is recommended as it maintains personalization while working within Google's restrictions.
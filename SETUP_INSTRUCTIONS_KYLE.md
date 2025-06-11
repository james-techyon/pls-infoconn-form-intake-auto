# Complete Setup Instructions for Kyle@prestigelaborsolutions.com

This guide will walk you through setting up the Google Apps Script backend for the PLS lead capture form under your Google account.

## Prerequisites

Before starting, ensure you have:
- Access to Kyle@prestigelaborsolutions.com Google account
- Access to the Google Sheet: https://docs.google.com/spreadsheets/d/1UoKJtrlEJUujjOOU6g4RmEbcNeNUKFK0BdRFuOS07aA/
- Access to the Drive folder: https://drive.google.com/drive/folders/1BVJuLPV1MvZAJlFohxmsmsusgHAbbKMc

## Step 1: Create the Google Apps Script Project

1. **Open Google Apps Script**
   - Go to https://script.google.com
   - Sign in with Kyle@prestigelaborsolutions.com
   - Click "New project"

2. **Name the project**
   - Click "Untitled project" at the top
   - Name it: "PLS InfoComm Form Handler"

3. **Replace the default code**
   - Delete all existing code in the editor
   - Copy ALL the code from the `appscript.js` file (provided below)
   - Paste it into the editor

## Step 2: Connect to Google Sheet

1. **Open the Script Editor**
   - In your Apps Script project, click "Services" in the left sidebar
   - Find "Google Sheets API" and click "Add"
   
2. **Link to the spreadsheet**
   - Open the Google Sheet in another tab
   - Copy the sheet ID from the URL (the long string between /d/ and /edit)
   - It should be: `1UoKJtrlEJUujjOOU6g4RmEbcNeNUKFK0BdRFuOS07aA`

## Step 3: Set Required Permissions

1. **Run the script once to trigger permissions**
   - In the Apps Script editor, select "doPost" from the function dropdown
   - Click "Run"
   - You'll get an error (this is expected)

2. **Authorize the permissions**
   - Click "Review permissions"
   - Select Kyle@prestigelaborsolutions.com
   - Click "Advanced" → "Go to PLS InfoComm Form Handler (unsafe)"
   - Review and click "Allow" for:
     - View and manage spreadsheets
     - Send email as you
     - View and manage Drive files

## Step 4: Deploy as Web App

1. **Click "Deploy" → "New deployment"**

2. **Configure deployment settings:**
   - Click the gear icon → "Web app"
   - Description: "PLS Lead Form Handler v1"
   - Execute as: **Me (Kyle@prestigelaborsolutions.com)**
   - Who has access: **Anyone**
   - Click "Deploy"

3. **Copy the Web App URL**
   - You'll get a URL like: `https://script.google.com/macros/s/[LONG_ID]/exec`
   - **SAVE THIS URL** - you'll need it for Step 6

## Step 5: Verify Email Settings

1. **Check email aliases** (if using Google Workspace)
   - Go to Gmail settings → Accounts
   - Ensure these emails can send mail:
     - Javier@prestigelaborsolutions.com
     - Kevin@prestigelaborsolutions.com
     - Kyle@prestigelaborsolutions.com

2. **If aliases aren't set up:**
   - Contact your Google Workspace admin
   - Or remove the `from:` parameter from the email code (line 107)

## Step 6: Update the Form with New URL

**IMPORTANT**: Send the deployment URL from Step 4 to James/IT team to update in:
- Line 582 of index.html
- Line 644 of index.html
- The notes.md file

## Step 7: Test the Setup

1. **Test data submission:**
   ```
   Go to the Apps Script editor
   Click "doPost" function
   Replace the code temporarily with this test:
   ```
   ```javascript
   function testDoPost() {
     var testData = {
       postData: {
         contents: JSON.stringify({
           name: "Test User",
           company: "Test Company",
           phone: "(555) 555-5555",
           email: "your-email@example.com",
           source: "Test",
           timestamp: new Date().toISOString(),
           deviceId: "iPad_1749611297458_qbixv7jwg"
         })
       }
     };
     
     var result = doPost(testData);
     console.log(result.getContent());
   }
   ```

2. **Run the test function**
   - Select "testDoPost" from dropdown
   - Click "Run"
   - Check the execution log

3. **Verify:**
   - New row appears in the Google Sheet
   - Email is sent to the test email address
   - Email includes all attachments from the Drive folder

## Step 8: Monitor and Troubleshoot

1. **View logs:**
   - In Apps Script editor, click "Executions" in left sidebar
   - Check for any errors

2. **Common issues:**
   - **"Permission denied"**: Re-run authorization steps
   - **"File not found"**: Check Drive folder access
   - **Email not sending**: Verify email permissions
   - **No data in sheet**: Check column headers match exactly

## Complete Apps Script Code

```javascript
function doGet(e) {
    // Log the GET request details, though we primarily expect POST
    Logger.log('Received GET request: ' + JSON.stringify(e));
    return HtmlService.createHtmlOutput("This script is intended to be used with a POST request from a form.");
  }
  
  function doPost(e) {
    // Log the entire event object to see what's coming in
    Logger.log('Received POST request. Event object: ' + JSON.stringify(e));
  
    var sheet;
    var headers;
    var newRow = [];
    var data;
  
    try {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      Logger.log('Active sheet retrieved: ' + sheet.getName());
  
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Logger.log('Sheet headers: ' + JSON.stringify(headers));
  
      if (e && e.postData && e.postData.contents) {
        Logger.log('e.postData.contents received: ' + e.postData.contents);
        
        try {
          data = JSON.parse(e.postData.contents);
          Logger.log('Parsed JSON data: ' + JSON.stringify(data));
        } catch (parseError) {
          Logger.log('Error parsing JSON: ' + parseError.toString() + '. Raw content: ' + e.postData.contents);
          return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'Invalid JSON data received by script.', 'error': parseError.toString() }))
            .setMimeType(ContentService.MimeType.JSON);
        }
  
        // Map form data to sheet columns based on headers
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          if (data.hasOwnProperty(header)) {
            newRow.push(data[header]);
          } else {
            Logger.log('Missing data for header: ' + header);
            newRow.push(''); // Add empty string if data for header is missing
          }
        }
        Logger.log('New row to append: ' + JSON.stringify(newRow));
  
        if (newRow.length > 0) {
          sheet.appendRow(newRow);
          Logger.log('Successfully appended row to sheet.');

          // --- BEGINNING OF ADDED CODE FOR EMAIL ---
          try {
            var recipientEmail = data.email; // Assuming 'email' is the field name in your form data
            if (recipientEmail) {
              // Determine sender email based on deviceId
              var senderEmail = "Kyle@prestigelaborsolutions.com"; // Default sender
              var senderName = "Kyle"; // Default name
              
              if (data.deviceId) {
                switch(data.deviceId) {
                  case "iPad_1749611604926_nh392j54n":
                    senderEmail = "Javier@prestigelaborsolutions.com";
                    senderName = "Javier";
                    break;
                  case "iPad_1749611914823_7v34blcwk":
                    senderEmail = "Kevin@prestigelaborsolutions.com";
                    senderName = "Kevin";
                    break;
                  case "iPad_1749611297458_qbixv7jwg":
                    senderEmail = "Kyle@prestigelaborsolutions.com";
                    senderName = "Kyle";
                    break;
                  default:
                    // Keep default (Kyle)
                    break;
                }
              }
              
              Logger.log('Sending email from: ' + senderEmail + ' for deviceId: ' + (data.deviceId || 'not provided'));
              
              var subject = "Your Prestige Labor Solutions Information Package";
              var body = "Thank you for your interest in Prestige Labor Solutions.\n\nPlease find attached our rate sheets and servicing cities information.\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\n" + senderName + "\nPrestige Labor Solutions Team";
              
              // Get all files from the specified folder
              var folderId = "1BVJuLPV1MvZAJlFohxmsmsusgHAbbKMc"; // Folder ID from the provided link
              var folder = DriveApp.getFolderById(folderId);
              var files = folder.getFiles();
              var attachments = [];
              
              // Collect all files from the folder as attachments
              while (files.hasNext()) {
                var file = files.next();
                try {
                  attachments.push(file.getBlob());
                  Logger.log('Added attachment: ' + file.getName());
                } catch (fileError) {
                  Logger.log('Error adding file ' + file.getName() + ': ' + fileError.toString());
                }
              }
              
              if (attachments.length > 0) {
                MailApp.sendEmail({
                  to: recipientEmail,
                  subject: subject,
                  body: body,
                  attachments: attachments,
                  from: senderEmail,
                  name: senderName + " - Prestige Labor Solutions"
                });
                Logger.log('Successfully sent email with ' + attachments.length + ' attachments from ' + senderEmail + ' to: ' + recipientEmail);
              } else {
                Logger.log('No files found in folder to attach. Email not sent.');
              }
            } else {
              Logger.log('Recipient email not found in form data. Cannot send email.');
            }
          } catch (emailError) {
            Logger.log('Error sending email: ' + emailError.toString() + '. Stack: ' + emailError.stack);
            // Decide if you want to alter the main response if email fails.
            // For now, it will still return success for the sheet append.
          }
          // --- END OF ADDED CODE FOR EMAIL ---
          return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'row': newRow }))
            .setMimeType(ContentService.MimeType.JSON);
        } else {
          Logger.log('No data was mapped to newRow. Check headers and incoming data structure.');
          return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'No data mapped to sheet columns.' }))
            .setMimeType(ContentService.MimeType.JSON);
        }
  
      } else {
        Logger.log('No e.postData.contents found in request. Request details: ' + JSON.stringify(e));
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'No data payload (e.postData.contents) found in the request.' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
  
    } catch (scriptError) {
      Logger.log('Error in doPost function: ' + scriptError.toString() + '. Stack: ' + scriptError.stack);
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': 'An error occurred in the script.', 'error': scriptError.toString() }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
```

## Important Notes

1. **Deployment URL**: The deployment URL is unique and must be kept secure. Only share with authorized personnel.

2. **Email Limitations**: 
   - Google has daily email limits (varies by account type)
   - Free Gmail: 500 emails/day
   - Google Workspace: 2000 emails/day

3. **Maintenance**:
   - Check logs weekly for any errors
   - Update device ID mappings as needed
   - Monitor Drive folder for attachment changes

4. **Support**:
   - For script errors: Check Executions log
   - For permission issues: Re-run authorization
   - For email issues: Verify sender addresses in Gmail settings

## Next Steps

After setup is complete:
1. Send the deployment URL to IT/James
2. Test with one iPad first
3. Roll out to all iPads once confirmed working
4. Monitor the first day of use closely

---

Setup completed by: _________________ Date: _________________

Deployment URL: _________________________________________________
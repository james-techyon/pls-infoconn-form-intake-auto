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
              var folderId = "1fuoFQB1PwFpT3SpCuz1cNzM1pUBkP_04"; // Folder ID from the provided link
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
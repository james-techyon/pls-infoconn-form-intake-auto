function doGet(e) {
    Logger.log('Received GET request: ' + JSON.stringify(e));
    
    // Handle alternate submission methods (beacon, JSONP)
    if (e.parameter && (e.parameter.beacon || e.parameter.callback || e.parameter.name)) {
      try {
        // Reconstruct form data from URL parameters
        var formData = {
          name: e.parameter.name || e.parameter.n || '',
          company: e.parameter.company || e.parameter.c || '',
          email: e.parameter.email || e.parameter.e || '',
          phone: e.parameter.phone || e.parameter.p || '',
          timestamp: e.parameter.timestamp || new Date().toISOString(),
          source: e.parameter.source || 'GET Request',
          submissionId: e.parameter.submissionId || e.parameter.t || (Date.now() + '_' + Math.random().toString(36).substring(2, 11)),
          deviceId: e.parameter.deviceId || 'Unknown',
          syncStatus: 'synced'
        };
        
        Logger.log('Processing GET submission: ' + JSON.stringify(formData));
        
        // Process the submission
        var result = processFormSubmission(formData);
        
        // Return appropriate response
        if (e.parameter.callback) {
          // JSONP response
          return ContentService
            .createTextOutput(e.parameter.callback + '(' + JSON.stringify(result) + ')')
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        } else {
          // Plain response for beacon
          return ContentService
            .createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);
        }
      } catch (error) {
        Logger.log('GET request error: ' + error.toString());
        return ContentService
          .createTextOutput(JSON.stringify({result: 'error', message: error.toString()}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    return HtmlService.createHtmlOutput("This script accepts form submissions via POST or GET.");
  }
  
  function doPost(e) {
    Logger.log('Received POST request. Event object: ' + JSON.stringify(e));
    
    try {
      var data;
      
      // Parse the incoming data
      if (e && e.postData && e.postData.contents) {
        try {
          data = JSON.parse(e.postData.contents);
          Logger.log('Parsed JSON data: ' + JSON.stringify(data));
        } catch (parseError) {
          Logger.log('Error parsing JSON: ' + parseError.toString());
          return ContentService.createTextOutput(JSON.stringify({ 
            'result': 'error', 
            'message': 'Invalid JSON data', 
            'error': parseError.toString() 
          })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Add metadata if missing
        data.submissionId = data.submissionId || (Date.now() + '_' + Math.random().toString(36).substring(2, 11));
        data.timestamp = data.timestamp || new Date().toISOString();
        data.syncStatus = 'synced';
        
        // Process the submission
        var result = processFormSubmission(data);
        return ContentService.createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON);
          
      } else {
        Logger.log('No postData.contents found');
        return ContentService.createTextOutput(JSON.stringify({ 
          'result': 'error', 
          'message': 'No data payload found' 
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
    } catch (error) {
      Logger.log('Error in doPost: ' + error.toString() + '. Stack: ' + error.stack);
      return ContentService.createTextOutput(JSON.stringify({ 
        'result': 'error', 
        'message': 'Script error', 
        'error': error.toString() 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  // Centralized function to process form submissions
  function processFormSubmission(data) {
    var sheet;
    var headers;
    var newRow = [];
    
    try {
      var spreadsheetId = '1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc';
      sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
      Logger.log('Active sheet retrieved: ' + sheet.getName());
      
      // Check for duplicate submission
      if (data.submissionId && isDuplicateSubmission(sheet, data.submissionId)) {
        Logger.log('Duplicate submission detected: ' + data.submissionId);
        return { 'result': 'success', 'message': 'Duplicate submission ignored', 'duplicate': true };
      }
      
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      Logger.log('Sheet headers: ' + JSON.stringify(headers));
      
      // Ensure all required columns exist
      var requiredColumns = ['submissionId', 'timestamp', 'source', 'deviceId', 'syncStatus'];
      var missingColumns = requiredColumns.filter(function(col) {
        return headers.indexOf(col) === -1;
      });
      
      if (missingColumns.length > 0) {
        Logger.log('Adding missing columns: ' + missingColumns.join(', '));
        // Add missing columns to the end
        missingColumns.forEach(function(col) {
          headers.push(col);
        });
        // Update the header row
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      }
  
      // Map form data to sheet columns based on headers
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        if (data.hasOwnProperty(header)) {
          newRow.push(data[header]);
        } else {
          newRow.push(''); // Add empty string if data for header is missing
        }
      }
      Logger.log('New row to append: ' + JSON.stringify(newRow));
      
      if (newRow.length > 0) {
        sheet.appendRow(newRow);
        Logger.log('Successfully appended row to sheet.');
        
        // Send email notification
        try {
          var recipientEmail = data.email;
          if (recipientEmail && isValidEmail(recipientEmail)) {
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
                  case "iPad_1749654119869_gojlr3bl2":
                    senderEmail = "Kevin@prestigelaborsolutions.com";
                    senderName = "Kevin";
                    break;
                  case "iPad_1749653704798_kjd48azvq":
                    senderEmail = "Javier@prestigelaborsolutions.com";
                    senderName = "Javier";
                    break;
                  default:
                    // Keep default (Kyle)
                    break;
                }
              }
              
              Logger.log('Sending email from: ' + senderEmail + ' for deviceId: ' + (data.deviceId || 'not provided'));
              
              var subject = "Your Prestige Labor Solutions Information Package";
              var body = "Thank you for your interest in Prestige Labor Solutions.\n\nPlease find attached our rate sheets and servicing cities information.\n\nIf you have any questions, please don't hesitate to reach out to me directly at " + senderEmail + ".\n\nBest regards,\n" + senderName + "\nPrestige Labor Solutions Team\n\n" + senderEmail;
              
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
                // Try to use GmailApp with alias if available
                try {
                  GmailApp.sendEmail(
                    recipientEmail,
                    subject,
                    body,
                    {
                      attachments: attachments,
                      name: senderName + " - Prestige Labor Solutions",
                      replyTo: senderEmail,
                      from: senderEmail // This will only work if Kyle has set up the alias in Gmail
                    }
                  );
                } catch (aliasError) {
                  // Fallback to MailApp if alias not configured
                  Logger.log('Alias not available, using default sender: ' + aliasError.toString());
                  MailApp.sendEmail({
                    to: recipientEmail,
                    subject: subject,
                    body: body,
                    attachments: attachments,
                    name: senderName + " - Prestige Labor Solutions",
                    replyTo: senderEmail
                  });
                }
              Logger.log('Successfully sent email with ' + attachments.length + ' attachments to: ' + recipientEmail);
            } else {
              Logger.log('No files found in folder to attach. Email not sent.');
            }
          } else {
            Logger.log('Invalid or missing recipient email: ' + recipientEmail);
          }
        } catch (emailError) {
          Logger.log('Error sending email: ' + emailError.toString());
          // Continue - don't fail the whole submission due to email error
        }
        
        return { 
          'result': 'success', 
          'message': 'Data saved successfully',
          'submissionId': data.submissionId,
          'timestamp': data.timestamp
        };
        
      } else {
        Logger.log('No data was mapped to newRow.');
        return { 'result': 'error', 'message': 'No data mapped to sheet columns' };
      }
      
    } catch (error) {
      Logger.log('Error in processFormSubmission: ' + error.toString() + '. Stack: ' + error.stack);
      return { 
        'result': 'error', 
        'message': 'Processing error', 
        'error': error.toString() 
      };
    }
  }
  
  // Check if submission already exists
  function isDuplicateSubmission(sheet, submissionId) {
    try {
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var submissionIdCol = headers.indexOf('submissionId');
      
      if (submissionIdCol === -1) {
        return false; // No submissionId column yet
      }
      
      // Check all rows for matching submissionId
      for (var i = 1; i < data.length; i++) {
        if (data[i][submissionIdCol] === submissionId) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      Logger.log('Error checking duplicates: ' + error.toString());
      return false; // Don't block submission on error
    }
  }
  
  // Validate email format
  function isValidEmail(email) {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // Test function to verify script permissions
  function testScriptSetup() {
    try {
      var spreadsheetId = '1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc';
      var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
      Logger.log('Sheet access: SUCCESS - ' + sheet.getName());
      Logger.log('Total rows: ' + sheet.getLastRow());
      
      var folderId = '1fuoFQB1PwFpT3SpCuz1cNzM1pUBkP_04';
      var folder = DriveApp.getFolderById(folderId);
      var fileCount = 0;
      var files = folder.getFiles();
      while (files.hasNext()) {
        files.next();
        fileCount++;
      }
      Logger.log('Drive folder access: SUCCESS - ' + fileCount + ' files found');
      
      return 'Setup verified successfully';
    } catch (error) {
      Logger.log('Setup error: ' + error.toString());
      return 'Error: ' + error.toString();
    }
  }
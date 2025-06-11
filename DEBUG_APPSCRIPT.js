// Add this debug version to help troubleshoot the logging issue

function doPost(e) {
    // Force logging to be visible
    console.log('=== START OF REQUEST ===');
    console.log('Timestamp:', new Date().toISOString());
    
    var sheet;
    var headers;
    var newRow = [];
    var data;
    var debugLog = []; // Collect all debug info
    
    try {
      debugLog.push('Starting doPost execution');
      
      // Log raw request
      debugLog.push('Raw event object: ' + JSON.stringify(e));
      
      var spreadsheetId = '1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc';
      sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
      debugLog.push('Sheet accessed: ' + sheet.getName());
      
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      debugLog.push('Headers found: ' + JSON.stringify(headers));
      
      if (e && e.postData && e.postData.contents) {
        debugLog.push('PostData contents length: ' + e.postData.contents.length);
        
        try {
          data = JSON.parse(e.postData.contents);
          debugLog.push('Parsed data fields: ' + Object.keys(data).join(', '));
          debugLog.push('Full data: ' + JSON.stringify(data));
          
          // Check for required fields
          var requiredFields = ['name', 'email', 'phone', 'company'];
          var missingFields = requiredFields.filter(field => !data[field]);
          if (missingFields.length > 0) {
            debugLog.push('WARNING: Missing required fields: ' + missingFields.join(', '));
          }
          
        } catch (parseError) {
          debugLog.push('JSON Parse Error: ' + parseError.toString());
          throw parseError;
        }
        
        // Map form data to sheet columns
        debugLog.push('Starting column mapping...');
        for (var i = 0; i < headers.length; i++) {
          var header = headers[i];
          if (data.hasOwnProperty(header)) {
            newRow.push(data[header]);
            debugLog.push('Mapped ' + header + ' = ' + data[header]);
          } else {
            newRow.push('');
            debugLog.push('No data for header: ' + header);
          }
        }
        
        debugLog.push('Row to append: ' + JSON.stringify(newRow));
        
        if (newRow.length > 0) {
          sheet.appendRow(newRow);
          debugLog.push('SUCCESS: Row appended to sheet');
          
          // Log to a debug sheet for visibility
          try {
            var debugSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('Debug');
            if (!debugSheet) {
              debugSheet = SpreadsheetApp.openById(spreadsheetId).insertSheet('Debug');
              debugSheet.appendRow(['Timestamp', 'Log']);
            }
            debugSheet.appendRow([new Date().toISOString(), debugLog.join(' | ')]);
          } catch (debugError) {
            console.log('Could not write to debug sheet: ' + debugError.toString());
          }
          
          // Email logic here (removed for clarity)
          
          return ContentService.createTextOutput(JSON.stringify({ 
            'result': 'success', 
            'row': newRow,
            'debug': debugLog 
          })).setMimeType(ContentService.MimeType.JSON);
        }
        
      } else {
        debugLog.push('ERROR: No postData.contents found');
      }
      
    } catch (error) {
      debugLog.push('CRITICAL ERROR: ' + error.toString());
      console.error('Full error:', error);
      
      return ContentService.createTextOutput(JSON.stringify({ 
        'result': 'error', 
        'message': error.toString(),
        'debug': debugLog 
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

// Test function to verify script is working
function testLogging() {
  console.log('Test log entry at: ' + new Date().toISOString());
  Logger.log('Logger test at: ' + new Date().toISOString());
  
  // Try to write to sheet to confirm permissions
  try {
    var spreadsheetId = '1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc';
    var sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
    var lastRow = sheet.getLastRow();
    console.log('Sheet has ' + lastRow + ' rows');
    return 'Success - Sheet accessible';
  } catch (error) {
    console.error('Error accessing sheet: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}
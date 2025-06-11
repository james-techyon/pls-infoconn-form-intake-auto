# Fix Google Sheet Connection in Apps Script

## The Problem
The Apps Script is sending emails but not updating the sheet because it's not connected to the new Google Sheet.

## Solution

### Step 1: Connect to the Correct Spreadsheet

1. **Open Kyle's Apps Script Project**
   - Sign in as Kyle@prestigelaborsolutions.com
   - Go to https://script.google.com
   - Open your project

2. **Replace the getActiveSpreadsheet() method**
   
   Find this line (around line 17):
   ```javascript
   sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
   ```

   Replace it with:
   ```javascript
   // Use the specific spreadsheet ID
   var spreadsheetId = '1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc';
   sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
   ```

### Step 2: Alternative Method - Container Binding

If the above doesn't work, create a container-bound script:

1. **Open the Google Sheet**
   - Go to: https://docs.google.com/spreadsheets/d/1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc/

2. **Create Script from Sheet**
   - Click Extensions → Apps Script
   - This creates a script bound to this sheet
   - Copy all the code from appscript.js
   - Deploy as web app
   - Update the webhook URL in your form

### Step 3: Verify Permissions

1. **Run the doPost function manually**
   - In the Apps Script editor
   - Select "doPost" from dropdown
   - Click "Run"
   - Accept any permission prompts

2. **Check for these permissions:**
   - View and manage spreadsheets
   - Send email as you
   - View and manage Drive files

### Step 4: Test with Debug Code

Add this debug version to test the connection:

```javascript
function testSheetConnection() {
  try {
    // Test 1: Open specific spreadsheet
    var spreadsheetId = '1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc';
    var spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    Logger.log('Spreadsheet name: ' + spreadsheet.getName());
    
    // Test 2: Get sheet
    var sheet = spreadsheet.getActiveSheet();
    Logger.log('Sheet name: ' + sheet.getName());
    
    // Test 3: Get headers
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log('Headers: ' + JSON.stringify(headers));
    
    // Test 4: Try to append a test row
    var testRow = ['TEST', 'TEST COMPANY', '(555) 555-5555', 'test@test.com', 'Test Source', new Date().toISOString(), 'TEST_DEVICE_ID'];
    sheet.appendRow(testRow);
    Logger.log('Test row appended successfully');
    
    return 'All tests passed!';
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return 'Error: ' + error.toString();
  }
}
```

Run this function and check the logs to see what's failing.

### Step 5: Common Issues and Fixes

1. **"Cannot read property 'getActiveSheet' of null"**
   - The script isn't connected to any spreadsheet
   - Use the openById method with the specific ID

2. **"You do not have permission to access the requested document"**
   - Kyle doesn't have access to the spreadsheet
   - Share the spreadsheet with Kyle@prestigelaborsolutions.com as Editor

3. **"Exception: The script does not have permission to perform that action"**
   - Re-run the authorization flow
   - Make sure all permissions are granted

## Quick Fix - Updated Code

Here's the complete updated doPost function with the fix:

```javascript
function doPost(e) {
    // Log the entire event object to see what's coming in
    Logger.log('Received POST request. Event object: ' + JSON.stringify(e));
  
    var sheet;
    var headers;
    var newRow = [];
    var data;
  
    try {
      // CHANGED: Use specific spreadsheet ID instead of getActiveSpreadsheet
      var spreadsheetId = '1rS4v56_fza4F1B-wuBz4VXG2tM2fmk2NRh1t6jMQCLc';
      sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
      Logger.log('Active sheet retrieved: ' + sheet.getName());
  
      // Rest of your code remains the same...
```

This should fix the issue and allow both email sending and sheet updating to work properly.
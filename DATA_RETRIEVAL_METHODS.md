# Data Retrieval Methods for On-Device Submissions

## Overview
This document outlines various methods to retrieve form submissions stored on iPads when the admin panel is not accessible or when you need to extract data programmatically.

## Method 1: Browser Developer Console (Recommended)
This is the most straightforward method for technical users.

### Steps:
1. Open the PWA in Safari on the iPad
2. Connect iPad to Mac and enable Web Inspector:
   - On iPad: Settings > Safari > Advanced > Web Inspector (ON)
   - On Mac: Safari > Preferences > Advanced > Show Develop menu
3. On Mac Safari: Develop > [Your iPad] > [PWA Page]
4. In the console, run these commands:

```javascript
// Get all leads from primary storage
const leads = JSON.parse(localStorage.getItem('prestige_infocomm_leads') || '[]');
console.log('Total leads:', leads.length);
console.table(leads);

// Get all leads from backup storage
const backupLeads = JSON.parse(localStorage.getItem('prestige_infocomm_leads_backup') || '[]');
console.log('Backup leads:', backupLeads.length);

// Export as JSON
copy(JSON.stringify(leads, null, 2));

// Export as CSV
const csv = [
    ['Name', 'Company', 'Email', 'Phone', 'Timestamp', 'Device ID', 'Sync Status'],
    ...leads.map(l => [l.name, l.company, l.email, l.phone, l.timestamp, l.deviceId, l.syncStatus])
].map(row => row.join(',')).join('\n');
console.log(csv);
copy(csv);
```

## Method 2: JavaScript Bookmarklet
Create a bookmarklet that can be run directly on the iPad.

### Setup:
1. Create a new bookmark in Safari
2. Edit the bookmark and set the URL to:

```javascript
javascript:(function(){const leads=JSON.parse(localStorage.getItem('prestige_infocomm_leads')||'[]');const csv=[['Name','Company','Email','Phone','Timestamp','Device ID','Sync Status'],...leads.map(l=>[l.name,l.company,l.email,l.phone,l.timestamp,l.deviceId,l.syncStatus])].map(row=>row.join(',')).join('\n');const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='leads_export_'+new Date().toISOString()+'.csv';a.click();})();
```

3. Run the bookmarklet while on the PWA page to download a CSV file

## Method 3: IndexedDB Access
If localStorage is corrupted or inaccessible, data may still be in IndexedDB.

```javascript
// Open IndexedDB
const request = indexedDB.open('PrestigeLeadsDB', 1);

request.onsuccess = function(event) {
    const db = event.target.result;
    const transaction = db.transaction(['leads'], 'readonly');
    const objectStore = transaction.objectStore('leads');
    const getAllRequest = objectStore.getAll();
    
    getAllRequest.onsuccess = function() {
        const leads = getAllRequest.result;
        console.log('IndexedDB leads:', leads);
        console.table(leads);
    };
};
```

## Method 4: Manual Sync to Google Sheets
Force a manual sync of all pending leads:

```javascript
// Get all pending leads
const leads = JSON.parse(localStorage.getItem('prestige_infocomm_leads') || '[]');
const pendingLeads = leads.filter(lead => lead.syncStatus === 'pending');

// Sync each lead
for (const lead of pendingLeads) {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbwuia7M7CxVgB1kYhkSmxYEsVPomWxyO8gc4TegDDI31uDVYztdyMwyWZxp2iAID-py/exec', {
            method: 'POST',
            headers: {'Content-Type': 'text/plain'},
            body: JSON.stringify(lead)
        });
        
        if (response.ok || response.status === 0) {
            console.log('Synced:', lead.name);
            lead.syncStatus = 'synced';
        }
    } catch (error) {
        console.error('Sync failed for:', lead.name, error);
    }
}

// Update localStorage
localStorage.setItem('prestige_infocomm_leads', JSON.stringify(leads));
```

## Method 5: Emergency Data Recovery Script
If the admin panel is completely broken, inject this recovery script:

```javascript
(function() {
    // Create recovery UI
    const recovery = document.createElement('div');
    recovery.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:white;z-index:9999;padding:20px;overflow:auto';
    
    // Get all data sources
    const primaryLeads = JSON.parse(localStorage.getItem('prestige_infocomm_leads') || '[]');
    const backupLeads = JSON.parse(localStorage.getItem('prestige_infocomm_leads_backup') || '[]');
    
    recovery.innerHTML = `
        <h1>Data Recovery</h1>
        <p>Primary Storage: ${primaryLeads.length} leads</p>
        <p>Backup Storage: ${backupLeads.length} leads</p>
        <textarea style="width:100%;height:400px">${JSON.stringify(primaryLeads, null, 2)}</textarea>
        <button onclick="navigator.clipboard.writeText(this.previousElementSibling.value)">Copy to Clipboard</button>
    `;
    
    document.body.appendChild(recovery);
})();
```

## Method 6: Device ID Lookup
To find which iPad collected specific leads:

```javascript
// Get device ID
const deviceId = localStorage.getItem('device_id');
console.log('This device ID:', deviceId);

// Known device mappings
const deviceMap = {
    'iPad_1749611604926_nh392j54n': 'Javier',
    'iPad_1749611914823_7v34blcwk': 'Kevin',
    'iPad_1749611297458_qbixv7jwg': 'Kyle',
    'iPad_1749654119869_gojlr3bl2': 'Kevin',
    'iPad_1749653704798_kjd48azvq': 'Javier'
};

console.log('This device belongs to:', deviceMap[deviceId] || 'Unknown');
```

## Best Practices

1. **Regular Exports**: Export data daily during the event
2. **Multiple Backups**: Use both admin panel exports and console methods
3. **Test Recovery**: Test these methods before the event starts
4. **Document Device IDs**: Keep a record of which iPad has which device ID
5. **Monitor Sync Status**: Check for leads stuck in 'pending' status

## Troubleshooting

### Common Issues:
- **localStorage quota exceeded**: Clear synced leads regularly
- **CORS errors**: Use the beacon method or manual CSV export
- **Missing data**: Check both primary and backup storage keys
- **Sync failures**: Check network connectivity and Google Sheets permissions

### Emergency Contacts:
- For technical issues with data retrieval, these methods should cover all scenarios
- Always test recovery methods before the event begins
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a lead capture landing page for Prestige Labor Solutions (PLS) specifically designed for the InfoComm Orlando 2025 event. It's a single-page web application that collects visitor information and submits it to a Google Apps Script endpoint.

## Architecture

The project consists of:
- `index.html`: Single HTML file containing all HTML, CSS, and JavaScript
- `PLS Logo SVF.svg`: Company logo asset
- `notes.md`: Contains the Google Apps Script webhook URL for form submissions

### Key Components

1. **Offline-First Form Submission**:
   - All submissions are saved locally first using localStorage
   - Dual storage system with primary and backup localStorage keys
   - IndexedDB provides additional redundancy
   - Automatic background sync every 30 seconds when online
   - Each lead has unique ID and sync status tracking
   - Device ID tracking for multi-iPad deployments

2. **Form Submission Flow**:
   - User fills out form with name, company, phone, and email
   - Data is ALWAYS saved locally first (offline-first approach)
   - If online, attempts to sync to Google Apps Script endpoint
   - Endpoint URL: `https://script.google.com/macros/s/AKfycbx9Bz0FJwN2KInf5wF_813vCGic0YmlQ-xol-FFlT0gXqRUlowuGm_ilVO8GyXYpr6reQ/exec`
   - Data is sent as JSON with Content-Type: text/plain (for CORS compatibility)
   - Visual feedback shows sync status to users

3. **Frontend Features**:
   - Animated background with grid lines
   - Phone number auto-formatting
   - Loading states and success messages
   - Responsive design for mobile devices
   - CSS animations and transitions
   - Auto-reset after 5 seconds for kiosk mode
   - Hidden admin panel (triple-tap logo to access)

## Development Commands

This is a static HTML project with no build process. To develop:
- Open `index.html` directly in a browser
- Use a local web server (e.g., `python -m http.server 8000` or VS Code Live Server) for testing
- No build, lint, or test commands required

## Important Considerations

- The form submission endpoint is hardcoded in the JavaScript (line 579 and 641 of index.html)
- CORS is handled by using 'text/plain' content type when posting to Google Apps Script
- No external dependencies or build tools required
- All styling and functionality is contained within the single HTML file
- Form data includes automatic timestamp and source tracking ('InfoComm Orlando 2025')
- Google Analytics integration ready (checks for gtag presence)

## Admin Panel Access

Triple-tap the logo to access the hidden admin panel which provides:

- View all stored leads with sync status
- Export leads to CSV file
- Manual sync trigger
- Clear synced leads from local storage
- Device ID tracking
- Lead count statistics

## Offline Capabilities

- All form submissions are saved locally first
- Automatic sync attempts every 30 seconds when online
- Visual indicator when data is saved offline
- Dual localStorage keys for redundancy
- IndexedDB as additional backup layer
- Unique device IDs for tracking which iPad collected each lead

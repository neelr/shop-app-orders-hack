# Shop.app Deliveries Tracker Extension

A Chrome extension that adds an "Orders" navigation item to Shop.app and displays your delivery information in a clean, organized table.

## Features

- Adds "Orders" link to Shop.app navigation bar
- Fetches and displays your deliveries and order information
- Shows delivery status, tracking links, ETAs, and more
- Responsive table design with summary cards
- Auto-refresh functionality

## Installation Instructions

### Step 1: Generate Icons
1. Open `generate-icons.html` in your browser
2. Click each "Download" button to save the PNG icons
3. Save them in the `shop-deliveries-extension` folder with the exact names:
   - `icon-16.png`
   - `icon-48.png`
   - `icon-128.png`

### Step 2: Install the Extension in Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" using the toggle in the top-right corner
3. Click "Load unpacked"
4. Select the `shop-deliveries-extension` folder
5. The extension will now be installed and active

### Step 3: Use the Extension
1. Go to [shop.app](https://shop.app)
2. You'll see a new "Orders" link in the navigation bar (between "Explore" and the agent button)
3. Click on "Orders" or navigate to `https://shop.app/orders`
4. Your deliveries will be fetched and displayed in a table

## What the Extension Shows

The orders table displays:
- Order number
- Shop name
- Delivery/item name
- Current status and state
- Carrier information
- Tracking links (clickable)
- Estimated delivery dates
- Delivered date (if applicable)
- Order total

Summary cards show:
- Total number of orders
- Number of delivered items
- Number of items in transit

## Features

- **Auto-detects Shop.app pages**: Works on all shop.app URLs
- **Seamless integration**: The Orders link matches Shop.app's design
- **Real-time data**: Fetches current delivery information from Shop.app's API
- **Responsive design**: Works on different screen sizes
- **Refresh button**: Update the data without reloading the page

## Troubleshooting

If the extension doesn't work:
1. Make sure you're logged into Shop.app
2. Check that the extension is enabled in Chrome
3. Try refreshing the page
4. Check the browser console for any error messages

## Privacy & Security

- The extension only runs on shop.app domains
- It uses your existing Shop.app session cookies
- No data is stored or sent to third parties
- All requests go directly to Shop.app's API

## Files

- `manifest.json` - Chrome extension configuration
- `content.js` - Main JavaScript that adds the Orders link and fetches data
- `styles.css` - Styling for the orders table and UI elements
- `icon.svg` - Source icon design
- `generate-icons.html` - Helper to create PNG icons from SVG
- `README.md` - This file# shop-app-orders-hack

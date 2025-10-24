# Extension Update Instructions

## The Issue
The extension was successfully fetching data but not displaying the table because Shop.app shows a 404 "Page not found" error when navigating to `/orders`, and the extension wasn't properly replacing that content.

## What Was Fixed
1. **More aggressive content replacement**: The extension now actively finds and hides the 404 error page content
2. **Better timing**: Added delays to ensure React has finished rendering before injecting our content
3. **Multiple detection methods**: Added mutation observers to detect when the 404 page appears
4. **Console logging**: Added detailed console logs to help debug issues

## How to Update the Extension

1. **Reload the Extension**:
   - Go to `chrome://extensions/`
   - Find "Shop.app Deliveries Tracker"
   - Click the refresh/reload button on the extension card

2. **Clear Cache & Hard Reload**:
   - Go to shop.app
   - Open Developer Tools (F12 or right-click → Inspect)
   - Right-click the reload button in Chrome
   - Select "Empty Cache and Hard Reload"

3. **Test the Extension**:
   - Navigate to shop.app
   - Click the "Orders" link in the navigation
   - Open the Console (F12 → Console tab) to see debug messages
   - You should see messages like:
     - `[Shop Deliveries Extension] Handling orders page...`
     - `[Shop Deliveries Extension] Injecting orders content...`
     - `[Shop Deliveries Extension] Fetching deliveries...`
     - `[Shop Deliveries Extension] Orders table rendered`

## If It Still Doesn't Work

Check the console for any error messages and look for:
1. Whether the fetch was successful (you mentioned it was)
2. Whether the extension logs appear
3. Any JavaScript errors

## Manual Trigger (Fallback)

If the table still doesn't appear, you can manually trigger it in the console:
```javascript
// Run this in the console on shop.app/orders
document.querySelectorAll('section').forEach(s => {
  if (s.textContent.includes('Page not found')) s.style.display = 'none';
});

// Then check if the orders-content div was created
document.getElementById('orders-content')
```

## Key Changes Made

- Content injection now waits 100ms for React to render
- 404 error sections are hidden instead of removed (more reliable)
- Added mutation observer for dynamic content changes
- Better element selection for content placement
- Added console logging throughout for debugging
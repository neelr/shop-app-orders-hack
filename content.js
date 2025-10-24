// Add Orders navigation item to Shop.app header
function addOrdersNavigation() {
  // Wait for the navigation to be ready
  const checkAndAddNav = () => {
    // Skip if Orders link already exists
    if (document.querySelector('a[data-testid="HeaderLink-Orders"]')) {
      // Update active state if needed
      const ordersLink = document.querySelector('a[data-testid="HeaderLink-Orders"]');
      const p = ordersLink?.querySelector('p');
      if (p) {
        if (window.location.pathname === '/orders') {
          p.classList.remove('opacity-50');
        } else {
          p.classList.add('opacity-50');
        }
      }
      return;
    }

    // Try multiple selectors to find where to insert the Orders link
    let insertAfterElement = null;
    let insertionMethod = null;

    // Option 1: After Explore link (normal case)
    const exploreLink = document.querySelector('a[data-testid="HeaderLink-Explore"]');
    if (exploreLink) {
      insertAfterElement = exploreLink;
      insertionMethod = 'afterExplore';
    }

    // Option 2: After Home link if Explore doesn't exist
    if (!insertAfterElement) {
      const homeLink = document.querySelector('a[data-testid="HeaderLink-Home"]');
      if (homeLink) {
        insertAfterElement = homeLink;
        insertionMethod = 'afterHome';
      }
    }

    // Option 3: Inside the nav container with Shop logo
    if (!insertAfterElement) {
      const logoLink = document.querySelector('a[data-testid="ShopLogoLink"]');
      if (logoLink && logoLink.parentElement) {
        insertAfterElement = logoLink;
        insertionMethod = 'afterLogo';
      }
    }

    if (insertAfterElement) {
      // Create Orders link similar to existing nav items
      const ordersLink = document.createElement('a');
      ordersLink.setAttribute('data-testid', 'HeaderLink-Orders');
      ordersLink.className = 'max-lg:hidden';
      ordersLink.setAttribute('aria-label', 'Orders');
      ordersLink.href = '/orders';
      ordersLink.setAttribute('data-discover', 'true');

      const p = document.createElement('p');
      p.className = 'font-bodyLarge text-bodyLarge text-text';
      p.textContent = 'Orders';

      // Set active state
      if (window.location.pathname === '/orders') {
        // Active state - no opacity
      } else {
        p.classList.add('opacity-50');
      }

      ordersLink.appendChild(p);

      // Insert the link
      insertAfterElement.insertAdjacentElement('afterend', ordersLink);

      console.log(`[Shop Deliveries Extension] Orders link added (${insertionMethod})`);
    }
  };

  // Try immediately and also observe for dynamic changes
  checkAndAddNav();

  // For /orders page, try more aggressively since we're on a 404 page
  if (window.location.pathname === '/orders') {
    // Try every 200ms for the first 3 seconds
    const intervalId = setInterval(checkAndAddNav, 200);
    setTimeout(() => clearInterval(intervalId), 3000);
  }

  // Use MutationObserver in case the header is dynamically loaded
  const observer = new MutationObserver(checkAndAddNav);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Stop observing after a reasonable time
  setTimeout(() => observer.disconnect(), 10000);
}

// Function to fetch deliveries data
async function fetchDeliveries() {
  try {
    const response = await fetch("https://shop.app/web/api/graphql", {
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
        "x-graphql-operation-name": "DeliveriesOrdersListQuery"
      },
      body: JSON.stringify({
        operationName: "DeliveriesOrdersListQuery",
        variables: {
          first: 20
        },
        query: `query DeliveriesOrdersListQuery($first: Int, $after: String) {
          deliveriesOrdersList(first: $first, after: $after) {
            nodes {
              __typename
              ... on Order {
                id
                orderNumber
                createdAt
                totalPrice {
                  amount
                  currencyCode
                }
                shop {
                  id
                  name
                }
                deliveryStatus
                shippingMethod
                lineItems {
                  nodes {
                    image {
                      url
                      altText
                    }
                  }
                }
                trackers {
                  nodes {
                    id
                    trackingUrl
                    carrierInfo {
                      name
                    }
                  }
                }
                deliveries {
                  nodes {
                    id
                    name
                    status
                    state
                    deliveredAt
                    originalEtaInfo {
                      formattedEta
                      isFuture
                    }
                  }
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }`
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching deliveries:', error);
    throw error;
  }
}

// Function to create and display the orders table
function createOrdersTable(data) {
  const container = document.createElement('div');
  container.className = 'orders-container';

  // Create header
  const header = document.createElement('div');
  header.className = 'orders-header';
  header.innerHTML = `
    <h1>Orders</h1>
    <button id="refresh-orders" class="refresh-btn">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
      </svg>
      Refresh
    </button>
  `;
  container.appendChild(header);

  // Process data into table rows
  const tableData = [];

  if (data.data?.deliveriesOrdersList?.nodes) {
    data.data.deliveriesOrdersList.nodes.forEach((order, i) => {
      const trackers = order.trackers?.nodes || [];
      const deliveries = order.deliveries?.nodes || [];
      const imageUrl = order.lineItems?.nodes?.[0]?.image?.url || null;
      const imageAlt = order.lineItems?.nodes?.[0]?.image?.altText || 'Product image';

      if (deliveries.length > 0) {
        deliveries.forEach((delivery, j) => {
          const tracker = trackers[j] || trackers[0];
          tableData.push({
            index: `${i + 1}.${j + 1}`,
            orderNumber: order.orderNumber,
            shop: order.shop?.name || 'N/A',
            imageUrl: imageUrl,
            imageAlt: imageAlt,
            delivery: delivery.name || 'N/A',
            status: delivery.status,
            state: delivery.state,
            carrier: tracker?.carrierInfo?.name || 'N/A',
            trackingUrl: tracker?.trackingUrl || null,
            eta: delivery.originalEtaInfo?.formattedEta || 'N/A',
            isFuture: delivery.originalEtaInfo?.isFuture,
            deliveredAt: delivery.deliveredAt,
            total: `${order.totalPrice.amount} ${order.totalPrice.currencyCode}`,
            createdAt: order.createdAt
          });
        });
      } else {
        const tracker = trackers[0];
        tableData.push({
          index: i + 1,
          orderNumber: order.orderNumber,
          shop: order.shop?.name || 'N/A',
          imageUrl: imageUrl,
          imageAlt: imageAlt,
          delivery: 'No deliveries',
          status: order.deliveryStatus || 'N/A',
          state: 'N/A',
          carrier: tracker?.carrierInfo?.name || 'N/A',
          trackingUrl: tracker?.trackingUrl || null,
          eta: 'N/A',
          isFuture: null,
          deliveredAt: null,
          total: `${order.totalPrice.amount} ${order.totalPrice.currencyCode}`,
          createdAt: order.createdAt
        });
      }
    });
  }

  // Create table
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'table-wrapper';

  const table = document.createElement('table');
  table.className = 'orders-table';

  // Create table header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Image</th>
      <th>Order #</th>
      <th>Shop</th>
      <th>Item/Delivery</th>
      <th>Status</th>
      <th>State</th>
      <th>Carrier</th>
      <th>Tracking</th>
      <th>ETA</th>
      <th>Delivered</th>
      <th>Total</th>
    </tr>
  `;
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');

  tableData.forEach(row => {
    const tr = document.createElement('tr');

    // Format delivered date
    let deliveredText = 'Not yet';
    if (row.deliveredAt) {
      const date = new Date(row.deliveredAt);
      deliveredText = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }

    // Format ETA
    let etaText = row.eta;
    if (row.isFuture !== null) {
      etaText = `${row.eta} ${row.isFuture ? '(Future)' : '(Past)'}`;
    }

    // Create tracking link
    let trackingCell = 'No';
    if (row.trackingUrl) {
      trackingCell = `<a href="${row.trackingUrl}" target="_blank" class="tracking-link">Track</a>`;
    }

    // Set status class (case-insensitive comparison)
    let statusClass = 'status-pending';
    const statusLower = (row.status || '').toLowerCase();
    const stateLower = (row.state || '').toLowerCase();

    if (statusLower === 'delivered' || stateLower === 'delivered' ||
        statusLower.includes('delivered') || stateLower.includes('delivered')) {
      statusClass = 'status-delivered';
    } else if (statusLower === 'in_transit' || stateLower === 'in_transit' ||
               statusLower === 'shipped' || stateLower === 'shipped' ||
               statusLower.includes('transit') || stateLower.includes('transit') ||
               statusLower.includes('shipped') || stateLower.includes('shipped')) {
      statusClass = 'status-transit';
    }

    // Create image cell
    let imageCell = '<div class="product-image-placeholder">No image</div>';
    if (row.imageUrl) {
      imageCell = `<img src="${row.imageUrl}" alt="${row.imageAlt}" class="product-image" />`;
    }

    tr.innerHTML = `
      <td>${row.index}</td>
      <td class="image-cell">${imageCell}</td>
      <td class="order-number">${row.orderNumber}</td>
      <td>${row.shop}</td>
      <td>${row.delivery}</td>
      <td><span class="status-badge ${statusClass}">${row.status}</span></td>
      <td>${row.state}</td>
      <td>${row.carrier}</td>
      <td>${trackingCell}</td>
      <td>${etaText}</td>
      <td>${deliveredText}</td>
      <td class="total">${row.total}</td>
    `;

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);

  // Add summary section
  const summary = document.createElement('div');
  summary.className = 'orders-summary';

  const totalOrders = new Set(tableData.map(r => r.orderNumber)).size;
  const deliveredCount = tableData.filter(r => {
    const status = (r.status || '').toLowerCase();
    const state = (r.state || '').toLowerCase();
    return status === 'delivered' || state === 'delivered' ||
           status.includes('delivered') || state.includes('delivered');
  }).length;
  const inTransitCount = tableData.filter(r => {
    const status = (r.status || '').toLowerCase();
    const state = (r.state || '').toLowerCase();
    return status === 'in_transit' || state === 'in_transit' ||
           status === 'shipped' || state === 'shipped' ||
           status.includes('transit') || state.includes('transit') ||
           status.includes('shipped') || state.includes('shipped');
  }).length;

  summary.innerHTML = `
    <div class="summary-card">
      <h3>Total Orders</h3>
      <p>${totalOrders}</p>
    </div>
    <div class="summary-card delivered-card">
      <h3>Delivered</h3>
      <p class="delivered-count">${deliveredCount}</p>
    </div>
    <div class="summary-card">
      <h3>In Transit</h3>
      <p>${inTransitCount}</p>
    </div>
  `;

  container.appendChild(summary);

  return container;
}

// Function to show loading state
function showLoading() {
  const container = document.createElement('div');
  container.className = 'orders-loading';
  container.innerHTML = `
    <div class="spinner"></div>
    <p>Loading your orders...</p>
  `;
  return container;
}

// Function to show error state
function showError(error) {
  const container = document.createElement('div');
  container.className = 'orders-error';
  container.innerHTML = `
    <h2>Unable to load orders</h2>
    <p>${error.message || 'Please try again later'}</p>
    <button id="retry-orders" class="retry-btn">Retry</button>
  `;
  return container;
}

// Main function to handle orders page
async function handleOrdersPage() {
  if (window.location.pathname !== '/orders') return;

  console.log('[Shop Deliveries Extension] Handling orders page...');

  // Update page title and keep it updated
  const setOrdersTitle = () => {
    if (document.title !== 'Orders - Shop') {
      document.title = 'Orders - Shop';
    }
  };

  // Set title immediately
  setOrdersTitle();

  // Keep monitoring and fixing the title
  const titleObserver = new MutationObserver(setOrdersTitle);
  titleObserver.observe(document.querySelector('title') || document.head, {
    childList: true,
    characterData: true,
    subtree: true
  });

  // Also use interval as backup
  const titleInterval = setInterval(setOrdersTitle, 500);

  // Stop monitoring after 10 seconds to avoid performance issues
  setTimeout(() => {
    titleObserver.disconnect();
    clearInterval(titleInterval);
  }, 10000);

  // Wait a moment for React to render the page
  setTimeout(() => {
    // Check if we already have our content
    if (document.getElementById('orders-content')) {
      console.log('[Shop Deliveries Extension] Orders content already exists');
      return;
    }

    console.log('[Shop Deliveries Extension] Injecting orders content...');

    // Find and hide/remove the 404 error content
    const errorSections = document.querySelectorAll('section');
    errorSections.forEach(section => {
      // Check for 404 page indicators
      const hasPageNotFound = section.textContent.includes('Page not found');
      const hasCouldntFind = section.textContent.includes("couldn't find the page");
      const hasVisitShop = section.textContent.includes("Visit Shop's website");

      if (hasPageNotFound || hasCouldntFind || hasVisitShop) {
        section.style.display = 'none';
      }
    });

    // Hide the bottom navigation bar if it exists
    const bottomNav = document.querySelector('nav.fixed.bottom-0');
    if (bottomNav) {
      bottomNav.style.display = 'none';
    }

    // Hide any notification toasts
    const toastRegion = document.querySelector('[aria-label="Notifications (F8)"]');
    if (toastRegion) {
      toastRegion.style.display = 'none';
    }

    // Create our content area
    const contentArea = document.createElement('div');
    contentArea.id = 'orders-content';
    contentArea.style.position = 'relative';
    contentArea.style.minHeight = 'calc(100vh - 80px)';

    // Find the header and insert our content after it
    const header = document.querySelector('[data-testid="HeaderWrapper"]');
    if (header) {
      // Insert right after the header
      header.insertAdjacentElement('afterend', contentArea);
    } else {
      // Fallback: prepend to body
      document.body.prepend(contentArea);
    }

    // Load the orders immediately
    loadOrders();
  }, 100);

  async function loadOrders() {
    const contentArea = document.getElementById('orders-content');
    if (!contentArea) return;

    contentArea.innerHTML = '';
    contentArea.appendChild(showLoading());

    try {
      console.log('[Shop Deliveries Extension] Fetching deliveries...');
      const data = await fetchDeliveries();
      console.log('[Shop Deliveries Extension] Deliveries data received:', data);

      contentArea.innerHTML = '';
      const ordersTable = createOrdersTable(data);
      contentArea.appendChild(ordersTable);
      console.log('[Shop Deliveries Extension] Orders table rendered');

      // Add refresh button handler
      document.getElementById('refresh-orders')?.addEventListener('click', loadOrders);

    } catch (error) {
      console.error('Error loading orders:', error);
      contentArea.innerHTML = '';
      contentArea.appendChild(showError(error));

      // Add retry button handler
      document.getElementById('retry-orders')?.addEventListener('click', loadOrders);
    }
  }

  loadOrders();
}

// Initialize extension
function initializeExtension() {
  // Add orders navigation to all shop.app pages
  addOrdersNavigation();

  // Handle orders page
  handleOrdersPage();

  // Also check for orders page on any DOM changes
  if (window.location.pathname === '/orders') {
    // Set up an observer specifically for the orders page
    const ordersObserver = new MutationObserver((mutations) => {
      // Check if we need to inject our content
      const hasOurContent = document.getElementById('orders-content');
      const hasErrorContent = Array.from(document.querySelectorAll('h1')).some(h1 =>
        h1.textContent.includes('Page not found')
      );

      if (!hasOurContent && hasErrorContent) {
        handleOrdersPage();
      }
    });

    ordersObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Stop observing after 5 seconds to prevent performance issues
    setTimeout(() => ordersObserver.disconnect(), 5000);
  }

  // Listen for navigation changes (SPA)
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      addOrdersNavigation();
      handleOrdersPage();
    }
  }).observe(document, { subtree: true, childList: true });
}

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}
// Dashboard State Management
const dashboardState = {
    currentPage: 'dashboard',
    theme: localStorage.getItem('theme') || 'light',
    settings: JSON.parse(localStorage.getItem('settings')) || {
        darkMode: false,
        emailNotifications: true,
        autoRefresh: false
    },
    products: [],
    orders: [],
    activities: []
};

// DOM Elements Cache
const elements = {
    mainContent: null,
    navigation: null,
    themeToggle: null,
    notification: null
};

// Initialize Dashboard
function initDashboard() {
    cacheElements();
    setupEventListeners();
    loadInitialData();
    setupRouter();
    applyTheme();
    showPage('dashboard');
}

// Cache frequently used DOM elements
function cacheElements() {
    elements.mainContent = document.querySelector('main');
    elements.navigation = document.querySelector('.nav-menu-center');
    elements.themeToggle = document.getElementById('theme-toggle');
    elements.notification = document.getElementById('notification');
}

// Setup event listeners
function setupEventListeners() {
    // Theme toggle
    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', toggleTheme);
    }

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Quick action buttons
    document.querySelectorAll('.card-hover[onclick]').forEach(button => {
        const originalClick = button.getAttribute('onclick');
        button.removeAttribute('onclick');
        button.addEventListener('click', function() {
            eval(originalClick);
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', handleSmoothScroll);
    });

    // Responsive menu (for mobile)
    setupResponsiveMenu();
}

// Handle navigation
function handleNavigation(event) {
    event.preventDefault();
    const target = event.target.closest('a');
    const page = target.getAttribute('href').replace('.html', '');
    
    if (page.startsWith('#')) {
        handleSmoothScroll(event);
    } else {
        showPage(page);
        updateBrowserHistory(page);
    }
}

// Single Page Application Router
function setupRouter() {
    // Handle browser back/forward
    window.addEventListener('popstate', function(event) {
        if (event.state && event.state.page) {
            showPage(event.state.page);
        }
    });

    // Handle direct URL access
    const currentPath = window.location.pathname.split('/').pop();
    if (currentPath && currentPath !== 'dashboard.html') {
        const page = currentPath.replace('.html', '');
        showPage(page);
    }
}

// Show specific page
function showPage(pageName) {
    dashboardState.currentPage = pageName;
    
    // Hide all page sections
    document.querySelectorAll('[data-page]').forEach(section => {
        section.style.display = 'none';
    });

    // Show current page
    const currentPageSection = document.querySelector(`[data-page="${pageName}"]`);
    if (currentPageSection) {
        currentPageSection.style.display = 'block';
        currentPageSection.classList.add('animate-fade-in');
        
        // Load page-specific data
        loadPageData(pageName);
    }

    // Update active navigation
    updateActiveNavigation(pageName);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

// Update browser history
function updateBrowserHistory(page) {
    const state = { page: page };
    const title = `${page.charAt(0).toUpperCase() + page.slice(1)} - Naturialis`;
    const url = `${page}.html`;
    
    history.pushState(state, title, url);
    document.title = title;
}

// Update active navigation state
function updateActiveNavigation(activePage) {
    document.querySelectorAll('.nav-link').forEach(link => {
        const linkPage = link.getAttribute('href').replace('.html', '');
        if (linkPage === activePage) {
            link.classList.add('active');
            link.style.color = '#ffd700';
        } else {
            link.classList.remove('active');
            link.style.color = '';
        }
    });
}

// Load page-specific data
function loadPageData(pageName) {
    switch (pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'view-orders':
            loadOrdersData();
            break;
        case 'settings':
            loadSettingsData();
            break;
    }
}

// Load dashboard data
function loadDashboardData() {
    if (dashboardState.products.length === 0) {
        loadLatestProducts();
    }
    if (dashboardState.activities.length === 0) {
        loadRecentActivities();
    }
    updateStatistics();
}

// Load orders data
function loadOrdersData() {
    // Simulated orders data
    if (dashboardState.orders.length === 0) {
        dashboardState.orders = [
            {
                id: 'ORD-001',
                customer: 'John Doe',
                products: 'Coconut Oil (2), Aloe Vera Cream (1)',
                total: '$35.99',
                status: 'Completed',
                date: 'Dec 15, 2023'
            },
            {
                id: 'ORD-002',
                customer: 'Jane Smith',
                products: 'Organic Honey (3)',
                total: '$89.97',
                status: 'Processing',
                date: 'Dec 14, 2023'
            }
        ];
    }
    renderOrdersTable();
    updateOrderStatistics();
}

// Load settings data
function loadSettingsData() {
    // Load saved settings
    const savedSettings = localStorage.getItem('dashboardSettings');
    if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        document.getElementById('dark-mode-toggle').checked = settings.darkMode;
        document.getElementById('email-notifications').checked = settings.emailNotifications;
        document.getElementById('auto-refresh').checked = settings.autoRefresh;
    }
}

// Theme functionality
function toggleTheme() {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        elements.themeToggle.querySelector('i').classList.remove('fa-sun');
        elements.themeToggle.querySelector('i').classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
        dashboardState.theme = 'light';
    } else {
        document.documentElement.classList.add('dark');
        elements.themeToggle.querySelector('i').classList.remove('fa-moon');
        elements.themeToggle.querySelector('i').classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
        dashboardState.theme = 'dark';
    }
}

function applyTheme() {
    if (dashboardState.theme === 'dark') {
        document.documentElement.classList.add('dark');
        if (elements.themeToggle) {
            elements.themeToggle.querySelector('i').classList.remove('fa-moon');
            elements.themeToggle.querySelector('i').classList.add('fa-sun');
        }
    }
}

// Product loading
function loadLatestProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    // Load products from localStorage or use default products
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (savedProducts.length > 0) {
        dashboardState.products = savedProducts;
    } else {
        // Default products if none exist
        dashboardState.products = [
            {
                name: 'Coconut Oil',
                image: 'image/Coconut Oil.png',
                price: '$10.00',
                rating: 4.8
            },
            {
                name: 'Aloe Vera Cream',
                image: 'image/aloe-vera-cosmetic-cream-dark-surface.jpg',
                price: '$15.00',
                rating: 4.9
            },
            {
                name: 'Organic Honey',
                image: 'image/Organic Honey.png',
                price: '$8.00',
                rating: 4.7
            }
        ];
    }

    productsGrid.innerHTML = '';
    dashboardState.products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">${product.price}</p>
        `;
        productsGrid.appendChild(productItem);
    });
}

// Additional helper functions
function loadInitialData() {
    // Load initial data for the dashboard
    loadLatestProducts();
}

function setupResponsiveMenu() {
    // Setup responsive menu functionality
    console.log('Responsive menu setup');
}

function handleSmoothScroll(event) {
    event.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
        target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

function loadRecentActivities() {
    // Simulated recent activities
    dashboardState.activities = [
        {
            type: 'order',
            message: 'John Doe purchased Coconut Oil',
            time: '2 hours ago'
        },
        {
            type: 'user',
            message: 'Jane Smith registered as a new customer',
            time: '4 hours ago'
        }
    ];
}

function updateStatistics() {
    // Update dashboard statistics
    console.log('Statistics updated');
}

function renderOrdersTable() {
    // Render orders table
    console.log('Orders table rendered');
}

function updateOrderStatistics() {
    // Update order statistics
    console.log('Order statistics updated');
}

// Refresh dashboard functionality
function refreshDashboard() {
    showNotification('Memuat ulang dashboard...');
    
    // Clear existing data
    dashboardState.products = [];
    dashboardState.activities = [];
    dashboardState.orders = [];
    
    // Reload all dashboard data
    loadDashboardData();
    
    // Show success notification after a short delay
    setTimeout(() => {
        showNotification('Dashboard berhasil diperbarui!');
    }, 1000);
}

// Enhanced data loading with simulated changes
function loadDashboardData() {
    // Clear products grid first
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = '';
    }
    
    // Load latest products with simulated updates
    loadLatestProducts();
    
    // Load recent activities with simulated updates
    loadRecentActivities();
    
    // Update statistics with simulated changes
    updateStatistics();
}

// Enhanced product loading with random variations
function loadLatestProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    // Load products from localStorage or use default products
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    
    if (savedProducts.length > 0) {
        dashboardState.products = savedProducts;
    } else {
        // Default products with random variations on refresh
        dashboardState.products = [
            {
                name: 'Coconut Oil',
                image: 'image/Coconut Oil.png',
                price: '$' + (10.00 + Math.random() * 5).toFixed(2),
                rating: (4.5 + Math.random() * 0.5).toFixed(1)
            },
            {
                name: 'Aloe Vera Cream',
                image: 'image/aloe-vera-cosmetic-cream-dark-surface.jpg',
                price: '$' + (15.00 + Math.random() * 3).toFixed(2),
                rating: (4.7 + Math.random() * 0.3).toFixed(1)
            },
            {
                name: 'Organic Honey',
                image: 'image/Organic Honey.png',
                price: '$' + (8.00 + Math.random() * 4).toFixed(2),
                rating: (4.6 + Math.random() * 0.4).toFixed(1)
            },
            {
                name: 'Herbal Tea',
                image: 'image/Herbal.png',
                price: '$' + (12.00 + Math.random() * 3).toFixed(2),
                rating: (4.4 + Math.random() * 0.6).toFixed(1)
            }
        ];
    }

    productsGrid.innerHTML = '';
    dashboardState.products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.classList.add('product-item');
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover rounded-lg mb-4">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">${product.name}</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-4">Produk alami premium</p>
            <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-primary-600 dark:text-primary-400">${product.price}</span>
                <div class="flex items-center space-x-1">
                    <i class="fas fa-star text-yellow-400"></i>
                    <span class="text-gray-600 dark:text-gray-400">${product.rating}</span>
                </div>
            </div>
        `;
        productsGrid.appendChild(productItem);
    });
}

// Enhanced activities loading with random variations
function loadRecentActivities() {
    // Simulated recent activities with random variations
    const activities = [
        'membeli produk',
        'mendaftar sebagai pelanggan baru',
        'memberikan rating 5 bintang',
        'berkomentar pada produk',
        'menambahkan ke wishlist',
        'menyelesaikan pembelian',
        'mengikuti newsletter',
        'berbagi produk di media sosial'
    ];
    
    const customers = ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown', 'Emily Davis'];
    const products = ['Coconut Oil', 'Aloe Vera Cream', 'Organic Honey', 'Herbal Tea', 'Essential Oil'];
    
    dashboardState.activities = Array.from({length: 4}, () => {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        const hoursAgo = Math.floor(Math.random() * 12) + 1;
        
        return {
            type: activity.includes('membeli') ? 'order' : 
                  activity.includes('rating') ? 'review' :
                  activity.includes('komentar') ? 'comment' : 'user',
            message: `${customer} ${activity} ${activity.includes('produk') ? product : ''}`.trim(),
            time: `${hoursAgo} jam yang lalu`
        };
    });
    
    // Update activities section if it exists
    const activitiesSection = document.querySelector('#recent-activities .space-y-6');
    if (activitiesSection) {
        activitiesSection.innerHTML = '';
        dashboardState.activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.classList.add('flex', 'items-start', 'space-x-4', 'p-4', 'rounded-lg', 'hover:bg-gray-50', 'dark:hover:bg-gray-800', 'transition-colors', 'duration-200');
            
            const iconClass = activity.type === 'order' ? 'fa-shopping-cart text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900' :
                            activity.type === 'review' ? 'fa-star text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900' :
                            activity.type === 'comment' ? 'fa-comment text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900' :
                            'fa-user-plus text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
            
            activityElement.innerHTML = `
                <div class="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass.split(' ')[2]} ${iconClass.split(' ')[3]}">
                    <i class="fas ${iconClass.split(' ')[0]} ${iconClass.split(' ')[1]}"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-semibold text-gray-800 dark:text-white mb-1">${activity.type === 'order' ? 'Pesanan Baru' : 
                                                                                 activity.type === 'review' ? 'Rating Produk' : 
                                                                                 activity.type === 'comment' ? 'Komentar Baru' : 'Pengguna Baru'}</h4>
                    <p class="text-gray-600 dark:text-gray-400 mb-2">${activity.message}</p>
                    <span class="text-sm text-gray-500 dark:text-gray-500">${activity.time}</span>
                </div>
            `;
            activitiesSection.appendChild(activityElement);
        });
    }
}

// Enhanced statistics with random variations
function updateStatistics() {
    // Update statistics cards with random variations
    const stats = [
        { selector: '#statistics .grid > div:nth-child(1) p.text-2xl', base: 10250, variation: 500 },
        { selector: '#statistics .grid > div:nth-child(2) p.text-2xl', base: 150, variation: 20 },
        { selector: '#statistics .grid > div:nth-child(3) p.text-2xl', base: 325, variation: 50 },
        { selector: '#statistics .grid > div:nth-child(4) p.text-2xl', base: 8500, variation: 1000 }
    ];
    
    stats.forEach(stat => {
        const element = document.querySelector(stat.selector);
        if (element) {
            const newValue = stat.base + Math.floor(Math.random() * stat.variation);
            element.textContent = stat.selector.includes('$') ? `$${newValue.toLocaleString()}` : newValue.toLocaleString();
            
            // Update percentage with random variation
            const percentageElement = element.parentElement.nextElementSibling.querySelector('span:first-child');
            if (percentageElement) {
                const newPercentage = Math.floor(Math.random() * 15) + 5;
                percentageElement.textContent = `+${newPercentage}%`;
            }
        }
    });
}

// Call the init function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initDashboard);

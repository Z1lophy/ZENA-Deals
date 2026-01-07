// API Configuration
// For free usage, you can use:
// 1. SerpAPI (https://serpapi.com) - Free tier: 100 searches/month
// 2. Google Custom Search API - Free tier: 100 queries/day
// 3. Or use a CORS proxy with product search engines

const API_CONFIG = {
    // Option 1: SerpAPI (RECOMMENDED - 100 free searches/month)
    // Get your free API key at: https://serpapi.com/users/sign_up
    // Then paste it below and set useSerpAPI to true
    useSerpAPI: true,
    serpApiKey: 'YOUR_SERPAPI_KEY', // Get your key from https://serpapi.com and set it in .env file as SERPAPI_KEY
    
    // Option 2: Google Custom Search (100 free queries/day)
    useGoogleSearch: false,
    googleApiKey: 'AIzaSyBpd_LJO6YE0o7itEQW5LnmyfpTw3Lk2io',
    googleSearchEngineId: '027957f3fe6844623',
    
    // Option 3: Demo mode (shows mock results - no real prices)
    useDemoMode: false
};

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const resultsGrid = document.getElementById('resultsGrid');
const noResults = document.getElementById('noResults');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Main search handler
async function handleSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a product name to search');
        return;
    }
    
    // Check search limits
    if (!userManager.canSearch()) {
        const remaining = userManager.getRemainingSearches();
        const limit = userManager.getSearchLimit();
        showError(`You've reached your daily search limit (${limit} searches/day). Upgrade to Premium for 20 searches/day!`);
        document.getElementById('upgradeBtn').style.animation = 'pulse 1s infinite';
        setTimeout(() => {
            document.getElementById('upgradeBtn').style.animation = '';
        }, 3000);
        return;
    }
    
    // Hide previous results
    hideAll();
    showLoading();
    
    // Record the search
    userManager.recordSearch();
    updateSearchCount();
    
    try {
        let productResults = [];
        
        // ALWAYS use SerpAPI if configured (it provides prices)
        // Google Custom Search doesn't provide prices, so we never use it when SerpAPI is available
        if (API_CONFIG.useSerpAPI && API_CONFIG.serpApiKey && API_CONFIG.serpApiKey !== 'YOUR_SERPAPI_KEY') {
            console.log('Using SerpAPI for product search with prices...');
            productResults = await searchWithSerpAPI(query);
        } else if (API_CONFIG.useGoogleSearch && API_CONFIG.googleApiKey && API_CONFIG.googleApiKey !== 'YOUR_GOOGLE_API_KEY' && API_CONFIG.googleSearchEngineId && API_CONFIG.googleSearchEngineId !== 'YOUR_SEARCH_ENGINE_ID') {
            // Only use Google if SerpAPI is NOT configured (Google doesn't provide prices)
            console.warn('⚠️ Using Google Custom Search - prices will show as "Check website". Configure SerpAPI for real prices!');
            productResults = await searchWithGoogle(query);
        } else {
            // Demo mode - shows mock results
            console.log('Using demo mode with mock prices...');
            productResults = await getDemoResults(query);
            if (API_CONFIG.useDemoMode) {
                console.warn('Running in demo mode. To get real product prices and images, configure SerpAPI in script.js');
            }
        }
        
        hideLoading();
        
        console.log('Final product results count:', productResults.length);
        console.log('Product results:', productResults);
        
        if (productResults.length > 0) {
            displayResults(productResults);
        } else {
            console.warn('No products to display - showing no results message');
            showNoResults();
        }
    } catch (err) {
        hideLoading();
        const errorMessage = err.message || 'Unknown error occurred';
        showError(`Error searching for products: ${errorMessage}`);
        console.error('Search error details:', err);
        
        // If SerpAPI fails and we have Google configured, warn user
        if (errorMessage.includes('SerpAPI') && API_CONFIG.useGoogleSearch) {
            showError(`SerpAPI Error: ${errorMessage}. Note: Google Custom Search doesn't provide prices. Please fix SerpAPI configuration to see prices.`);
        }
    }
}

// Demo mode - generates mock results for demonstration
async function getDemoResults(query) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockWebsites = [
        { 
            name: 'Amazon', 
            getUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&ref=sr_pg_1`
        },
        { 
            name: 'eBay', 
            getUrl: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}&_sacat=0`
        },
        { 
            name: 'Walmart', 
            getUrl: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`
        },
        { 
            name: 'Best Buy', 
            getUrl: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`
        },
        { 
            name: 'Target', 
            getUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`
        },
        { 
            name: 'Newegg', 
            getUrl: (q) => `https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}`
        }
    ];
    
    // Generate mock prices (randomized)
    const basePrice = Math.floor(Math.random() * 500) + 50;
    
    // Try to get product image from Unsplash (free API)
    const imageUrl = await getProductImage(query);
    
    return mockWebsites.map((site, index) => {
        const priceVariation = (Math.random() - 0.5) * 0.3; // ±15% variation
        const price = Math.round(basePrice * (1 + priceVariation));
        
        return {
            title: `${query} - ${site.name}`,
            price: `$${price.toFixed(2)}`,
            website: site.name,
            url: site.getUrl(query),
            image: imageUrl
        };
    }).sort((a, b) => {
        // Sort by price (lowest first)
        const priceA = parseFloat(a.price.replace('$', ''));
        const priceB = parseFloat(b.price.replace('$', ''));
        return priceA - priceB;
    });
}

// Get product image - uses multiple fallback options
async function getProductImage(query) {
    // Use Picsum Photos with a hash based on query for consistent images
    // This provides random but consistent images per product
    const hash = query.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://picsum.photos/seed/${hash}/300/200`;
}

// Helper function to parse price from string
function parsePrice(priceString) {
    if (!priceString) return Infinity;
    
    // Remove currency symbols and extract number
    const cleaned = priceString.replace(/[^0-9.,]/g, '');
    const price = parseFloat(cleaned.replace(',', ''));
    return isNaN(price) ? Infinity : price;
}

// SerpAPI integration - finds real products with actual prices
async function searchWithSerpAPI(query) {
    const apiKey = API_CONFIG.serpApiKey;
    if (!apiKey || apiKey === 'YOUR_SERPAPI_KEY') {
        throw new Error('Please configure your SerpAPI key in script.js. Get a free key at https://serpapi.com');
    }
    
    // Always use backend proxy (works on both localhost and production)
    // SerpAPI blocks direct browser requests due to CORS, so we need a proxy
    // The backend server.js handles the API calls server-side
    const url = `/api/search?query=${encodeURIComponent(query)}`;
    
    let response;
    try {
        response = await fetch(url);
    } catch (fetchError) {
        // Handle CORS or network errors
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS')) {
            if (!useProxy) {
                throw new Error('CORS Error: SerpAPI blocks direct browser requests. Please use the Node.js backend server (run: npm install && npm start) or deploy to a hosting service.');
            }
            throw new Error('Network error. Please check your connection and try again.');
        }
        throw fetchError;
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
            throw new Error('Invalid SerpAPI key. Please check your API key in script.js');
        }
        if (response.status === 429) {
            throw new Error('API rate limit exceeded. You\'ve used all 100 free searches this month. Wait for next month or upgrade your plan.');
        }
        throw new Error(`SerpAPI error: ${errorData.error || response.statusText || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    // Debug: log the full response to see what we're getting
    console.log('Full API Response:', data);
    console.log('Shopping results:', data.shopping_results);
    console.log('Number of results:', data.shopping_results?.length || 0);
    
    // Log sample results to verify direct links
    if (data.shopping_results && data.shopping_results.length > 0) {
        console.log('🔍 Sample results (first 3):');
        data.shopping_results.slice(0, 3).forEach((item, i) => {
            console.log(`  ${i + 1}. ${item.source}: ${item.title?.substring(0, 50)}...`);
            console.log(`     Link: ${item.link?.substring(0, 80)}...`);
            console.log(`     Price: ${item.price}`);
        });
    }
    
    // Check for different possible result formats
    const results = data.shopping_results || 
                   data.products || 
                   data.results || 
                   [];
    
    if (!results || results.length === 0) {
        console.warn('No shopping results found in SerpAPI response');
        console.warn('Available keys in response:', Object.keys(data));
        
        // Check if there's an error message
        if (data.error) {
            console.error('SerpAPI error:', data.error);
            throw new Error(`SerpAPI error: ${data.error}`);
        }
        
        return [];
    }
    
    console.log(`Found ${results.length} raw results, processing...`);
    
    // Process and sort by price - be more lenient with filtering
    const products = results
        .filter(item => {
            // Check multiple possible field names for the product link
            const link = item.link || item.product_link || item.url || item.product_url || item.href;
            
            if (!link) {
                console.log('Filtered out item (no link):', item.title || item.name);
                console.log('Available fields:', Object.keys(item));
                return false;
            }
            
            // Store the link in item.link for consistent access
            if (!item.link) {
                item.link = link;
            }
            
            return true;
        })
        .map(item => {
            // Try multiple price fields and formats
            let priceString = null;
            let priceValue = Infinity;
            
            if (item.price) {
                priceString = item.price;
                priceValue = parsePrice(item.price);
            } else if (item.extracted_price) {
                priceString = `$${item.extracted_price}`;
                priceValue = parseFloat(item.extracted_price) || Infinity;
            } else if (item.price_without_currency) {
                priceString = `$${item.price_without_currency}`;
                priceValue = parseFloat(item.price_without_currency) || Infinity;
            } else if (item.original_price) {
                priceString = item.original_price;
                priceValue = parsePrice(item.original_price);
            } else {
                priceString = 'Check website';
                priceValue = Infinity;
            }
            
            // Get the direct product link
            // The server now tries to follow Google Shopping redirects to get direct retailer links
            // Priority: direct_link (from server) > product_link > link (might be direct after processing)
            
            // Check if link is a Google Shopping link
            const isGoogleShoppingLink = (url) => {
                if (!url) return false;
                return typeof url === 'string' && (
                    url.includes('google.com/search') || 
                    url.includes('ibp=oshop') || 
                    url.includes('udm=28') ||
                    url.includes('/shopping/')
                );
            };
            
            // First, check for direct_link (set by server after following redirects)
            let directLink = item.direct_link;
            
            // If no direct_link, check other possible direct link fields
            if (!directLink) {
                directLink = item.product_link || 
                           item.product_url || 
                           item.offers?.link ||
                           item.offers?.url ||
                           item.product?.link;
            }
            
            // If we have a link, check if it's actually a Google Shopping link
            if (directLink && isGoogleShoppingLink(directLink)) {
                directLink = null; // Not a direct link, reset
            }
            
            // Check the main 'link' field (server may have replaced it with direct link)
            if (!directLink && item.link) {
                if (!isGoogleShoppingLink(item.link)) {
                    // This is a direct link (server processed it)
                    directLink = item.link;
                    console.log('✅ Using direct retailer link (from server):', directLink.substring(0, 80) + '...');
                } else {
                    // Still a Google Shopping link (server couldn't get direct link)
                    console.log('⚠️ Google Shopping link (server could not extract direct link)');
                    directLink = item.link; // Use it anyway - it will redirect when clicked
                }
            }
            
            // Final fallback
            if (!directLink) {
                directLink = item.link;
                console.log('⚠️ No link found');
            }
            
            // Get image from multiple possible sources
            const productImage = item.thumbnail || 
                               item.image || 
                               item.original_image ||
                               item.rich_snippet?.top?.image ||
                               '';
            
            const product = {
                title: item.title || item.name || 'Product',
                price: priceString,
                priceValue: priceValue,
                website: item.source || item.seller || 'Unknown',
                url: directLink, // Use direct product link, not Google Shopping link
                image: productImage
            };
            
            console.log('Processed product:', product);
            return product;
        })
        .sort((a, b) => {
            // Sort by price, but put items without prices at the end
            if (a.priceValue === Infinity && b.priceValue === Infinity) return 0;
            if (a.priceValue === Infinity) return 1;
            if (b.priceValue === Infinity) return -1;
            return a.priceValue - b.priceValue;
        });
    
    console.log(`Processed ${products.length} products`);
    console.log('Final products list:', products);
    
    if (products.length === 0 && results.length > 0) {
        console.warn('No products found after processing');
        console.warn('Sample raw item (first result):', results[0]);
        console.warn('All available fields in first item:', Object.keys(results[0]));
        console.warn('Link field check:', {
            link: results[0].link,
            product_link: results[0].product_link,
            product_url: results[0].product_url,
            direct_link: results[0].direct_link,
            url: results[0].url,
            href: results[0].href
        });
    }
    
    // Log link information for debugging
    if (products.length > 0) {
        console.log('Sample product URLs:', products.slice(0, 3).map(p => ({ title: p.title.substring(0, 30), url: p.url })));
    }
    
    return products;
}

// Google Custom Search integration
async function searchWithGoogle(query) {
    const apiKey = API_CONFIG.googleApiKey;
    const searchEngineId = API_CONFIG.googleSearchEngineId;
    
    if (!apiKey || apiKey === 'YOUR_GOOGLE_API_KEY') {
        throw new Error('Please configure your Google API key in script.js');
    }
    
    if (!searchEngineId || searchEngineId === 'YOUR_SEARCH_ENGINE_ID') {
        throw new Error('Please configure your Google Search Engine ID in script.js');
    }
    
    // Note: Google Custom Search API is better for general web search
    // For product-specific results, SerpAPI is recommended
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query + ' buy price')}`;
    
    let response;
    try {
        response = await fetch(url);
    } catch (fetchError) {
        // Handle CORS or network errors
        if (fetchError.message.includes('Failed to fetch') || fetchError.message.includes('CORS')) {
            throw new Error('CORS error: Google Custom Search API requires CORS. Try using SerpAPI instead, or run from a web server.');
        }
        throw fetchError;
    }
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 400) {
            throw new Error(`Google API error: ${errorData.error?.message || 'Invalid request. Check your API key and Search Engine ID.'}`);
        }
        if (response.status === 403) {
            throw new Error('Google API access denied. Check your API key permissions and billing status.');
        }
        throw new Error(`Google API error: ${errorData.error?.message || response.statusText || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0) {
        return [];
    }
    
    // Transform Google results to our format
    // Note: Google Custom Search doesn't provide prices, so we'll show "Check website"
    return data.items.slice(0, 12).map(item => ({
        title: item.title,
        price: 'Check website', // Google Custom Search doesn't provide prices
        priceValue: Infinity, // Can't sort by price without price data
        website: new URL(item.link).hostname.replace('www.', ''),
        url: item.link,
        image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.['og:image'] || ''
    }));
}

// Display results - shows cheapest first
function displayResults(products) {
    resultsGrid.innerHTML = '';
    
    if (products.length === 0) {
        showNoResults();
        return;
    }
    
    // Highlight the cheapest option
    products.forEach((product, index) => {
        const card = createProductCard(product, index === 0);
        resultsGrid.appendChild(card);
    });
    
    results.classList.remove('hidden');
}

// Create product card element
function createProductCard(product, isCheapest = false) {
    const card = document.createElement('div');
    card.className = `product-card ${isCheapest ? 'cheapest' : ''}`;
    
    // Use actual product image, with fallback
    const productImage = product.image || '';
    const fallbackImage = `https://placehold.co/300x200/e5e7eb/6b7280?text=${encodeURIComponent(product.title.substring(0, 30))}`;
    
    card.innerHTML = `
        ${isCheapest ? '<div class="cheapest-badge">💰 Best Price</div>' : ''}
        <img src="${productImage || fallbackImage}" 
             alt="${product.title}" 
             class="product-image" 
             onerror="if(this.src !== '${fallbackImage}') { this.src='${fallbackImage}'; }"
             loading="lazy">
        <div class="product-title">${product.title}</div>
        <div class="product-price ${isCheapest ? 'cheapest-price' : ''}">${product.price}</div>
        <span class="product-website">${product.website}</span>
        <button class="product-link ${isCheapest ? 'cheapest-link' : ''}" data-url="${product.url}">
            ${isCheapest ? '🛒 Buy Now - Best Deal' : 'View Deal →'}
        </button>
    `;
    
    // Add click handler for ad display
    const linkButton = card.querySelector('.product-link');
    linkButton.addEventListener('click', async (e) => {
        e.preventDefault();
        const url = linkButton.getAttribute('data-url');
        
        // Show ad for free users, skip for premium
        if (!userManager.isPremium()) {
            await adManager.showAd(url);
        } else {
            // Premium users go directly
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    });
    
    return card;
}

// UI Helper Functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideError() {
    error.classList.add('hidden');
}

function showNoResults() {
    noResults.classList.remove('hidden');
}

function hideAll() {
    results.classList.add('hidden');
    error.classList.add('hidden');
    noResults.classList.add('hidden');
}

// Show API notice if in demo mode
const apiNotice = document.getElementById('apiNotice');
if (API_CONFIG.useDemoMode || (!API_CONFIG.useSerpAPI && !API_CONFIG.useGoogleSearch)) {
    apiNotice.classList.remove('hidden');
}

// Update search count display
function updateSearchCount() {
    const userData = userManager.getUserData();
    const countEl = document.getElementById('searchCount');
    if (countEl) {
        countEl.textContent = `Searches: ${userData.dailySearches}/${userData.searchLimit}`;
        if (userData.isPremium) {
            countEl.innerHTML += ' <span class="premium-badge">Premium</span>';
        }
    }
}

// Subscription modal handlers
document.addEventListener('DOMContentLoaded', () => {
    const upgradeBtn = document.getElementById('upgradeBtn');
    const subscriptionModal = document.getElementById('subscriptionModal');
    const closeModal = document.getElementById('closeSubscriptionModal');
    const subscribeBtn = document.getElementById('subscribeBtn');
    
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', () => {
            subscriptionModal.classList.remove('hidden');
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            subscriptionModal.classList.add('hidden');
        });
    }
    
    if (subscribeBtn) {
        subscribeBtn.addEventListener('click', () => {
            // TODO: Integrate with payment processor (Stripe, PayPal, etc.)
            // For now, simulate subscription
            handleSubscription();
        });
    }
    
    // Close modal on outside click
    if (subscriptionModal) {
        subscriptionModal.addEventListener('click', (e) => {
            if (e.target === subscriptionModal) {
                subscriptionModal.classList.add('hidden');
            }
        });
    }
    
    // Initialize search count display
    updateSearchCount();
    
    // Check for payment return from Stripe
    checkPaymentStatus();
});

// Handle subscription with Stripe
async function handleSubscription() {
    const subscribeBtn = document.getElementById('subscribeBtn');
    const originalText = subscribeBtn.textContent;
    
    try {
        subscribeBtn.disabled = true;
        subscribeBtn.textContent = 'Processing...';
        
        // Get user ID
        const userId = userManager.userId;
        
        // Create checkout session
        const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create checkout session');
        }
        
        // Initialize Stripe with publishable key
        const stripe = Stripe(data.publishableKey);
        
        // Redirect to Stripe Checkout
        const { error } = await stripe.redirectToCheckout({
            sessionId: data.sessionId,
        });
        
        if (error) {
            throw error;
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showError('Failed to start checkout. Please try again.');
        subscribeBtn.disabled = false;
        subscribeBtn.textContent = originalText;
    }
}

// Check for successful payment return from Stripe
async function checkPaymentStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    const success = urlParams.get('success');
    const canceled = urlParams.get('canceled');
    
    if (canceled) {
        showError('Payment was canceled. You can try again anytime.');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }
    
    if (success && sessionId) {
        try {
            // Verify payment with backend
            const response = await fetch('/api/verify-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId }),
            });
            
            const data = await response.json();
            
            if (data.success && data.subscriptionActive) {
                // Upgrade user to premium
                userManager.upgradeToPremium(data.expiryDate);
                updateSearchCount();
                
                showSuccess('🎉 Payment successful! Welcome to Premium! You now have 20 searches per day and no ads!');
                
                // Clean URL
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                showError('Payment verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            showError('Failed to verify payment. Please contact support.');
        }
    }
}

function showSuccess(message) {
    const errorEl = document.getElementById('error');
    errorEl.textContent = message;
    errorEl.className = 'error success';
    errorEl.classList.remove('hidden');
    setTimeout(() => {
        errorEl.classList.add('hidden');
    }, 5000);
}

// Initialize - check if we're in demo mode
if (API_CONFIG.useDemoMode) {
    console.log('Running in demo mode. Configure API keys in script.js to use real product data.');
    console.log('Get a free SerpAPI key at: https://serpapi.com/users/sign_up');
}

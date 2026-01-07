// Simple Node.js backend proxy for SerpAPI
// This solves the CORS issue by making API calls from the server

const express = require('express');
const cors = require('cors');
const path = require('path');
const https = require('https');
const http = require('http');
const stripe = require('stripe');

const app = express();
// Use environment PORT for cloud hosting, fallback to 3000 for local
const PORT = process.env.PORT || 3000;

// Stripe configuration
// IMPORTANT: Keys MUST be set as environment variables, never hardcoded
// Get from: https://dashboard.stripe.com/apikeys
// For local dev: Create a .env file with your keys (see ENV_SETUP.md)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_SECRET_KEY || !STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️  WARNING: Stripe keys not found in environment variables!');
    console.warn('⚠️  Create a .env file or set environment variables (see ENV_SETUP.md)');
}

const stripeClient = STRIPE_SECRET_KEY ? stripe(STRIPE_SECRET_KEY) : null;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files (your HTML, CSS, JS)
app.use(express.static(__dirname));

// Helper function to make HTTP requests (works in all Node.js versions)
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(data);
                }
            });
        }).on('error', reject);
    });
}

// Helper function to extract direct product URL from Google Shopping page using Puppeteer
async function extractDirectLink(googleShoppingUrl) {
    let puppeteer;
    try {
        puppeteer = require('puppeteer');
    } catch (e) {
        console.log('  ⚠️ Puppeteer not installed, skipping direct link extraction');
        return null;
    }
    
    let browser;
    try {
        browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        // Set a timeout
        await page.setDefaultNavigationTimeout(10000);
        
        // Navigate to Google Shopping page
        await page.goto(googleShoppingUrl, { waitUntil: 'networkidle2' });
        
        // Wait a bit for JavaScript to execute
        await page.waitForTimeout(2000);
        
        // Try to find the actual product link
        // Google Shopping pages have links to retailers - look for them
        const directLink = await page.evaluate(() => {
            // Look for retailer links in the page
            const retailerLinks = Array.from(document.querySelectorAll('a[href*="http"]'))
                .map(a => a.href)
                .filter(href => {
                    // Filter out Google links, keep retailer links
                    return href && 
                           !href.includes('google.com') &&
                           !href.includes('googleapis.com') &&
                           !href.includes('gstatic.com') &&
                           (href.includes('amazon.com') ||
                            href.includes('bestbuy.com') ||
                            href.includes('walmart.com') ||
                            href.includes('target.com') ||
                            href.includes('newegg.com') ||
                            href.includes('ebay.com') ||
                            href.includes('modmymods.com') ||
                            href.includes('performance-pcs.com') ||
                            href.startsWith('http'));
                });
            
            // Return the first retailer link found
            return retailerLinks.length > 0 ? retailerLinks[0] : null;
        });
        
        await browser.close();
        return directLink;
    } catch (error) {
        if (browser) await browser.close();
        console.log(`  ⚠️ Error extracting link: ${error.message}`);
        return null;
    }
}

// Search individual retailers directly (no Google Shopping)
const retailers = [
    { name: 'Amazon', site: 'amazon.com' },
    { name: 'Walmart', site: 'walmart.com' },
    { name: 'Best Buy', site: 'bestbuy.com' },
    { name: 'Target', site: 'target.com' },
    { name: 'eBay', site: 'ebay.com' },
    { name: 'Newegg', site: 'newegg.com' }
];

// Helper to search a specific retailer
async function searchRetailer(retailer, query, apiKey) {
    try {
        // Use Google Search with site-specific query to get direct retailer links
        // Add "buy" or "product" to get product pages instead of search pages
        const searchQuery = `${query} buy product site:${retailer.site}`;
        const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&num=10`;
        const data = await makeRequest(searchUrl);
        
        if (data.error) {
            console.log(`  ⚠️ ${retailer.name} error: ${data.error}`);
            return [];
        }
        
        const results = [];
        if (data.organic_results) {
            for (const result of data.organic_results) {
                // Only include results from the retailer's domain
                if (result.link && result.link.includes(retailer.site)) {
                    // Filter out search pages, category pages, and other non-product pages
                    const link = result.link.toLowerCase();
                    const isSearchPage = link.includes('/search') || 
                                        link.includes('/searchpage') ||
                                        link.includes('/browse') ||
                                        link.includes('/category') ||
                                        link.includes('/c/') ||
                                        link.includes('?st=') ||
                                        link.includes('&st=');
                    
                    if (isSearchPage) {
                        continue; // Skip search pages
                    }
                    
                    // Try to extract price from multiple sources
                    // Google Search prices are often unreliable, so we'll be more careful
                    let price = null;
                    let priceValue = null;
                    
                    // Priority 1: Check if Google extracted a structured price
                    if (result.price) {
                        price = result.price;
                        // Extract numeric value for validation
                        const numMatch = price.match(/[\d,]+\.?\d*/);
                        if (numMatch) {
                            priceValue = parseFloat(numMatch[0].replace(/,/g, ''));
                        }
                    } else if (result.rich_snippet?.top?.detected_extensions?.price) {
                        price = result.rich_snippet.top.detected_extensions.price;
                        priceValue = parseFloat(price.replace(/[^0-9.]/g, ''));
                    }
                    
                    // Priority 2: Try to extract from snippet (but validate it's reasonable)
                    if (!price && result.snippet) {
                        // Look for price patterns like $999.99, $1,299.99, etc.
                        const pricePatterns = [
                            /\$[\d,]{3,}\.?\d{0,2}/,  // $999 or $999.99 (at least 3 digits)
                            /[\d,]{3,}\.?\d{0,2}\s*USD/i,
                            /Price[:\s]*\$?[\d,]{3,}\.?\d{0,2}/i
                        ];
                        
                        for (const pattern of pricePatterns) {
                            const match = result.snippet.match(pattern);
                            if (match) {
                                const extractedPrice = match[0].replace(/[^0-9.,]/g, '');
                                const numValue = parseFloat(extractedPrice.replace(/,/g, ''));
                                
                                // Validate: price should be reasonable (between $1 and $100,000)
                                // Filter out obviously wrong prices like $83 for a $999 product
                                if (numValue && numValue >= 1 && numValue <= 100000) {
                                    price = `$${numValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                                    priceValue = numValue;
                                    break;
                                }
                            }
                        }
                    }
                    
                    // Google Search prices are VERY unreliable - be extremely conservative
                    // For expensive items like GPUs, any price under $200 is almost certainly wrong
                    // For other items, prices under $50 are suspicious
                    const isExpensiveItem = query.toLowerCase().includes('gpu') ||
                                          query.toLowerCase().includes('graphics') ||
                                          query.toLowerCase().includes('rtx') ||
                                          query.toLowerCase().includes('5080') ||
                                          query.toLowerCase().includes('5090') ||
                                          query.toLowerCase().includes('4070') ||
                                          query.toLowerCase().includes('4080') ||
                                          query.toLowerCase().includes('laptop') ||
                                          query.toLowerCase().includes('computer');
                    
                    const minPriceThreshold = isExpensiveItem ? 200 : 50;
                    
                    // If price seems too low or we don't have one, mark as "Check website"
                    // It's MUCH better to show "Check website" than wrong prices like $83 for a $999 product
                    if (!price || (priceValue && priceValue < minPriceThreshold)) {
                        price = 'Check website';
                        priceValue = null;
                    }
                    
                    // Get image from multiple possible sources
                    let image = result.thumbnail || 
                               result.image ||
                               result.rich_snippet?.top?.image ||
                               '';
                    
                    results.push({
                        title: result.title || 'Product',
                        link: result.link, // Direct retailer product link!
                        snippet: result.snippet || '',
                        source: retailer.name,
                        price: price || 'Check website',
                        thumbnail: image
                    });
                }
            }
        }
        
        console.log(`  ✅ ${retailer.name}: Found ${results.length} product pages`);
        return results;
    } catch (error) {
        console.log(`  ⚠️ ${retailer.name} search failed: ${error.message}`);
        return [];
    }
}

// SerpAPI proxy endpoint - searches retailers directly
app.get('/api/search', async (req, res) => {
    const { query } = req.query;
    
    console.log(`\n🔍 Search request received: "${query}"`);
    
    if (!query) {
        console.error('❌ Missing query parameter');
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    // Get SerpAPI key from environment variable
    const SERPAPI_KEY = process.env.SERPAPI_KEY;
    
    if (!SERPAPI_KEY) {
        return res.status(500).json({ error: 'SERPAPI_KEY environment variable is required. See ENV_SETUP.md for setup instructions.' });
    }
    
    console.log('🛒 Searching retailers directly (no Google Shopping)...');
    console.log('📦 Searching:', retailers.map(r => r.name).join(', '));
    
    try {
        // Search all retailers in parallel
        const searchPromises = retailers.map(retailer => 
            searchRetailer(retailer, query, SERPAPI_KEY)
        );
        
        const allResults = await Promise.all(searchPromises);
        
        // Flatten and combine all results
        const combinedResults = allResults.flat();
        
        console.log(`✅ Found ${combinedResults.length} products across all retailers`);
        
        // Filter out search pages and format response
        const validResults = combinedResults.filter(item => {
            if (!item.link) return false;
            
            const link = item.link.toLowerCase();
            // Filter out search pages, category pages, etc.
            const isInvalidPage = link.includes('/search') ||
                                 link.includes('/searchpage') ||
                                 link.includes('/browse') ||
                                 link.includes('/category') ||
                                 link.includes('/c/') ||
                                 link.includes('?st=') ||
                                 link.includes('&st=') ||
                                 link.includes('/s?') ||
                                 link.includes('/sch/');
            
            return !isInvalidPage;
        });
        
        console.log(`✅ Filtered to ${validResults.length} valid product pages (removed search pages)`);
        
        // Format response to match expected structure
        const response = {
            shopping_results: validResults.map(item => ({
                title: item.title,
                link: item.link, // Direct retailer product link!
                price: item.price,
                source: item.source,
                thumbnail: item.thumbnail || item.image || '',
                snippet: item.snippet
            }))
        };
        
        res.json(response);
    } catch (error) {
        console.error('❌ Search error:', error.message);
        res.status(500).json({ error: error.message || 'Failed to search retailers' });
    }
});

// Stripe payment endpoint - create checkout session
app.post('/api/create-checkout-session', async (req, res) => {
    try {
        const { userId } = req.body;
        
        // Get base URL (works for both local and production)
        const baseUrl = req.headers.origin || (req.headers.host ? `https://${req.headers.host}` : 'http://localhost:3000');
        
        // Create Stripe Checkout Session
        const session = await stripeClient.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'ZENA Deals Premium Subscription',
                            description: '20 searches per day, no ads, priority support',
                        },
                        recurring: {
                            interval: 'month',
                        },
                        unit_amount: 999, // $9.99 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}?session_id={CHECKOUT_SESSION_ID}&success=true`,
            cancel_url: `${baseUrl}?canceled=true`,
            metadata: {
                userId: userId || 'unknown',
            },
        });
        
        res.json({ sessionId: session.id, publishableKey: STRIPE_PUBLISHABLE_KEY });
    } catch (error) {
        console.error('Stripe error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Verify subscription endpoint
app.post('/api/verify-subscription', async (req, res) => {
    if (!stripeClient) {
        return res.status(500).json({ error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.' });
    }
    
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({ error: 'Session ID required' });
        }
        
        const session = await stripeClient.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            // Calculate expiry date (1 month from now)
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            
            res.json({
                success: true,
                subscriptionActive: true,
                expiryDate: expiryDate.toISOString(),
                customerId: session.customer
            });
        } else {
            res.json({
                success: false,
                subscriptionActive: false
            });
        }
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`\n✅ Server running at http://localhost:${PORT}`);
    console.log(`📱 Open your browser and go to: http://localhost:${PORT}`);
    console.log(`💳 Stripe integration ready`);
    console.log(`\nPress Ctrl+C to stop the server\n`);
});

# ZENA Deals - Product Price Comparison Website

A free, modern web application that helps users find the best deals on products by searching across multiple reliable retailers.

## Features

- 🔍 **Product Search**: Search for any product by name
- 💰 **Price Comparison**: Compare prices across multiple trusted websites
- 🔗 **Direct Links**: Get direct links to products on retailer websites
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Beautiful, user-friendly interface

## How to Use

### Option 1: Use Demo Mode (No Setup Required)

1. Simply open `index.html` in your web browser
2. The website will run in demo mode, showing mock results
3. Perfect for testing and demonstration

### Option 2: Use Real Product Data (Free APIs)

#### Using SerpAPI (Recommended - 100 free searches/month)

**This is REQUIRED to get real product prices, images, and direct product links!**

1. Sign up for a **free account** at [SerpAPI](https://serpapi.com/users/sign_up) (100 free searches/month)
2. After signing up, go to your [API Dashboard](https://serpapi.com/dashboard)
3. Copy your API key
4. Open `script.js` and update the configuration:
   ```javascript
   const API_CONFIG = {
       useSerpAPI: true,
       serpApiKey: 'paste-your-actual-api-key-here',
       useDemoMode: false
   };
   ```
5. Save the file and refresh your browser

**What SerpAPI provides:**
- ✅ Real product prices from multiple retailers
- ✅ Actual product images
- ✅ Direct links to product pages (not search pages)
- ✅ Automatically finds the cheapest option
- ✅ Shows products sorted by price

#### Using Google Custom Search API (100 free queries/day)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project and enable Custom Search API
3. Create a Custom Search Engine at [Google Custom Search](https://programmablesearchengine.google.com)
4. Get your API key and Search Engine ID
5. Open `script.js` and update the configuration:
   ```javascript
   const API_CONFIG = {
       useGoogleSearch: true,
       googleApiKey: 'YOUR_GOOGLE_API_KEY',
       googleSearchEngineId: 'YOUR_SEARCH_ENGINE_ID',
       useDemoMode: false
   };
   ```

## Deployment (Free Hosting Options)

### GitHub Pages (Easiest)

1. Create a new repository on GitHub
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select the main branch and save
5. Your site will be live at `https://yourusername.github.io/repository-name`

### Netlify (Recommended)

1. Go to [Netlify](https://www.netlify.com)
2. Sign up for a free account
3. Drag and drop your project folder or connect to GitHub
4. Your site will be live instantly with a free `.netlify.app` domain

### Vercel

1. Go to [Vercel](https://vercel.com)
2. Sign up for a free account
3. Import your project from GitHub or upload files
4. Deploy with one click

## File Structure

```
ZENA Deals/
├── index.html      # Main HTML structure
├── styles.css      # Styling and responsive design
├── script.js       # Search functionality and API integration
└── README.md       # This file
```

## Customization

### Change Colors

Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;  /* Change to your brand color */
    --primary-hover: #4f46e5;
    /* ... */
}
```

### Add More Retailers

In demo mode, edit the `mockWebsites` array in `script.js` to add more retailers.

### Modify Search Behavior

Edit the `handleSearch()` function in `script.js` to customize how searches are processed.

## Limitations

- **Demo Mode**: Shows mock/example results only
- **Free API Limits**: 
  - SerpAPI: 100 searches/month
  - Google Custom Search: 100 queries/day
- **CORS**: Some APIs may require a backend proxy for production use

## Future Enhancements

- Add price history tracking
- Implement filters (price range, category, etc.)
- Add product reviews and ratings
- Save favorite products
- Price drop alerts
- Compare specific products side-by-side

## License

Free to use and modify for personal or commercial projects.

## Support

For issues or questions, please check the API documentation:
- [SerpAPI Docs](https://serpapi.com/search-api)
- [Google Custom Search API Docs](https://developers.google.com/custom-search)

---

**Note**: This is a client-side application. For production use with high traffic, consider adding a backend to handle API calls and avoid exposing API keys.

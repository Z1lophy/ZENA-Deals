// Ad Manager - Shows ads before redirecting to product links
class AdManager {
    constructor() {
        this.adModal = null;
        this.currentRedirectUrl = null;
        this.adDuration = 5000; // 5 seconds
        this.createAdModal();
    }
    
    createAdModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'adModal';
        modal.className = 'ad-modal hidden';
        modal.innerHTML = `
            <div class="ad-modal-content">
                <div class="ad-header">
                    <h3>📺 Advertisement</h3>
                    <div class="ad-timer">
                        <span id="adTimer">5</span> seconds
                    </div>
                </div>
                <div class="ad-container">
                    <div id="adContent" class="ad-content">
                        <p>Loading advertisement...</p>
                        <div class="ad-placeholder">
                            <div class="ad-banner">
                                <p>🎯 Your Ad Here</p>
                                <p style="font-size: 0.8rem; margin-top: 10px;">This space is available for advertising</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="ad-footer">
                    <button id="skipAdBtn" class="skip-ad-btn" disabled>
                        Skip Ad (<span id="skipTimer">5</span>s)
                    </button>
                    <p class="ad-note">Supporting our free service</p>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        this.adModal = modal;
        
        // Setup skip button
        const skipBtn = document.getElementById('skipAdBtn');
        skipBtn.addEventListener('click', () => {
            this.completeAd();
        });
    }
    
    showAd(productUrl) {
        return new Promise((resolve) => {
            this.currentRedirectUrl = productUrl;
            this.adModal.classList.remove('hidden');
            
            let timeLeft = this.adDuration / 1000;
            const timerEl = document.getElementById('adTimer');
            const skipTimerEl = document.getElementById('skipTimer');
            const skipBtn = document.getElementById('skipAdBtn');
            
            // Update timer
            const timerInterval = setInterval(() => {
                timeLeft--;
                timerEl.textContent = timeLeft;
                skipTimerEl.textContent = timeLeft;
                
                if (timeLeft <= 0) {
                    clearInterval(timerInterval);
                    skipBtn.disabled = false;
                    skipBtn.textContent = 'Continue to Product →';
                    this.completeAd();
                    resolve();
                }
            }, 1000);
            
            // Load actual ad (you can integrate Google AdSense, video ads, etc.)
            this.loadAd();
        });
    }
    
    loadAd() {
        const adContent = document.getElementById('adContent');

        // Configure these if you want to render an AdSense unit inside the modal.
        // You already provided the client ID; if you add a display ad unit in AdSense,
        // set ADSENSE_SLOT to that unit's slot id (a numeric string). If not set,
        // we fall back to the placeholder. Auto Ads will still run across the site.
        const ADSENSE_CLIENT = 'ca-pub-8020092100458410';
        const ADSENSE_SLOT = ''; // e.g. '1234567890' (leave empty to use placeholder)

        // Try to render an AdSense unit inside the modal when a slot is provided
        try {
            if (window.adsbygoogle && ADSENSE_SLOT) {
                adContent.innerHTML = '';

                const ins = document.createElement('ins');
                ins.className = 'adsbygoogle';
                ins.style.display = 'block';
                ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
                ins.setAttribute('data-ad-slot', ADSENSE_SLOT);
                ins.setAttribute('data-ad-format', 'auto');
                ins.setAttribute('data-full-width-responsive', 'true');
                adContent.appendChild(ins);

                // Request fill
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                return;
            }
        } catch (e) {
            // Silently fall back to placeholder
        }

        // Fallback placeholder content (shows if no slot is configured yet)
        adContent.innerHTML = `
            <div class="ad-placeholder">
                <div class="ad-banner">
                    <p>🎯 Premium Ad Space</p>
                    <p style="font-size: 0.8rem; margin-top: 10px; color: #666;">
                        This space will show an ad once an AdSense slot is configured
                    </p>
                    <p style="font-size: 0.7rem; margin-top: 5px; color: #999;">
                        Configure ADSENSE_SLOT in adManager.js
                    </p>
                </div>
            </div>
        `;
    }
    
    completeAd() {
        this.adModal.classList.add('hidden');
        if (this.currentRedirectUrl) {
            window.open(this.currentRedirectUrl, '_blank', 'noopener,noreferrer');
        }
        this.currentRedirectUrl = null;
    }
}

// Global ad manager instance
const adManager = new AdManager();

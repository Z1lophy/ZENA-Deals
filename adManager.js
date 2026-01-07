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
        // TODO: Integrate with ad network (Google AdSense, etc.)
        // For now, showing placeholder
        const adContent = document.getElementById('adContent');
        
        // Example: You can add Google AdSense here
        // Or use a video ad player
        // Or use an ad network API
        
        // Placeholder ad content
        adContent.innerHTML = `
            <div class="ad-placeholder">
                <div class="ad-banner">
                    <p>🎯 Premium Ad Space</p>
                    <p style="font-size: 0.8rem; margin-top: 10px; color: #666;">
                        This space is available for advertising partnerships
                    </p>
                    <p style="font-size: 0.7rem; margin-top: 5px; color: #999;">
                        Contact us for ad placement opportunities
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

// User Management and Subscription System
class UserManager {
    constructor() {
        this.userId = this.getOrCreateUserId();
        this.loadUserData();
    }
    
    getOrCreateUserId() {
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }
    
    loadUserData() {
        const saved = localStorage.getItem('userData');
        if (saved) {
            try {
                this.userData = JSON.parse(saved);
            } catch (e) {
                this.userData = this.getDefaultUserData();
            }
        } else {
            this.userData = this.getDefaultUserData();
        }
        
        // Reset daily search count if it's a new day
        this.resetDailyCountIfNeeded();
    }
    
    getDefaultUserData() {
        return {
            subscription: 'free', // 'free' or 'premium'
            subscriptionExpiry: null,
            dailySearches: 0,
            lastSearchDate: new Date().toDateString(),
            totalSearches: 0
        };
    }
    
    resetDailyCountIfNeeded() {
        const today = new Date().toDateString();
        if (this.userData.lastSearchDate !== today) {
            this.userData.dailySearches = 0;
            this.userData.lastSearchDate = today;
            this.saveUserData();
        }
    }
    
    saveUserData() {
        localStorage.setItem('userData', JSON.stringify(this.userData));
    }
    
    getSearchLimit() {
        // Developer mode: unlimited searches
        if (this.userData.developerMode) {
            return Infinity;
        }
        return this.userData.subscription === 'premium' ? 20 : 2;
    }
    
    getRemainingSearches() {
        const limit = this.getSearchLimit();
        if (limit === Infinity) {
            return 'Unlimited';
        }
        return Math.max(0, limit - this.userData.dailySearches);
    }
    
    canSearch() {
        // Developer mode: always allow searches
        if (this.userData.developerMode) {
            return true;
        }
        this.resetDailyCountIfNeeded();
        return this.userData.dailySearches < this.getSearchLimit();
    }
    
    recordSearch() {
        this.resetDailyCountIfNeeded();
        this.userData.dailySearches++;
        this.userData.totalSearches++;
        this.saveUserData();
    }
    
    upgradeToPremium(expiryDate) {
        this.userData.subscription = 'premium';
        this.userData.subscriptionExpiry = expiryDate;
        this.saveUserData();
    }
    
    isPremium() {
        // Developer mode: always premium
        if (this.userData.developerMode) {
            return true;
        }
        
        if (this.userData.subscription !== 'premium') return false;
        
        // Check if subscription expired
        if (this.userData.subscriptionExpiry) {
            const expiry = new Date(this.userData.subscriptionExpiry);
            if (expiry < new Date()) {
                this.userData.subscription = 'free';
                this.userData.subscriptionExpiry = null;
                this.saveUserData();
                return false;
            }
        }
        
        return true;
    }
    
    // Developer/testing methods
    enableDeveloperMode() {
        this.userData.developerMode = true;
        this.userData.subscription = 'premium';
        this.userData.subscriptionExpiry = new Date('2099-12-31').toISOString();
        this.userData.dailySearches = 0; // Reset count
        this.saveUserData();
        console.log('✅ Developer mode enabled! Unlimited searches and premium features activated.');
        this.updateUI();
    }
    
    disableDeveloperMode() {
        this.userData.developerMode = false;
        this.saveUserData();
        console.log('❌ Developer mode disabled. Back to normal limits.');
        this.updateUI();
    }
    
    // Quick premium upgrade for testing (sets premium until 2099)
    enablePremiumForTesting() {
        this.userData.subscription = 'premium';
        this.userData.subscriptionExpiry = new Date('2099-12-31').toISOString();
        this.userData.dailySearches = 0; // Reset count
        this.saveUserData();
        console.log('✅ Premium enabled for testing! 20 searches/day until 2099.');
        this.updateUI();
    }
    
    updateUI() {
        // Trigger UI update if the page is loaded
        if (typeof updateSearchCount === 'function') {
            updateSearchCount();
        }
        // Also try to update if script.js is loaded
        setTimeout(() => {
            if (typeof updateSearchCount === 'function') {
                updateSearchCount();
            }
        }, 100);
    }
    
    getUserData() {
        return {
            ...this.userData,
            remainingSearches: this.getRemainingSearches(),
            searchLimit: this.getSearchLimit(),
            isPremium: this.isPremium()
        };
    }
}

// Global user manager instance
const userManager = new UserManager();

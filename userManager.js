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
        return this.userData.subscription === 'premium' ? 20 : 2;
    }
    
    getRemainingSearches() {
        const limit = this.getSearchLimit();
        return Math.max(0, limit - this.userData.dailySearches);
    }
    
    canSearch() {
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

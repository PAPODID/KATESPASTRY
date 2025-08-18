
// CartManager amélioré pour fonctionner avec Google Apps Script via proxy Node.js/Express local

class CartManager {
    constructor() {
        this.cart = this.loadCart();
        this.userData = this.loadUserData();
        this.orderData = this.loadOrderData();
        this.init();
    }

    init() {
        console.log('🛒 Panier au démarrage:', this.cart);
        console.log('💰 Total calculé:', this.getCartTotal());
        this.updateCartDisplay();
        console.log('CartManager initialisé avec succès');
    }

    // ===== GESTION DU PANIER =====

    addToCart(product) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
                category: product.category
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.updateCartItemsDisplay();
        this.showNotification(`${product.name} ajouté au panier`);
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartItemsDisplay();
        this.showNotification('Article supprimé du panier');
    }

    updateQuantity(productId, newQuantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeFromCart(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartItemsDisplay();
                this.updateOrderSummary();
            }
        }
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    getCartCount() {
        return this.cart.reduce((count, item) => count + item.quantity, 0);
    }

    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartDisplay();
        this.updateCartItemsDisplay();
    }

    // ===== GESTION DES DONNÉES UTILISATEUR =====

    saveUserData(data) {
        this.userData = { ...this.userData, ...data };
        this.saveToStorage('userData', this.userData);
    }

    getUserData() {
        return this.userData;
    }

    // ===== GESTION DES DONNÉES DE COMMANDE =====

    saveOrderData(data) {
        this.orderData = { ...this.orderData, ...data };
        this.saveToStorage('orderData', this.orderData);
    }

    getOrderData() {
        return this.orderData;
    }

    // ===== PERSISTANCE DES DONNÉES =====

    saveCart() {
        this.saveToStorage('cart', this.cart);
        console.log('Panier sauvegardé:', this.cart);
    }

    loadCart() {
        return this.loadFromStorage('cart') || [];
    }

    loadUserData() {
        return this.loadFromStorage('userData') || {
            firstName: '',
            lastName: '',
            phone: '',
            email: '',
            address: '',
            district: '',
            city: 'Lomé',
            postalCode: '',
            instructions: '',
            isGift: false,
            giftMessage: ''
        };
    }

    loadOrderData() {
        return this.loadFromStorage('orderData') || {};
    }

    saveToStorage(key, data) {
        try {
            localStorage.setItem(`kate_pastry_${key}`, JSON.stringify(data));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }

    loadFromStorage(key) {
        try {
            const data = localStorage.getItem(`kate_pastry_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            return null;
        }
    }

    // ===== SYNCHRONISATION DE L'AFFICHAGE =====

    updateCartDisplay() {
        const cartCounts = document.querySelectorAll('[id*="cart-count"], [id*="mobile-cart-count"], [id*="sidebar-cart-count"]');
        const cartTotal = this.getCartTotal();
        const cartCount = this.getCartCount();

        cartCounts.forEach(element => {
            element.textContent = cartCount;
        });

        const totalElements = document.querySelectorAll('[id*="total"], [id*="mini-cart-total"]');
        totalElements.forEach(element => {
            element.textContent = this.formatPrice(cartTotal);
        });

        this.updateMiniCart();
        this.updateCartItemsDisplay();
        this.updateOrderSummary();
    }

    updateMiniCart() {
        const miniCartItems = document.getElementById('mini-cart-items');
        if (miniCartItems) {
            miniCartItems.innerHTML = '';
            if (this.cart.length === 0) {
                miniCartItems.innerHTML = '<p class="text-xs text-text-secondary py-4 text-center">Votre panier est vide.</p>';
            } else {
                this.cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'flex items-center justify-between text-sm py-1';
                    itemElement.innerHTML = `
                        <span class="font-body text-text-primary">${item.name} x${item.quantity}</span>
                        <span class="font-cta font-medium text-primary">${this.formatPrice(item.price * item.quantity)}</span>
                    `;
                    miniCartItems.appendChild(itemElement);
                });
            }
        }

        const sidebarCartCount = document.getElementById('sidebar-cart-count');
        const miniCartTotal = document.getElementById('mini-cart-total');
        if (sidebarCartCount) {
            sidebarCartCount.textContent = this.getCartCount();
        }
        if (miniCartTotal) {
            miniCartTotal.textContent = this.formatPrice(this.getCartTotal());
        }

        if (typeof window.renderMiniCart === 'function') {
            window.renderMiniCart();
        }
        this.updatePanierSidebar();
    }

    updateCartItemsDisplay() {
        const cartContainer = document.getElementById('cart-items-container');
        const emptyMessage = document.getElementById('empty-cart-message');
        if (!cartContainer) return;

        if (this.cart.length === 0) {
            if (emptyMessage) emptyMessage.classList.remove('hidden');
            cartContainer.innerHTML = '';
            return;
        }

        if (emptyMessage) emptyMessage.classList.add('hidden');
        cartContainer.innerHTML = '';

        this.cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'flex items-center space-x-4 pb-6 border-b border-border mb-6';
            itemElement.innerHTML = `
                <div class="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover" />
                </div>
                <div class="flex-grow">
                    <h3 class="font-cta font-medium text-primary mb-1">${item.name}</h3>
                    <p class="font-cta font-medium text-accent">${this.formatPrice(item.price)}</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button class="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-smooth" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity - 1})">
                        <svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                        </svg>
                    </button>
                    <span class="font-cta font-medium text-primary w-8 text-center">${item.quantity}</span>
                    <button class="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-surface transition-smooth" onclick="cartManager.updateQuantity('${item.id}', ${item.quantity + 1})">
                        <svg class="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                        </svg>
                    </button>
                </div>
                <div class="text-right">
                    <p class="font-cta font-medium text-primary">${this.formatPrice(item.price * item.quantity)}</p>
                    <button class="text-error hover:text-error-600 transition-smooth mt-1" onclick="cartManager.removeFromCart('${item.id}')">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0.5 0.5 23 23">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            `;
            cartContainer.appendChild(itemElement);
        });
    }

    // Méthode corrigée pour mettre à jour le récapitulatif de commande
    updateOrderSummary() {
        const totalArticlesElement = document.querySelector('#order-summary .flex.justify-between.mb-2 span.text-primary'); // Sélecteur pour "Total Articles" valeur
        const totalElement = document.querySelector('#order-summary .flex.justify-between.border-t.pt-4 span.text-primary.font-bold'); // Sélecteur pour "Total" valeur

        if (totalArticlesElement) {
            totalArticlesElement.textContent = this.getCartCount(); // Afficher le nombre d'articles pour "Total Articles"
        }

        if (totalElement) {
            totalElement.textContent = this.formatPrice(this.getCartTotal()); // Afficher le prix total (comme dans le sidebar) pour "Total"
        }
    }

    // ===== VALIDATION ET SOUMISSION AVEC GESTION D'ERREURS AMÉLIORÉE =====

    validateOrder() {
        if (this.cart.length === 0) {
            this.showNotification('Votre panier est vide', 'error');
            return false;
        }
        if (!this.userData.firstName || !this.userData.lastName || !this.userData.email) {
            this.showNotification('Veuillez remplir les informations client', 'error');
            return false;
        }
        // Validation email basique
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.userData.email)) {
            this.showNotification('Adresse email invalide', 'error');
            return false;
        }
        console.log('Validation passée:', this.userData);
        return true;
    }
          // Remplace uniquement la méthode submitOrder() dans cart-manager.js
async submitOrder() {
  if (!this.validateOrder()) {
    return false;
  }
  const loadingMessage = this.showLoadingNotification('Envoi de la commande...');
  try {
    const calculatedTotal = this.getCartTotal();
    const order = {
      id: this.generateOrderId(),
      timestamp: new Date().toISOString(),
      cart: this.cart,
      userData: {
        firstName: this.userData.firstName.trim(),
        lastName: this.userData.lastName.trim(),
        email: this.userData.email.trim().toLowerCase(),
        phone: this.userData.phone ? this.userData.phone.trim() : '',
        city: 'Lomé'
      },
      orderData: this.orderData,
      total: calculatedTotal
    };
    let orderJson;
    try {
      orderJson = JSON.stringify(order, null, 2);
      console.log('📦 JSON temporaire:', orderJson);
      JSON.parse(orderJson);
    } catch (jsonError) {
      console.error('❌ Erreur JSON:', jsonError);
      throw new Error('Erreur JSON: ' + jsonError.message);
    }
    const proxyUrl = 'https://rex-proxy.papotomadidieressodewa.workers.dev/submit-order'; // URL valide
    console.log('📡 Connexion proxy:', proxyUrl);
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: orderJson
    });
    console.log('📡 Statut:', response.status);
    const responseText = await response.text();
    console.log('📄 Réponse:', responseText);
    this.hideLoadingNotification(loadingMessage);
    if (response.ok) {
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('✅ Résultat:', result);
      } catch (parseError) {
        console.warn('⚠️ Non-JSON, succès assumé:', responseText);
        result = { status: 'success' };
      }
      if (result.status === 'success' || responseText.includes('success')) {
        this.showNotification('Commande envoyée !', 'success');
        this.saveToStorage('currentOrder', order);
        this.clearCart();
        setTimeout(() => {
                              window.location.href = 'order_confirmation.html';
                          }, 2000);
        return true;
      } else {
        throw new Error(result.message || 'Erreur serveur');
      }
    } else {
      console.error('❌ Erreur HTTP:', response.status, responseText);
      throw new Error(`Erreur HTTP ${response.status}: ${responseText}`);
    }
  } catch (error) {
    this.hideLoadingNotification(loadingMessage);
    console.error('❌ Erreur envoi:', { name: error.name, message: error.message });
    let errorMessage = 'Erreur lors de l\'envoi.';
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      errorMessage = 'Impossible de contacter le proxy.';
    } else if (error.message.includes('HTTP 429')) {
      errorMessage = 'Serveur surchargé. Réessayez.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    this.showNotification(`Erreur: ${errorMessage}`, 'error');
    return false;
  }
}
    // ===== UTILITAIRES POUR GESTION D'ERREURS =====

    generateOrderId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `VN-${year}-${month}-${day}-${random}`;
    }

    // ===== UTILITAIRES =====

    formatPrice(price) {
        const num = Math.round(Number(price) || 0);
        const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return formatted + ' FCFA';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        const bgColor = 'bg-success';

        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-md`;
        notification.textContent = message;

        document.body.appendChild(notification);
        
        // Animation d'entrée
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-1rem)';
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Animation de sortie et suppression
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-1rem)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-large z-50 transform translate-x-full transition-transform duration-300`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, type === 'error' ? 5000 : 3000); // Erreurs affichées plus longtemps
    }

    showLoadingNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-success text-white px-6 py-3 rounded-lg shadow-large z-50 flex items-center space-x-2';
        notification.innerHTML = `
            <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        return notification;
    }

    hideLoadingNotification(notification) {
        if (notification && document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }

    // ===== MISE À JOUR DU PANIER SIDEBAR =====

    updatePanierSidebar() {
        const panierArticles = document.getElementById('panier-articles');
        const totalValueElement = document.getElementById('total-value');

        if (panierArticles) {
            panierArticles.innerHTML = '';
            if (this.cart.length === 0) {
                panierArticles.innerHTML = '<p class="text-xs text-text-secondary py-4 text-center">Votre panier est vide.</p>';
            } else {
                this.cart.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.className = 'flex items-center justify-between text-sm py-1';
                    itemElement.innerHTML = `
                        <span class="font-body text-text-primary">${item.name} x${item.quantity}</span>
                        <span class="font-cta font-medium text-primary">${this.formatPrice(item.price * item.quantity)}</span>
                    `;
                    panierArticles.appendChild(itemElement);
                });
            }
        }

        if (totalValueElement) {
            totalValueElement.textContent = this.formatPrice(this.getCartTotal());
        }
    }

    // ===== RÉCUPÉRATION DES DONNÉES DE COMMANDE =====

    getCurrentOrder() {
        return this.loadFromStorage('currentOrder');
    }

    // ===== MIGRATION DES DONNÉES EXISTANTES =====

    migrateExistingData() {
        const existingCart = this.loadFromStorage('cart') || [];
        if (existingCart.length > 0 && this.cart.length === 0) {
            this.cart = existingCart;
            this.saveCart();
        }

        const existingUserData = this.loadFromStorage('userData') || {};
        if (Object.keys(existingUserData).length > 0) {
            this.userData = { ...this.userData, ...existingUserData };
            this.saveUserData(this.userData);
        }
    }

    // ===== MÉTHODES DE DEBUG =====

    debugCart() {
        console.log('=== ÉTAT DU PANIER ===');
        console.log('Cart:', this.cart);
        console.log('Total:', this.getCartTotal());
        console.log('Count:', this.getCartCount());
        console.log('UserData:', this.userData);
        console.log('==================');
    }
}

// Initialiser le gestionnaire de panier global
const cartManager = new CartManager();

// Exposer les fonctions principales globalement pour la compatibilité
window.addToCart = (product) => cartManager.addToCart(product);
window.removeFromCart = (productId) => cartManager.removeFromCart(productId);
window.updateQuantity = (productId, quantity) => cartManager.updateQuantity(productId, quantity);
window.placeOrder = () => cartManager.submitOrder();
window.updatePanierSidebar = () => cartManager.updatePanierSidebar();
window.formatPrice = (price) => cartManager.formatPrice(price);
window.getCartCount = () => cartManager.getCartCount();
window.getCartTotal = () => cartManager.getCartTotal();
window.getCartItems = () => cartManager.cart;
window.debugCart = () => cartManager.debugCart();

console.log('CartManager chargé et initialisé avec améliorations');

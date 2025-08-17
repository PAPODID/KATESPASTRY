// =============================================
// APP-CONFIG.JS - Configuration Centralisée
// =============================================
//
// OBJECTIF: Centralise tous les paramètres de configuration de l'application
// UTILISATION: Importé par tous les autres modules pour accéder aux constantes
// STRUCTURE: Objet global AppConfig avec sous-sections thématiques
//
// SECTIONS PRINCIPALES:
// - company: Informations de l'entreprise (nom, contact, adresse)
// - pricing: Configuration des prix, taxes, devise
// - delivery: Options et tarifs de livraison
// - payment: Méthodes de paiement disponibles
// - businessHours: Horaires d'ouverture par jour
// - productCategories: Catégories de produits avec métadonnées
//
// POINTS D'ATTENTION:
// - Les prix sont en FCFA (devise du Togo)
// - TVA fixée à 18% (taux standard Togo)
// - Horaires en format 24h
// - Configuration des partenaires de livraison (Gozem, Bkg, Olé)
//
// TODO: Externaliser les URLs d'API en variables d'environnement
// NOTE: Ce fichier est exposé côté client, ne pas y mettre de secrets

const AppConfig = {
    // ===== INFORMATIONS DE L'ENTREPRISE =====
    // Données de contact et branding utilisées dans toute l'application
    company: {
        name: "KATE'S PASTRY",                    // Nom affiché dans l'interface
        tagline: "Tradition & Excellence",         // Slogan de la marque
        address: "123 Avenue de la Paix, Lomé",    // Adresse physique
        phone: "+228 91 23 47 97",                 // Numéro de téléphone (format international)
        email: "katebertrya@gmail.com",            // Email de contact
        website: "https://katespastry.com"          // Site web principal
    },

    // ===== CONFIGURATION DES PRIX ET TAXES =====
    // Paramètres financiers et formatage des montants
    pricing: {
        currency: "FCFA",                          // Devise utilisée (Franc CFA)
        taxRate: 0.18,                             // 18% de TVA (taux standard Togo)
        currencyFormat: {
            locale: "fr-FR",                       // Localisation française pour le formatage
            minimumFractionDigits: 0,              // Pas de décimales (FCFA = monnaie entière)
            maximumFractionDigits: 0
        }
    },

    // ===== OPTIONS DE LIVRAISON =====
    // Configuration des partenaires de livraison avec tarifs et délais
    delivery: {
        options: [
            {
                id: "gozem",
                name: "Gozem Express",
                cost: 1500,                        // Coût en FCFA
                time: "30-45 minutes",             // Délai estimé
                description: "Livraison rapide et fiable",
                available: true                    // Disponibilité (peut être désactivé)
            },
            {
                id: "bkg",
                name: "Bkg Standard",
                cost: 1200,
                time: "45-60 minutes",
                description: "Livraison standard économique",
                available: true
            },
            {
                id: "ole",
                name: "Olé Économique",
                cost: 800,
                time: "60-90 minutes",
                description: "Option la plus économique",
                available: true
            },
            {
                id: "pickup",
                name: "Retrait en Boutique",
                cost: 0,                           // Gratuit
                time: "15-20 minutes",
                description: "Gratuit, prêt rapidement",
                available: true
            }
        ],
        defaultOption: "gozem"                     // Option sélectionnée par défaut
    },

    // ===== OPTIONS DE PAIEMENT =====
    // Méthodes de paiement disponibles avec niveau de sécurité
    payment: {
        methods: [
            {
                id: "mobile-money",
                name: "Mobile Money",
                description: "Orange Money, Wave, etc.",  // Services populaires au Togo
                available: true,
                secure: true                       // Paiement sécurisé
            },
            {
                id: "card",
                name: "Carte Bancaire",
                description: "Visa, Mastercard",
                available: true,
                secure: true
            },
            {
                id: "cash",
                name: "Paiement à la Livraison",
                description: "Espèces",
                available: true,
                secure: false                      // Moins sécurisé (pas de garantie)
            }
        ],
        defaultMethod: "mobile-money"              // Méthode par défaut (populaire au Togo)
    },

    // Configuration des notifications
    notifications: {
        autoSave: true,
        showSuccess: true,
        showErrors: true,
        timeout: 3000
    },

    // Configuration du panier
    cart: {
        maxItems: 50,
        autoSave: true,
        localStorageKey: "kate_pastry_cart",
        userDataKey: "kate_pastry_userData",
        orderDataKey: "kate_pastry_orderData"
    },

    // Configuration des images
    images: {
        fallbackImage: "https://images.unsplash.com/photo-1555507036-ab794f4ade2a?q=80&w=2940&auto=format&fit=crop",
        lazyLoading: true,
        errorHandling: true
    },

    // Configuration des animations
    animations: {
        enabled: true,
        duration: 300,
        easing: "ease-in-out"
    },

    // Configuration de la navigation
    navigation: {
        smoothScrolling: true,
        mobileBreakpoint: 768,
        stickyHeader: true
    },

    // Configuration des formulaires
    forms: {
        autoSave: true,
        validation: true,
        showProgress: true
    },

    // Configuration des erreurs
    errorHandling: {
        showUserFriendly: true,
        logToConsole: true,
        fallbackMessages: {
            network: "Erreur de connexion. Veuillez réessayer.",
            validation: "Veuillez vérifier les informations saisies.",
            general: "Une erreur s'est créatione. Veuillez réessayer."
        }
    },

    // Configuration des performances
    performance: {
        debounceDelay: 300,
        throttleDelay: 100,
        maxRetries: 3
    },

    // Configuration de la sécurité
    security: {
        csrfProtection: true,
        xssProtection: true,
        secureHeaders: true
    },

    // Configuration de l'accessibilité
    accessibility: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        highContrast: false,
        fontSizeAdjustment: true
    },

    // Configuration de l'internationalisation
    i18n: {
        defaultLocale: "fr",
        supportedLocales: ["fr", "en"],
        fallbackLocale: "fr",
        dateFormat: "DD/MM/YYYY",
        timeFormat: "HH:mm"
    },

    // Configuration des réseaux sociaux
    social: {
        facebook: "https://facebook.com/katespastry",
        twitter: "https://twitter.com/katespastry",
        instagram: "https://instagram.com/katespastry",
        pinterest: "https://pinterest.com/katespastry"
    },

    // Configuration des partenaires
    partners: {
        delivery: ["Gozem", "Bkg", "Olé"],
        payment: ["Orange Money", "Wave", "Visa", "Mastercard"]
    },

    // ===== HORAIRES D'OUVERTURE =====
    // Horaires par jour de la semaine (format 24h)
    // UTILISATION: Validation des créneaux de livraison, affichage des horaires
    businessHours: {
        monday: { open: "06:00", close: "19:00" },     // Lundi: 6h-19h
        tuesday: { open: "06:00", close: "19:00" },    // Mardi: 6h-19h
        wednesday: { open: "06:00", close: "19:00" },  // Mercredi: 6h-19h
        thursday: { open: "06:00", close: "19:00" },   // Jeudi: 6h-19h
        friday: { open: "06:00", close: "19:00" },     // Vendredi: 6h-19h
        saturday: { open: "06:00", close: "18:00" },   // Samedi: 6h-18h (fermeture plus tôt)
        sunday: { open: "07:00", close: "16:00" }      // Dimanche: 7h-16h (horaires réduits)
    },

    // Configuration des promotions
    promotions: {
        welcomeDiscount: 0.10, // 10% de réduction
        loyaltyProgram: true,
        referralBonus: 0.05, // 5% de bonus par parrainage
        seasonalOffers: true
    },

    // Configuration de la qualité
    quality: {
        guarantee: "Satisfaction garantie ou remboursé",
        freshness: "Préparé le jour même",
        ingredients: "Ingrédients frais et locaux",
        certification: "HACCP, Bio"
    },

    // ===== CONFIGURATION DE LA LIVRAISON =====
    // Règles métier pour les commandes et la livraison
    deliveryConfig: {
        minOrderAmount: 2000,                      // Montant minimum de commande (FCFA)
        freeDeliveryThreshold: 10000,              // Seuil pour livraison gratuite (FCFA)
        maxDeliveryDistance: 25,                   // Distance maximum de livraison (km)
        preparationTime: 15,                       // Temps de préparation minimum (minutes)
        trackingEnabled: true                      // Suivi de commande activé
    },

    // Configuration des catégories de créations
    productCategories: [
        {
            id: "croissants",
            name: "Croissants",
            description: "Croissants traditionnels français",
            image: "croissants.jpg",
            featured: true
        },
        {
            id: "pains-chocolat",
            name: "Pains au Chocolat",
            description: "Pains au chocolat artisanaux",
            image: "pains-chocolat.jpg",
            featured: true
        },
        {
            id: "brioches",
            name: "Brioches",
            description: "Brioches moelleuses et dorées",
            image: "brioches.jpg",
            featured: true
        },
        {
            id: "saisonnier",
            name: "Créations Saisonnières",
            description: "Spécialités selon les saisons",
            image: "saisonnier.jpg",
            featured: false
        }
    ],

    // Configuration des filtres de créations
    productFilters: {
        priceRange: {
            min: 1500,
            max: 8500,
            step: 500
        },
        dietaryOptions: [
            "bio",
            "beurre-francais",
            "sans-gluten",
            "vegan"
        ],
        allergens: [
            "gluten",
            "lactose",
            "œufs",
            "noix",
            "soja"
        ]
    },

    // Configuration des avis et évaluations
    reviews: {
        enabled: true,
        moderation: true,
        minLength: 10,
        maxLength: 500,
        ratingSystem: "5 étoiles"
    },

    // Configuration de la newsletter
    newsletter: {
        enabled: true,
        doubleOptIn: true,
        frequency: "weekly",
        categories: ["promotions", "nouveautés", "recettes", "événements"]
    },

    // Configuration du support client
    customerSupport: {
        phone: "+228 91 23 47 97",
        email: "support@katespastry.com",
        chat: true,
        responseTime: "2 heures",
        languages: ["français", "anglais"]
    },

    // Configuration de la maintenance
    maintenance: {
        enabled: false,
        message: "Site en maintenance. Nous serons de retour bientôt !",
        estimatedTime: "30 minutes"
    }
};

// ===== EXPOSITION GLOBALE =====
// Rend la configuration accessible depuis tous les scripts
window.AppConfig = AppConfig;

// =============================================
// APP-UTILS - Fonctions Utilitaires
// =============================================
//
// OBJECTIF: Fournit des fonctions helper basées sur la configuration
// DÉPENDANCES: AppConfig (doit être chargé avant)
//
// FONCTIONS PRINCIPALES:
// - formatPrice(): Formatage des prix selon la locale
// - calculateTax(): Calcul de la TVA
// - isOpen(): Vérification des horaires d'ouverture
// - validatePhone(): Validation numéro togolais
// - generateOrderId(): Génération d'ID de commande unique
//
// NOTE: Ces fonctions sont exposées globalement via window.AppUtils

const AppUtils = {
    // ===== FORMATAGE ET CALCULS =====
    
    // Formate un prix selon la configuration locale
    // PARAMÈTRE: price = montant numérique
    // RETOUR: string formatée (ex: "1 500 FCFA")
    formatPrice: function(price) {
        return price.toLocaleString(
            AppConfig.pricing.currencyFormat.locale,
            AppConfig.pricing.currencyFormat
        ) + ' ' + AppConfig.pricing.currency;
    },

    // ===== ACCESSEURS DE CONFIGURATION =====
    
    // Récupère une option de livraison par son identifiant
    // PARAMÈTRE: id = identifiant de l'option ("gozem", "bkg", etc.)
    // RETOUR: objet option ou undefined si non trouvé
    getDeliveryOption: function(id) {
        return AppConfig.delivery.options.find(option => option.id === id);
    },

    // Récupère une méthode de paiement par son identifiant
    // PARAMÈTRE: id = identifiant de la méthode ("mobile-money", "card", etc.)
    getPaymentMethod: function(id) {
        return AppConfig.payment.methods.find(method => method.id === id);
    },

    // Vérifie la disponibilité d'une option de livraison ou paiement
    // PARAMÈTRES: type = "delivery" ou "payment", id = identifiant de l'option
    // RETOUR: boolean
    isAvailable: function(type, id) {
        if (type === 'delivery') {
            const option = this.getDeliveryOption(id);
            return option && option.available;
        } else if (type === 'payment') {
            const method = this.getPaymentMethod(id);
            return method && method.available;
        }
        return false;
    },

    // Calcule le montant de la TVA
    // PARAMÈTRE: amount = montant HT
    // RETOUR: montant de la TVA arrondi
    calculateTax: function(amount) {
        return Math.round(amount * AppConfig.pricing.taxRate);
    },

    // Calcule le total TTC avec livraison
    // PARAMÈTRES: subtotal = sous-total HT, deliveryCost = coût de livraison
    // RETOUR: montant total TTC
    calculateTotal: function(subtotal, deliveryCost) {
        const tax = this.calculateTax(subtotal + deliveryCost);
        return subtotal + deliveryCost + tax;
    },

    // Vérifie si la commande bénéficie de la livraison gratuite
    // PARAMÈTRE: amount = montant de la commande
    isFreeDelivery: function(amount) {
        return amount >= AppConfig.deliveryConfig.freeDeliveryThreshold;
    },

    // Retourne le temps de préparation minimum
    getPreparationTime: function() {
        return AppConfig.deliveryConfig.preparationTime;
    },

    // ===== GESTION DES HORAIRES =====
    
    // Vérifie si la boulangerie est actuellement ouverte
    // RETOUR: boolean
    isOpen: function() {
        const now = new Date();
        const day = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const time = now.toLocaleTimeString('en-US', { hour12: false });
        
        const hours = AppConfig.businessHours[day];
        if (!hours) return false;
        
        return time >= hours.open && time <= hours.close;
    },

    // Calcule le prochain créneau d'ouverture
    // RETOUR: string décrivant la prochaine ouverture
    getNextOpeningTime: function() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const day = tomorrow.toLocaleDateString('en-US', { weekday: 'lowercase' });
        const hours = AppConfig.businessHours[day];
        
        if (hours) {
            return `${hours.open} demain`;
        }
        
        return "Fermé demain";
    },

    // ===== VALIDATION =====
    
    // Valide un numéro de téléphone togolais
    // PARAMÈTRE: phone = numéro à valider (avec ou sans espaces)
    // FORMAT ACCEPTÉ: +228XXXXXXXX, 228XXXXXXXX, ou XXXXXXXX (8 chiffres)
    validatePhone: function(phone) {
        const phoneRegex = /^(\+228|228)?[0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    // Valide une adresse email (validation basique)
    // PARAMÈTRE: email = adresse à valider
    validateEmail: function(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // ===== GÉNÉRATION D'IDENTIFIANTS =====
    
    // Génère un identifiant unique de commande
    // FORMAT: VN-YYYY-MM-DD-XXXX (VN = Viennoiserie, XXXX = nombre aléatoire)
    // RETOUR: string (ex: "VN-2025-08-17-1234")
    generateOrderId: function() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `VN-${year}-${month}-${day}-${random}`;
    },

    // ===== UTILITAIRES DE PERFORMANCE =====
    
    // Débounce une fonction (retarde l'exécution jusqu'à l'arrêt des appels)
    // USAGE: Éviter les appels répétés lors de la saisie utilisateur
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Throttle une fonction (limite la fréquence d'exécution)
    // USAGE: Éviter les appels trop fréquents lors du scroll ou resize
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // ===== GESTION D'ERREURS =====
    
    // Gère les erreurs de manière centralisée avec messages utilisateur
    // PARAMÈTRES: error = objet erreur, context = contexte de l'erreur
    handleError: function(error, context = 'general') {
        console.error(`Erreur dans ${context}:`, error);
        
        const message = AppConfig.errorHandling.fallbackMessages[context] || 
                       AppConfig.errorHandling.fallbackMessages.general;
        
        if (AppConfig.errorHandling.showUserFriendly) {
            // Affiche un message d'erreur convivial à l'utilisateur
            this.showNotification(message, 'error');
        }
    },

    // ===== NOTIFICATIONS =====
    
    // Affiche une notification toast à l'utilisateur
    // PARAMÈTRES: message = texte à afficher, type = 'info'|'success'|'error'|'warning'
    showNotification: function(message, type = 'info') {
        // Respecte les préférences de configuration
        if (!AppConfig.notifications.showSuccess && type === 'success') return;
        if (!AppConfig.notifications.showErrors && type === 'error') return;
        
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-large z-50 transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-success text-white' :
            type === 'error' ? 'bg-error text-white' :
            type === 'warning' ? 'bg-warning text-white' :
            'bg-accent text-white'
        }`;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Animation d'entrée (slide-in depuis la droite)
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        // Animation de sortie et suppression après délai configuré
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, AppConfig.notifications.timeout);
    }
};

// ===== EXPOSITION GLOBALE DES UTILITAIRES =====
window.AppUtils = AppUtils;

// Log de confirmation du chargement
console.log('📋 Configuration de l\'application chargée');
console.log('🛠️ Utilitaires AppUtils disponibles globalement');

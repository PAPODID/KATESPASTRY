// =============================================
// PATH-CONFIG.JS - Gestionnaire de Chemins Dynamiques
// =============================================
//
// OBJECTIF: Détermine automatiquement les chemins corrects pour les ressources
// UTILISATION: Chargé en premier pour configurer les chemins CSS, JS, pages et images
// FONCTIONNEMENT: IIFE qui s'adapte à l'environnement (développement local vs production)
//
// FONCTIONNALITÉS PRINCIPALES:
// - Détection automatique de l'environnement (localhost vs production)
// - Configuration des chemins pour CSS, JavaScript, pages HTML et images
// - Chargement dynamique des feuilles de style
// - Navigation programmatique entre les pages
// - Gestion des URLs relatives et absolues
//
// POINTS D'ATTENTION:
// - Utilise window.location pour détecter l'environnement
// - Expose PathConfig globalement via window.PathConfig
// - Doit être chargé avant les autres scripts qui dépendent des chemins
//
// TODO: Ajouter la gestion du cache-busting pour les ressources
// NOTE: Configuration critique pour le bon fonctionnement multi-environnement

(function() {
  // ===== DÉTECTION D'ENVIRONNEMENT =====
  // Détermine si l'application s'exécute en local ou en production
  // LOGIQUE: Vérifie le hostname pour identifier l'environnement
  const isLocalhost = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' || 
                     window.location.hostname === '';           // Fichier ouvert directement

  // ===== CONFIGURATION DES CHEMINS DE BASE =====
  // Définit les chemins selon l'environnement détecté
  // STRUCTURE: Chemins relatifs en local, absolus en production
  const basePaths = {
    css: isLocalhost ? '../css/' : '/css/',                    // Feuilles de style
    js: isLocalhost ? './' : '/public/',                       // Scripts JavaScript
    pages: isLocalhost ? '../pages/' : '/pages/',              // Pages HTML
    images: isLocalhost ? '../public/photos/' : '/public/photos/', // Images produits
    data: isLocalhost ? '../data/' : '/data/'                  // Fichiers JSON
  };

  // ===== OBJET PRINCIPAL DE CONFIGURATION =====
  // Centralise toutes les fonctionnalités de gestion des chemins
  const PathConfig = {
    // Chemins de base exposés
    paths: basePaths,

    // Détection d'environnement exposée
    isLocalhost: isLocalhost,

    // ===== FONCTIONS UTILITAIRES =====
    
    /**
     * Construit le chemin complet pour une ressource
     * PARAMÈTRES: type = type de ressource (css, js, pages, images, data)
     *            filename = nom du fichier
     * RETOUR: string du chemin complet
     */
    getPath: function(type, filename) {
      if (!this.paths[type]) {
        console.warn(`⚠️ Type de chemin inconnu: ${type}`);
        return filename;                                 // Fallback sur le nom de fichier
      }
      return this.paths[type] + filename;
    },

    /**
     * Charge dynamiquement une feuille de style CSS
     * PARAMÈTRE: filename = nom du fichier CSS (ex: 'main.css')
     * RETOUR: élément <link> créé
     * EFFET DE BORD: Ajoute la feuille de style au <head>
     */
    loadCSS: function(filename) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = this.getPath('css', filename);
      document.head.appendChild(link);
      console.log(`🎨 CSS chargé: ${filename}`);
      return link;
    },

    /**
     * Charge dynamiquement un script JavaScript
     * PARAMÈTRES: filename = nom du fichier JS
     *            callback = fonction à exécuter après chargement (optionnel)
     * RETOUR: élément <script> créé
     * EFFET DE BORD: Ajoute le script au <head>
     */
    loadJS: function(filename, callback) {
      const script = document.createElement('script');
      script.src = this.getPath('js', filename);
      script.onload = callback || function() {
        console.log(`📜 Script chargé: ${filename}`);
      };
      script.onerror = function() {
        console.error(`❌ Échec du chargement: ${filename}`);
      };
      document.head.appendChild(script);
      return script;
    },

    /**
     * Navigation programmatique vers une page
     * PARAMÈTRE: pageName = nom de la page (ex: 'product_catalog.html')
     * EFFET DE BORD: Redirige le navigateur vers la page spécifiée
     */
    navigateTo: function(pageName) {
      const fullPath = this.getPath('pages', pageName);
      console.log(`🧭 Navigation vers: ${pageName}`);
      window.location.href = fullPath;
    },

    /**
     * Obtient le chemin complet d'une image
     * PARAMÈTRE: imageName = nom de l'image (ex: 'croissant.jpg')
     * RETOUR: string du chemin complet vers l'image
     */
    getImagePath: function(imageName) {
      return this.getPath('images', imageName);
    },

    /**
     * Obtient le chemin complet d'un fichier de données
     * PARAMÈTRE: dataFile = nom du fichier (ex: 'produits.json')
     * RETOUR: string du chemin complet vers le fichier de données
     */
    getDataPath: function(dataFile) {
      return this.getPath('data', dataFile);
    },

    /**
     * Vérifie si un chemin est absolu
     * PARAMÈTRE: path = chemin à vérifier
     * RETOUR: boolean (true si le chemin est absolu)
     * LOGIQUE: Détecte les URLs complètes et les chemins absolus
     */
    isAbsolutePath: function(path) {
      return path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/');
    },

    /**
     * Obtient le nom de la page courante
     * RETOUR: string du nom de fichier de la page actuelle
     * UTILISATION: Utile pour la navigation conditionnelle
     */
    getCurrentPageName: function() {
      const path = window.location.pathname;
      return path.split('/').pop() || 'index.html';      // Fallback sur index.html
    },

    /**
     * Fonction de debug pour afficher toutes les configurations
     * UTILISATION: PathConfig.debugPaths() dans la console
     * EFFET DE BORD: Affiche les informations de configuration dans la console
     */
    debugPaths: function() {
      console.group('🔧 PathConfig Debug');
      console.log('Environnement:', this.isLocalhost ? '🏠 Local' : '🌐 Production');
      console.log('Chemins de base:', this.paths);
      console.log('Page courante:', this.getCurrentPageName());
      console.log('URL complète:', window.location.href);
      console.groupEnd();
    }
  };

  // ===== EXPOSITION GLOBALE =====
  // Rend PathConfig accessible depuis n'importe quel script
  window.PathConfig = PathConfig;

  // ===== CHARGEMENT AUTOMATIQUE =====
  // Charge automatiquement la feuille de style principale si nécessaire
  const currentPage = PathConfig.getCurrentPageName();
  if (currentPage !== 'index.html') {
    PathConfig.loadCSS('main.css');                      // Charge main.css pour toutes les pages sauf index
  }

  // ===== INITIALISATION COMPLÈTE =====
  console.log(`🚀 PathConfig initialisé pour l'environnement ${PathConfig.isLocalhost ? '🏠 local' : '🌐 production'}`);
  
  // Debug automatique en développement
  if (PathConfig.isLocalhost && window.location.search.includes('debug=paths')) {
    PathConfig.debugPaths();
  }

})();

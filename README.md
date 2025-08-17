# 🥖 KATE'S PASTRY - Application E-commerce de Boulangerie Artisanale

Une application web moderne et responsive pour une boulangerie artisanale française, offrant une expérience utilisateur élégante et un système e-commerce complet. Développée avec HTML5, CSS3 et JavaScript, elle propose un catalogue de produits, un panier d'achat avancé et une intégration avec Google Apps Script pour la gestion des commandes.

## ✨ Fonctionnalités Principales

- **🎨 Design Élégant** - Interface moderne et responsive avec animations fluides
- **🛒 E-commerce Complet** - Système de panier et processus de commande intégré
- **📱 Mobile-First** - Design entièrement responsive optimisé pour tous les appareils
- **⚡ Performance Optimisée** - Images optimisées et structure de code efficace
- **🎭 Éléments Interactifs** - Animations et interactions utilisateur fluides
- **🌍 Support Multi-langues** - Contenu en français et anglais
- **📸 Galerie Produits** - Présentation élégante des produits avec carousel
- **📊 Gestion des Commandes** - Intégration Google Apps Script pour le suivi
- **💳 Options de Paiement** - Mobile Money, Carte bancaire, Paiement à la livraison
- **🚚 Options de Livraison** - Gozem Express, Bkg Standard, Olé Économique, Retrait

## 🛠️ Technologies Utilisées

- **Frontend** : HTML5, CSS3 (Tailwind CSS), JavaScript (Vanilla)
- **Hébergement** : Firebase Hosting
- **Backend** : Google Apps Script pour la gestion des commandes
- **Proxy API** : Cloudflare Workers (rex-proxy)
- **Gestion des Données** : JSON local, Google Sheets
- **Tests** : Vitest (pour le proxy)

## 📋 Prérequis

- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Aucune installation serveur requise - fonctionne directement dans le navigateur
- Optionnel : Serveur de développement local pour les tests

## 🚀 Installation et Configuration

### Installation Basique

1. **Cloner le repository :**
   ```bash
   git clone <votre-repository-url>
   cd kate-pastry-project
   ```

2. **Ouvrir le projet :**
   - Ouvrir directement `index.html` dans votre navigateur
   - Ou utiliser un serveur de développement local :
     ```bash
     # Avec Python
     python -m http.server 8000
     
     # Avec Node.js
     npx serve .
     
     # Avec PHP
     php -S localhost:8000
     ```

3. **Accéder à l'application :**
   - Naviguer vers `http://localhost:8000` (si serveur local)
   - Ou ouvrir `index.html` directement

### Configuration Avancée (Google Apps Script)

Pour activer la gestion des commandes via Google Sheets :

1. **Créer un classeur Google Sheets** avec les feuilles "Commandes" et "Clients"
2. **Déployer le script Google Apps Script** (voir `google-apps-script-complet.js`)
3. **Configurer l'URL du script** dans les fichiers de configuration
4. **Tester l'intégration** avec une commande test

Consultez le `Guide_Integration_Google_Apps_Script.md` pour les détails complets.

## 📁 Structure du Projet

```
kate-pastry-project/
├── index.html                      # Point d'entrée avec écran de chargement
├── css/
│   └── main.css                    # Feuille de style principale (Tailwind CSS)
├── pages/                          # Pages de l'application
│   ├── homepage.html               # Page d'accueil avec hero section
│   ├── product_catalog.html        # Catalogue des produits
│   ├── product_detail_page.html    # Détails des produits
│   ├── shopping_cart_checkout.html # Panier et processus de commande
│   ├── order_confirmation.html     # Confirmation de commande
│   ├── order_receipt.html          # Reçu de commande
│   └── contact_location.html       # Contact et localisation
├── public/                         # Assets statiques et scripts
│   ├── photos/                     # Images des produits
│   ├── app-config.js               # Configuration centralisée
│   ├── cart-manager.js             # Gestionnaire de panier
│   ├── dhws-data-injector.js       # Injection de données
│   └── path-config.js              # Configuration des chemins
├── data/
│   └── produits.json               # Base de données des produits
├── rex-proxy/                      # Proxy Cloudflare Workers
│   ├── src/index.js                # Code du proxy
│   ├── package.json                # Dépendances du proxy
│   └── wrangler.jsonc              # Configuration Cloudflare
├── firebase.json                   # Configuration Firebase Hosting
├── google-apps-script-complet.js   # Script Google Apps Script
├── Guide_Integration_Google_Apps_Script.md # Guide d'intégration
└── README.md                       # Documentation du projet
```

## 🎯 Catalogue Produits

L'application propose **11 produits artisanaux** répartis en plusieurs catégories :

### 🧁 Pâtisseries Sucrées
- **Cake Simple** (100 FCFA) - Délice moelleux et réconfortant
- **CupCake Vanille Chocolat** (300 FCFA) - Petit gâteau individuel irrésistible
- **Roulé au Chocolat** (300 FCFA) - Biscuit génoise avec crème chocolat

### 🥞 Crêpes
- **Crêpes au Chocolat** (200 FCFA) - Fines et légères, nappées de chocolat
- **Crêpes Simples** (150 FCFA) - Crêpe traditionnelle nature

### 🥐 Viennoiseries Salées
- **Friand à la Viande** (700 FCFA) - Chausson feuilleté avec farce généreuse
- **Friand au Poisson** (500 FCFA) - Pâte feuilletée avec garniture au poisson
- **Roulé aux Saucisses** (300 FCFA) - Pâte briochée autour d'une saucisse

### 🍕 Snacks Salés
- **Mini Pizza** (500 FCFA) - Explosion de saveurs italiennes
- **Pastel** (200 FCFA) - Chausson frit à la pâte croustillante

### 🎂 Gâteaux Spéciaux
- **Gâteau d'Anniversaire Personnalisé** (à partir de 5000 FCFA) - Sur mesure

## 💳 Système de Paiement et Livraison

### Options de Paiement
- **Mobile Money** - Orange Money, Wave, etc.
- **Carte Bancaire** - Visa, Mastercard
- **Paiement à la Livraison** - Espèces

### Options de Livraison
- **Gozem Express** (1500 FCFA) - 30-45 minutes
- **Bkg Standard** (1200 FCFA) - 45-60 minutes
- **Olé Économique** (800 FCFA) - 60-90 minutes
- **Retrait en Boutique** (Gratuit) - 15-20 minutes

### Conditions
- **Commande minimum** : 2000 FCFA
- **Livraison gratuite** : à partir de 10000 FCFA
- **Délai de préparation** : 24h minimum obligatoire
- **TVA** : 18% incluse dans les prix

## 🎨 Caractéristiques Techniques

### Design Responsive
- **Mobile** : Optimisé smartphones (320px+)
- **Tablette** : Layout amélioré (768px+)
- **Desktop** : Expérience complète (1024px+)
- **Grand écran** : Optimisé (1280px+)

### Palette de Couleurs
- **Primaire** : Bruns chauds et crèmes (#8B4513, #D2691E)
- **Accent** : Touches dorées pour un aspect premium
- **Arrière-plan** : Dégradés pour l'attrait visuel

### Animations
- **Écran de chargement** : Fade-in fluide avec animation rotative
- **Transitions** : Transitions élégantes entre les pages
- **Éléments interactifs** : Effets de survol et transitions fluides

## 🔧 Utilisation et Personnalisation

### Modification du Contenu
1. **Produits** : Éditer `data/produits.json` pour ajouter/modifier les produits
2. **Configuration** : Modifier `public/app-config.js` pour les paramètres globaux
3. **Styles** : Personnaliser `css/main.css` pour les changements de design
4. **Images** : Remplacer les images dans `public/photos/`

### Fonctionnalités Avancées
- **Gestion du panier** : `public/cart-manager.js`
- **Configuration des chemins** : `public/path-config.js`
- **Injection de données** : `public/dhws-data-injector.js`

## 🚀 Déploiement

### Hébergement Statique
Le projet peut être déployé sur :
- **Firebase Hosting** (configuration incluse)
- **GitHub Pages**
- **Netlify**
- **Vercel**

### Commandes de Déploiement
```bash
# Firebase Hosting
firebase deploy

# Développement local avec rechargement automatique
npx serve . --live

# Serveur Python simple
python -m http.server 8000
```

### Configuration du Proxy (rex-proxy)
Pour le proxy Cloudflare Workers :
```bash
cd rex-proxy
npm install
npm run deploy  # Déploie sur Cloudflare Workers
npm run dev     # Développement local
npm test        # Tests avec Vitest
```

## 🧪 Tests et Développement

### Tests du Proxy
```bash
cd rex-proxy
npm test  # Lance les tests Vitest
```

### Développement Local
1. **Serveur de développement** : `python -m http.server 8000`
2. **Tests d'intégration** : Utiliser le guide Google Apps Script
3. **Debug** : Console navigateur pour les logs JavaScript

## 🤝 Contribution

1. **Fork** le repository
2. **Créer une branche** : `git checkout -b feature/nouvelle-fonctionnalite`
3. **Commit** les changements : `git commit -m 'Ajouter nouvelle fonctionnalité'`
4. **Push** vers la branche : `git push origin feature/nouvelle-fonctionnalite`
5. **Ouvrir une Pull Request**

### Guidelines de Contribution
- Respecter la structure de code existante
- Tester les modifications sur mobile et desktop
- Documenter les nouvelles fonctionnalités
- Maintenir la compatibilité avec l'intégration Google Apps Script

## 📞 Support et Contact

### Informations de Contact
- **Téléphone** : +228 91 23 47 97
- **Email** : katebertrya@gmail.com
- **Adresse** : 123 Avenue de la Paix, Lomé

### Horaires d'Ouverture
- **Lundi-Vendredi** : 06h00 - 19h00
- **Samedi** : 06h00 - 18h00
- **Dimanche** : 07h00 - 16h00

## 📄 Licence

Ce projet est open source et disponible sous licence MIT. Voir les fichiers de licence dans le dossier `rex-proxy/node_modules/` pour les dépendances.

## 🙏 Remerciements

- **Inspiration Design** : Esthétique des boulangeries artisanales françaises
- **Icônes** : Icônes SVG personnalisées pour le thème boulangerie
- **Images** : Photographie de produits haute qualité
- **Typographie** : Polices modernes pour un aspect premium
- **Technologies** : Firebase, Google Apps Script, Cloudflare Workers

---

**Développé avec ❤️ pour l'amour de la boulangerie artisanale**

*Découvrez le goût de la tradition avec KATE'S PASTRY*

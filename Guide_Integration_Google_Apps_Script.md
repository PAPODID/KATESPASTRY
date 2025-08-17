# Guide d'Intégration Google Apps Script - KATE'S PASTRY

## Vue d'ensemble
Ce guide détaille l'intégration du site e-commerce avec Google Sheets via Google Apps Script pour automatiser la gestion des commandes.

## 1. Préparation du Classeur Google Sheets

### 1.1 Création du classeur
- **Nom du classeur** : `Commandes_KatesPastry_2025-08`
- **URL** : Créer sur Google Sheets et noter l'ID du classeur

### 1.2 Structure des feuilles

#### Feuille "Commandes"
```
| ID_Commande | Date | Nom_Client | Prenom_Client | Telephone | Email |
| Articles | Total_HT | Adresse_Livraison | Distance_km | Cout_Livraison |
| Montant_Paye | Mode_Paiement | Statut |
```

#### Feuille "Clients"
```
| Email | Nom | Prenom | Telephone | Historique_Commandes |
```

### 1.3 Configuration des permissions
- Partager le classeur avec l'email du script Apps Script
- Donner les droits d'édition

## 2. Création du Script Google Apps Script

### 2.1 Nouveau projet
1. Aller sur `script.google.com`
2. Créer un nouveau projet : `Integration_Commandes_KatesPastry`
3. Remplacer le code par défaut

### 2.2 Code du script principal

```javascript
// Configuration
const SPREADSHEET_ID = 'VOTRE_ID_CLASSEUR_ICI';
const ORDERS_SHEET_NAME = 'Commandes';
const CLIENTS_SHEET_NAME = 'Clients';

function doPost(e) {
  try {
    // Parse les données reçues
    const data = JSON.parse(e.postData.contents);
    
    // Validation des données requises
    if (!data.customerData || !data.cartData) {
      return ContentService
        .createTextOutput(JSON.stringify({error: 'Données manquantes'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Ouvrir le classeur
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    
    // Enregistrer la commande
    const orderId = saveOrder(spreadsheet, data);
    
    // Mettre à jour les données client
    updateClient(spreadsheet, data.customerData);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        orderId: orderId,
        message: 'Commande enregistrée avec succès'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Erreur:', error);
    return ContentService
      .createTextOutput(JSON.stringify({
        error: 'Erreur serveur: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function saveOrder(spreadsheet, data) {
  const sheet = spreadsheet.getSheetByName(ORDERS_SHEET_NAME);
  const orderId = `CMD-${Date.now()}`;
  
  // Formatter les articles
  const articlesText = data.cartData.items.map(item => 
    `${item.name} (${item.quantity}×${item.price} FCFA)`
  ).join('; ');
  
  // Calculer les totaux
  const totalHT = data.cartData.total;
  const coutLivraison = data.deliveryData ? data.deliveryData.cost : 0;
  const montantTotal = totalHT + coutLivraison;
  
  // Ajouter la ligne
  sheet.appendRow([
    orderId,
    new Date(),
    data.customerData.lastName,
    data.customerData.firstName,
    data.customerData.phone,
    data.customerData.email,
    articlesText,
    totalHT,
    data.deliveryData ? data.deliveryData.address : '',
    data.deliveryData ? data.deliveryData.distance : 0,
    coutLivraison,
    montantTotal,
    data.deliveryData ? data.deliveryData.paymentMethod : '',
    'En attente'
  ]);
  
  return orderId;
}

function updateClient(spreadsheet, customerData) {
  const sheet = spreadsheet.getSheetByName(CLIENTS_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  
  // Chercher si le client existe
  let clientRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === customerData.email) {
      clientRow = i + 1;
      break;
    }
  }
  
  if (clientRow === -1) {
    // Nouveau client
    sheet.appendRow([
      customerData.email,
      customerData.lastName,
      customerData.firstName,
      customerData.phone,
      1
    ]);
  } else {
    // Mettre à jour le nombre de commandes
    const currentCount = sheet.getRange(clientRow, 5).getValue();
    sheet.getRange(clientRow, 5).setValue(currentCount + 1);
  }
}

// Fonction de test
function testDoPost() {
  const testData = {
    customerData: {
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '+228 91 23 45 67'
    },
    cartData: {
      items: [
        {name: 'Croissant', quantity: 2, price: 500},
        {name: 'Pain au chocolat', quantity: 1, price: 600}
      ],
      total: 1600
    },
    deliveryData: {
      address: '123 Avenue de la Paix, Lomé',
      cost: 1500,
      distance: 5,
      paymentMethod: 'Mobile Money'
    }
  };
  
  const e = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  console.log(doPost(e).getContent());
}
```

### 2.3 Déploiement
1. Cliquer sur "Déployer" > "Nouveau déploiement"
2. Type : "Application web"
3. Exécuter en tant que : "Moi"
4. Accès : "Tout le monde"
5. Copier l'URL de déploiement

## 3. Intégration côté Site Web

### 3.1 Modification de localisation_livraison.html

Ajouter cette fonction JavaScript :

```javascript
// Configuration API
const APPS_SCRIPT_URL = 'VOTRE_URL_DEPLOYMENT_ICI';

async function envoyerCommande() {
  try {
    // Récupérer les données stockées
    const customerData = JSON.parse(localStorage.getItem('customerData') || '{}');
    const cartData = JSON.parse(localStorage.getItem('cartData') || '{}');
    const deliveryData = JSON.parse(localStorage.getItem('deliveryData') || '{}');
    
    // Validation
    if (!customerData.email || !cartData.items || cartData.items.length === 0) {
      alert('Données de commande incomplètes');
      return;
    }
    
    // Préparer les données
    const orderData = {
      customerData: customerData,
      cartData: cartData,
      deliveryData: deliveryData,
      timestamp: new Date().toISOString()
    };
    
    // Afficher le loader
    showLoader('Enregistrement de votre commande...');
    
    // Envoyer à Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });
    
    const result = await response.json();
    
    hideLoader();
    
    if (result.success) {
      // Sauvegarder l'ID de commande
      localStorage.setItem('lastOrderId', result.orderId);
      
      // Vider le panier
      if (typeof cartManager !== 'undefined') {
        cartManager.clearCart();
      }
      
      // Rediriger vers la page de confirmation
      window.location.href = 'order_confirmation.html';
    } else {
      throw new Error(result.error || 'Erreur inconnue');
    }
    
  } catch (error) {
    hideLoader();
    console.error('Erreur lors de l\'envoi:', error);
    alert('Erreur lors de l\'enregistrement de la commande. Veuillez réessayer.');
  }
}

function showLoader(message) {
  // Créer ou afficher un loader
  let loader = document.getElementById('order-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'order-loader';
    loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    loader.innerHTML = `
      <div class="bg-white p-6 rounded-lg text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto mb-4"></div>
        <p class="font-body text-primary">${message}</p>
      </div>
    `;
    document.body.appendChild(loader);
  }
  loader.style.display = 'flex';
}

function hideLoader() {
  const loader = document.getElementById('order-loader');
  if (loader) {
    loader.style.display = 'none';
  }
}
```

### 3.2 Bouton de validation

Modifier le bouton de validation de commande :

```html
<button onclick="envoyerCommande()" class="btn-primary w-full">
  Valider la Commande
</button>
```

## 4. Page de Confirmation

### 4.1 Créer order_confirmation.html

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commande Confirmée - KATE'S PASTRY</title>
    <link rel="stylesheet" href="../css/main.css">
</head>
<body class="bg-background">
    <div class="container mx-auto px-4 py-12">
        <div class="max-w-2xl mx-auto text-center">
            <div class="bg-success text-white p-6 rounded-lg mb-8">
                <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
                <h1 class="font-headline text-2xl font-bold mb-2">Commande Confirmée !</h1>
                <p class="font-body">Votre commande a été enregistrée avec succès</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-soft mb-8">
                <h2 class="font-headline text-xl text-primary mb-4">Numéro de commande</h2>
                <p class="font-cta text-2xl text-accent font-bold" id="order-id">-</p>
            </div>
            
            <div class="space-y-4">
                <a href="homepage.html" class="btn-primary inline-block">
                    Retour à l'accueil
                </a>
                <a href="product_catalog.html" class="btn-secondary inline-block ml-4">
                    Continuer mes achats
                </a>
            </div>
        </div>
    </div>
    
    <script>
        // Afficher l'ID de commande
        const orderId = localStorage.getItem('lastOrderId');
        if (orderId) {
            document.getElementById('order-id').textContent = orderId;
        }
    </script>
</body>
</html>
```

## 5. Tests et Validation

### 5.1 Test du script
1. Exécuter `testDoPost()` dans l'éditeur Apps Script
2. Vérifier que les données apparaissent dans le classeur

### 5.2 Test de l'intégration
1. Passer une commande test sur le site
2. Vérifier l'enregistrement dans Google Sheets
3. Tester les cas d'erreur

## 6. Sécurité et Bonnes Pratiques

### 6.1 Protection des données
- Limiter l'accès au classeur aux personnes autorisées
- Utiliser HTTPS pour toutes les communications
- Valider toutes les données côté serveur

### 6.2 Gestion des erreurs
- Logs détaillés dans Apps Script
- Messages d'erreur utilisateur appropriés
- Mécanisme de retry en cas d'échec

### 6.3 Sauvegarde
- Exporter régulièrement le classeur
- Versionner le code Apps Script
- Documenter les modifications

## 7. Maintenance

### 7.1 Surveillance
- Vérifier régulièrement les logs Apps Script
- Monitorer les commandes dans le classeur
- Tester périodiquement l'intégration

### 7.2 Évolutions
- Ajouter des champs selon les besoins
- Optimiser les performances
- Intégrer d'autres services (email, SMS)

## Notes Importantes

- **ID du classeur** : Remplacer `VOTRE_ID_CLASSEUR_ICI` par l'ID réel
- **URL de déploiement** : Remplacer `VOTRE_URL_DEPLOYMENT_ICI` par l'URL réelle
- **Permissions** : S'assurer que le script a les bonnes autorisations
- **Quotas** : Respecter les limites de Google Apps Script (6 min d'exécution max)

## Support

En cas de problème :
1. Vérifier les logs dans Apps Script
2. Tester avec des données simples
3. Valider les permissions du classeur
4. Consulter la documentation Google Apps Script

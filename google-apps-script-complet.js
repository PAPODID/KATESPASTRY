// =============================================
// GOOGLE APPS SCRIPT - Backend KATE'S PASTRY
// =============================================
//
// OBJECTIF: Traite les commandes e-commerce et génère les reçus automatiquement
// UTILISATION: Déployé comme Web App Google Apps Script pour recevoir les commandes
// FONCTIONNEMENT: Reçoit les données POST, enregistre dans Sheets, génère PDF, envoie email
//
// FONCTIONNALITÉS PRINCIPALES:
// - Réception et validation des données de commande
// - Enregistrement dans Google Sheets pour suivi
// - Génération automatique de reçus PDF personnalisés
// - Envoi par email avec reçu en pièce jointe
// - Formatage des prix en FCFA avec espaces
//
// POINTS D'ATTENTION:
// - IDs Google Drive hardcodés (Sheets, template, dossier)
// - Gestion d'erreurs basique mais fonctionnelle
// - Timezone configuré pour l'Afrique/Lomé
// - Nettoyage automatique des fichiers temporaires
//
// TODO: Externaliser les IDs dans les propriétés du script
// TODO: Ajouter validation plus stricte des données
// NOTE: Backend critique pour le processus de commande

/**
 * Formate un nombre en prix FCFA avec espaces comme séparateurs de milliers
 * PARAMÈTRE: value = valeur numérique à formater
 * RETOUR: string formatée (ex: "1 000 FCFA")
 * UTILISATION: Affichage des prix dans les reçus
 */
function formatPrice(value) {
  var num = Math.round(Number(value) || 0);                    // Arrondit et sécurise la valeur
  var formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); // Ajoute espaces
  return formatted + ' FCFA';
}

/**
 * Fonction principale de traitement des commandes (point d'entrée Web App)
 * PARAMÈTRE: e = objet événement contenant les données POST
 * RETOUR: ContentService response JSON (success/error)
 * PROCESSUS: Validation → Sheets → Reçu PDF → Email → Nettoyage
 */
function doPost(e) {
  try {
    // ===== VALIDATION DES DONNÉES ENTRANTES =====
    // Vérifie la présence des données POST
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('Aucune donnée POST reçue');
    }

    var data = JSON.parse(e.postData.contents);

    // Valide la structure des données de panier
    if (!data || !data.cart || !Array.isArray(data.cart)) {
      throw new Error('Données de panier invalides ou absentes');
    }

    Logger.log('📦 Données reçues : ' + JSON.stringify(data));

    // ===== ÉTAPE 1: ENREGISTREMENT DANS GOOGLE SHEETS =====
    // Sauvegarde la commande pour suivi et historique
    var sheetId = '10gpfFA57rqZWizCaG4JP6yxqqcyvamEux0HwxVuGl1s';  // ID du classeur
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Commandes');
    var rowData = [
      data.id || 'ID manquant',                                // ID unique de commande
      new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Lome' }), // Date/heure locale
      data.userData && data.userData.lastName ? data.userData.lastName : '',
      data.userData && data.userData.firstName ? data.userData.firstName : '',
      data.userData && data.userData.email ? data.userData.email : '',
      data.userData && data.userData.phone ? data.userData.phone : '',
      data.total || 0,                                         // Montant total
      JSON.stringify(data.cart)                                // Détails du panier (JSON)
    ];
    sheet.appendRow(rowData);
    Logger.log('📊 Ligne ajoutée au Sheet');

    // ===== ÉTAPE 2: GÉNÉRATION DU REÇU PERSONNALISÉ =====
    // Crée un document PDF à partir du template
    var templateDocId = '1AtG4DZ6T67F3GcURQUvQGI37icdeR-vplKZlHxHuoZk'; // Template reçu
    var folderId = '1gNmXAusksKbAs9LKoNFbbp-i4lgzwWKq';              // Dossier de stockage
    var templateDoc = DriveApp.getFileById(templateDocId);
    var newDoc = templateDoc.makeCopy('Reçu - ' + (data.id || 'Sans ID'), DriveApp.getFolderById(folderId));
    var docBody = DocumentApp.openById(newDoc.getId()).getBody();

    // Remplacement des placeholders dans le template
    docBody.replaceText('{ID_COMMANDE}', data.id || 'Sans ID');
    docBody.replaceText('{DATE}', new Date().toLocaleDateString('fr-FR'));
    docBody.replaceText('{NOM_CLIENT}', (data.userData && data.userData.firstName ? data.userData.firstName : '') + ' ' + (data.userData && data.userData.lastName ? data.userData.lastName : ''));
    docBody.replaceText('{EMAIL}', data.userData && data.userData.email ? data.userData.email : '');
    docBody.replaceText('{TELEPHONE}', data.userData && data.userData.phone ? data.userData.phone : 'Non spécifié');

    // ===== FORMATAGE DES ARTICLES DU PANIER =====
    // Génère la liste détaillée des articles pour le reçu
    var articlesText = data.cart.length > 0
      ? data.cart.map(function(item) {
          var name = item.name || 'Article inconnu';
          var quantity = item.quantity || 0;
          var price = item.price || 0;
          var totalItem = price * quantity;                     // Calcul sous-total
          return name + ' x' + quantity + ' - ' + formatPrice(totalItem);
        }).join('\n')                                          // Séparateur de ligne
      : 'Aucun article';
    docBody.replaceText('{ARTICLES}', articlesText);
    Logger.log('📝 Articles formatés : ' + articlesText);

    // Remplacement du total général
    docBody.replaceText('{TOTAL}', formatPrice(data.total || 0));
    Logger.log('💰 Total formaté : ' + formatPrice(data.total || 0));

    // Sauvegarde du document modifié
    DocumentApp.openById(newDoc.getId()).saveAndClose();
    Logger.log('💾 Document sauvegardé');

    // ===== ÉTAPE 3: EXPORT EN PDF =====
    // Convertit le document en PDF pour envoi par email
    var pdfBlob = newDoc.getAs('application/pdf');
    var pdfFile = DriveApp.getFolderById(folderId).createFile(pdfBlob).setName('Reçu - ' + (data.id || 'Sans ID') + '.pdf');
    Logger.log('📄 PDF créé');

    // ===== ÉTAPE 4: ENVOI PAR EMAIL =====
    // Envoie le reçu PDF au client par email
    if (!data.userData || !data.userData.email) {
      throw new Error('Adresse email manquante');
    }
    var emailSubject = 'Votre reçu pour la commande ' + (data.id || 'Sans ID') + ' chez Kate\'s Pastry';
    var emailBody = 'Bonjour ' + (data.userData && data.userData.firstName ? data.userData.firstName : 'Client') + ',\n\n' +
                    'Merci pour votre commande à Lomé ! Veuillez trouver votre reçu en pièce jointe.\n\n' +
                    'Cordialement,\nKate\'s Pastry';
    Logger.log('📧 Tentative d\'envoi email à : ' + data.userData.email);
    GmailApp.sendEmail(data.userData.email, emailSubject, emailBody, {
      attachments: [pdfFile.getAs('application/pdf')]          // Reçu PDF en pièce jointe
      // Option 'from' supprimée pour éviter les problèmes de permission
    });
    Logger.log('✅ Email envoyé à : ' + data.userData.email);

    // ===== NETTOYAGE =====
    // Supprime le document temporaire (garde seulement le PDF)
    DriveApp.getFileById(newDoc.getId()).setTrashed(true);

    // ===== RÉPONSE DE SUCCÈS =====
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'success', 
      orderId: data.id,
      message: 'Commande traitée avec succès'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // ===== GESTION D'ERREURS =====
    // Log l'erreur et retourne une réponse d'erreur structurée
    Logger.log('❌ Erreur : ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({ 
      status: 'error', 
      message: error.message,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Fonction de test pour simuler une commande (développement/debug)
 * UTILISATION: Exécuter manuellement dans l'éditeur Google Apps Script
 * EFFET: Teste le processus complet avec des données fictives
 */
function testDoPost() {
  var mockData = {
    postData: {
      contents: JSON.stringify({
        id: 'TEST-2025-08-16-1234',                           // ID de test
        timestamp: new Date().toISOString(),
        cart: [
          { id: '1', name: 'Croissant', price: 1000, quantity: 2 }
        ],
        userData: {
          firstName: 'Didier Esso-Déwa',
          lastName: 'PAPOTOMA',
          email: 'papotomadidieressodewa@gmail.com',          // Email de test
          phone: '+228 91902449',
          city: 'Lomé-TOGO'
        },
        orderData: {},
        total: 2000                                           // Total en FCFA
      })
    }
  };
  Logger.log('🧪 Exécution du test avec données fictives');
  doPost(mockData);
}

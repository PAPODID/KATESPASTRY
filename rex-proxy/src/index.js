// =============================================
// REX-PROXY - Proxy Cloudflare Workers
// =============================================
//
// OBJECTIF: Proxy CORS pour relayer les commandes vers Google Apps Script
// UTILISATION: Déployé sur Cloudflare Workers pour gérer les requêtes POST
// FONCTIONNEMENT: Intercepte /submit-order et relaie vers Google Apps Script
//
// FONCTIONNALITÉS PRINCIPALES:
// - Gestion des headers CORS pour les requêtes cross-origin
// - Relais des données de commande vers Google Apps Script
// - Gestion des erreurs réseau et HTTP
// - Support des requêtes OPTIONS (preflight CORS)
//
// POINTS D'ATTENTION:
// - URL Google Apps Script hardcodée (à sécuriser)
// - Gestion basique des erreurs (peut être améliorée)
// - CORS configuré pour accepter toutes les origines (*)
//
// TODO: Ajouter authentification et validation des données
// TODO: Implémenter un système de retry pour les échecs réseau
// NOTE: Point critique pour la soumission des commandes

export default {
  /**
   * Point d'entrée principal du Worker Cloudflare
   * PARAMÈTRES: request = requête HTTP entrante
   *            env = variables d'environnement
   *            ctx = contexte d'exécution
   * RETOUR: Response HTTP
   */
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};

/**
 * Gestionnaire principal des requêtes HTTP
 * PARAMÈTRE: request = requête HTTP à traiter
 * RETOUR: Response avec gestion CORS et relais vers Google Apps Script
 * LOGIQUE: Traite OPTIONS (preflight) et POST (soumission commande)
 */
async function handleRequest(request) {
  // ===== CONFIGURATION CORS =====
  // Headers CORS pour toutes les réponses (cross-origin)
  const corsHeaders = {
    'Access-Control-Allow-Origin': self.ALLOWED_ORIGIN || '*',  // Accepte toutes origines
    'Access-Control-Allow-Methods': 'POST, OPTIONS',            // Méthodes autorisées
    'Access-Control-Allow-Headers': 'Content-Type',             // Headers autorisés
    'Access-Control-Max-Age': '86400'                           // Cache preflight 24h
  };

  // ===== GESTION PREFLIGHT CORS =====
  // Répond aux requêtes OPTIONS pour autoriser les requêtes cross-origin
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,                                              // No Content
      headers: corsHeaders
    });
  }

  // ===== TRAITEMENT DES COMMANDES =====
  // Gère les requêtes POST vers /submit-order
  if (request.method === 'POST' && new URL(request.url).pathname === '/submit-order') {
    // URL du Google Apps Script déployé (Web App)
    // ATTENTION: URL sensible, devrait être en variable d'environnement
    const appsScriptUrl = 'https://script.google.com/macros/s/AKfycbxqtFsPrZHfDokyAJDVLOFWgiVpNCRt-cH0a5z1EQCo9xwdoNsKRGGo1q2iY_jqNnWN/exec';

    try {
      // ===== EXTRACTION DES DONNÉES =====
      // Récupère le corps de la requête (données de commande JSON)
      const body = await request.text();
      
      // ===== RELAIS VERS GOOGLE APPS SCRIPT =====
      // Transmet la requête vers le backend Google Apps Script
      const response = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8'  // Format JSON obligatoire
        },
        body: body                                          // Données de commande
      });

      // ===== TRAITEMENT DE LA RÉPONSE =====
      // Récupère la réponse du Google Apps Script
      const text = await response.text();
      
      // Retourne la réponse avec les headers CORS
      return new Response(text, {
        status: response.status,                            // Préserve le status HTTP
        headers: {
          ...corsHeaders,                                   // Ajoute les headers CORS
          'Content-Type': 'application/json;charset=UTF-8'  // Format de réponse JSON
        }
      });

    } catch (error) {
      // ===== GESTION D'ERREURS =====
      // Capture les erreurs réseau ou de traitement
      console.error('Erreur proxy:', error);
      return new Response(JSON.stringify({
        error: 'Erreur proxy: ' + error.message,
        timestamp: new Date().toISOString(),               // Timestamp pour debug
        details: 'Échec de communication avec Google Apps Script'
      }), {
        status: 500,                                        // Internal Server Error
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json;charset=UTF-8'
        }
      });
    }
  }

  // ===== MÉTHODES NON SUPPORTÉES =====
  // Retourne une erreur pour les méthodes/chemins non gérés
  return new Response(JSON.stringify({
    error: 'Méthode ou chemin non supporté',
    method: request.method,
    path: new URL(request.url).pathname,
    supportedEndpoints: ['/submit-order']
  }), {
    status: 405,                                            // Method Not Allowed
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}
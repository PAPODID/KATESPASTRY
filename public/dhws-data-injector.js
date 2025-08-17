
// =============================================
// DHWS-DATA-INJECTOR.JS - Injection d'Attributs DOM
// =============================================
//
// OBJECTIF: Ajoute automatiquement des attributs de métadonnées aux éléments DOM
// UTILISATION: Chargé automatiquement pour taguer les éléments avec des identifiants uniques
// FONCTIONNEMENT: IIFE (Immediately Invoked Function Expression) qui s'exécute au chargement
//
// FONCTIONNALITÉS PRINCIPALES:
// - Attribution d'IDs uniques basés sur la position dans l'arbre DOM
// - Extraction des attributs et contenu textuel des éléments
// - Observation des mutations DOM pour les éléments dynamiques
// - Filtrage des éléments à exclure (scripts, styles, SVG, etc.)
//
// POINTS D'ATTENTION:
// - Utilise un MutationObserver pour les éléments ajoutés dynamiquement
// - Sanitise les valeurs d'attributs pour éviter les failles XSS
// - Exclut automatiquement les éléments non-pertinents (TAG_SHOULD_EXCLUDE)
//
// TODO: Optimiser les performances pour les grandes pages
// NOTE: Ce script peut impacter les performances sur des DOM complexes

(function() {
  // ===== CONFIGURATION =====
  // Paramètres de comportement du système d'injection
  const CONFIG = {
    attributePrefix: 'data-component',           // Préfixe pour les attributs générés
    includeContentAttribute: true,               // Inclure le contenu des éléments
    maxContentLength: 1000,                      // Limite de caractères pour le contenu
    includeLegacyAttributes: true,               // Inclure les attributs de compatibilité
    includeElements: [],                         // Liste blanche d'éléments (vide = tous)
    excludeElements: [],                         // Liste noire d'éléments supplémentaires
  };

  // ===== ÉLÉMENTS EXCLUS =====
  // Liste des balises HTML à ignorer lors de l'injection d'attributs
  // RAISON: Éléments non-visuels, techniques ou problématiques pour le tagging
  const TAG_SHOULD_EXCLUDE = [
  // Éléments de métadonnées et techniques
  "base",
  "object",
  "link",
  "meta",
  "noscript",
  "script",
  "style",
  "title",
  // Éléments SVG (nombreux et généralement non-pertinents pour le tagging)
  "animate",
  "animateMotion",
  "animateTransform",
  "circle",
  "clipPath",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "set",
  "stop",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
  "view",
  // Autres éléments spéciaux
  "body",                                       // Élément racine
  "param",                                      // Paramètres d'objets
]

  // ===== VARIABLES GLOBALES =====
  // Map pour suivre les indices par classe pour des IDs uniques
  const classIndexMap = new Map();

  // ===== FONCTIONS UTILITAIRES =====
  
  /**
   * Sanitise les valeurs d'attributs pour prévenir les attaques XSS
   * PARAMÈTRE: value = valeur à sanitiser
   * RETOUR: string sécurisée avec caractères spéciaux échappés
   */
  function sanitizeAttributeValue(value) {
    return String(value)
      .replace(/&/g, '&amp;')                   // Échapper les esperluettes
      .replace(/"/g, '&quot;')                 // Échapper les guillemets doubles
      .replace(/'/g, '&apos;')                  // Échapper les apostrophes
      .replace(/</g, '&lt;')                    // Échapper les chevrons ouvrants
      .replace(/>/g, '&gt;');                   // Échapper les chevrons fermants
  }

  /**
   * Crée un ID de composant unique basé sur la position dans l'arbre DOM
   * PARAMÈTRE: el = élément DOM pour lequel générer l'ID
   * RETOUR: string représentant le chemin hiérarchique (ex: "0-2-1")
   * ALGORITHME: Remonte l'arbre DOM en calculant l'index de chaque élément
   */
  function createComponentId(el) {

    const path = [];                             // Chemin hiérarchique
    let current = el;

    // Remonte l'arbre DOM jusqu'au body
    while (current && current.parentElement) {
      const siblings = Array.from(current.parentElement.children)
        .filter(child => child.tagName);         // Filtre les nœuds texte
      const index = siblings.indexOf(current);   // Position parmi les frères
      path.unshift(index);                       // Ajoute au début du chemin
      current = current.parentElement;

      if (current.tagName === 'BODY') break;     // Arrêt au body
    }

    const line = path.join('-')                  // Concatène avec des tirets

    return sanitizeAttributeValue(line);         // Sanitise le résultat
  }

  /**
   * Extrait le contenu textuel direct d'un élément (sans les enfants)
   * PARAMÈTRE: element = élément DOM à analyser
   * RETOUR: string contenant le texte nettoyé
   */
  function extractTextContent(element) {
    let text = '';
    // Parcourt uniquement les nœuds texte directs (pas les enfants)
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent.trim() + ' ';   // Ajoute le texte nettoyé
      }
    }
    return text.trim();                          // Supprime les espaces en début/fin
  }

  /**
   * Extrait les attributs pertinents d'un élément pour les métadonnées
   * PARAMÈTRE: element = élément DOM à analyser
   * RETOUR: objet contenant les attributs et le contenu textuel
   */
  function extractAttributes(element) {
    const attributes = {};
    // Liste des attributs HTML standard à extraire
    const defaultAttrs = [
      'class', 'id', 'src', 'alt', 'href', 'type', 'name', 'value'
    ];

    // Extrait les attributs standard s'ils existent
    for (const attr of defaultAttrs) {
      if (element.hasAttribute(attr)) {
        if (attr === 'class') {
          attributes['className'] = element.getAttribute(attr); // Renomme 'class' en 'className'
        } else {
          attributes[attr] = element.getAttribute(attr);
        }
      }
    }

    // Ajoute le contenu textuel s'il existe
    const textContent = extractTextContent(element);
    if (textContent) {
      attributes['textContent'] = textContent;
    }

    return attributes;
  }

  /**
   * Détermine si un élément doit être tagué avec des métadonnées
   * PARAMÈTRE: element = élément DOM à évaluer
   * RETOUR: boolean (true si l'élément doit être tagué)
   * LOGIQUE: Vérifie les listes d'inclusion/exclusion et les types d'éléments
   */
  function shouldTagElement(element) {
    // Ignore les nœuds non-éléments (texte, commentaires, etc.)
    if (element.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }

    const tagName = element.tagName.toLowerCase();

    // Si une liste blanche est définie, seuls ces éléments sont inclus
    if (CONFIG.includeElements.length > 0) {
      return CONFIG.includeElements.includes(tagName);
    }

    // Exclut les éléments de la liste noire
    if (CONFIG.excludeElements.includes(tagName) || TAG_SHOULD_EXCLUDE.includes(tagName)) {
      return false;
    }

    return true;                                 // Par défaut, inclut l'élément
  }

  /**
   * Applique les attributs de métadonnées à un élément DOM
   * PARAMÈTRE: element = élément à taguer
   * EFFET DE BORD: Modifie les attributs de l'élément dans le DOM
   */
  function tagElement(element) {
    // Évite le double-tagging
    if (element.hasAttribute(`${CONFIG.attributePrefix}-id`)) {
      return;
    }

    // Récupère le nom de la balise
    const elementName = element.tagName.toLowerCase();

    // Génère un ID unique basé sur la position
    const componentId = createComponentId(element);

    // Applique l'attribut ID principal
    element.setAttribute(`${CONFIG.attributePrefix}-id`, componentId);

    // Ajoute les attributs de compatibilité si activés
    if (CONFIG.includeLegacyAttributes) {
      element.setAttribute(`${CONFIG.attributePrefix}-path`, window.location.pathname);
      element.setAttribute(`${CONFIG.attributePrefix}-name`, elementName);
      element.setAttribute(`${CONFIG.attributePrefix}-file`, window.location.pathname.split('/').pop());
    }

    // Ajoute l'attribut de contenu si activé
    if (CONFIG.includeContentAttribute) {
      const attributes = extractAttributes(element);
      const content = {
        elementName,
        ...attributes                            // Fusionne tous les attributs extraits
      };

      let encodedContent = encodeURIComponent(JSON.stringify(content));

      // Tronque si le contenu dépasse la limite
      if (encodedContent.length > CONFIG.maxContentLength) {
        encodedContent = encodedContent.substring(0, CONFIG.maxContentLength) + '...';
      }

      element.setAttribute(`${CONFIG.attributePrefix}-content`, encodedContent);
    }
  }

  // ===== FONCTIONS PRINCIPALES =====
  
  /**
   * Traite tous les éléments existants dans le document
   * EFFET DE BORD: Applique le tagging à tous les éléments éligibles
   */
  function processAllElements() {
    const elements = document.querySelectorAll('*');  // Sélectionne tous les éléments
    let taggedCount = 0;

    elements.forEach((element, index) => {
      if (shouldTagElement(element)) {
        tagElement(element, index);
        taggedCount++;                           // Compteur pour le debug
      }
    });

    console.log(`📋 DHWS Data Injector: ${taggedCount} éléments tagués`);

  }

  /**
   * Initialise le système d'injection d'attributs
   * FONCTIONNEMENT: Configure l'observation des mutations DOM et traite les éléments existants
   */
  function initialize() {
    // Attend que le DOM soit complètement chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', processAllElements);
    } else {
      processAllElements();                      // Traite immédiatement si déjà chargé
    }

    // ===== OBSERVATION DES MUTATIONS DOM =====
    // Traite automatiquement les éléments ajoutés dynamiquement
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {      // Changements dans la liste des enfants
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Tague l'élément ajouté
                if (shouldTagElement(node)) {
                  tagElement(node);
                }

                // Tague récursivement tous les enfants
                const childElements = node.querySelectorAll('*');
                for (const child of childElements) {
                  if (shouldTagElement(child)) {
                    tagElement(child);
                  }
                }
              }
            }
          }
        }
    });

    // Configure l'observateur pour surveiller tout le body
    observer.observe(document.body, {
      childList: true,                           // Surveille les ajouts/suppressions
      subtree: true                              // Surveille tous les descendants
    });
    
    console.log('🔍 DHWS Data Injector: MutationObserver activé');
  }

  // ===== DÉMARRAGE AUTOMATIQUE =====
  // Lance l'initialisation dès le chargement du script
  initialize();
  
  console.log('🚀 DHWS Data Injector: Système d\'injection initialisé');
})();

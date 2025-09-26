/**
 * BetaCreator Library Loader
 * This module loads all the BetaCreator files in the correct dependency order
 */

// Load the Google Closure Library shim first
import './goog-shim.js';

// Define the loading order based on dependencies
const MODULE_LOAD_ORDER = [
  // Utilities first (no dependencies)
  'util/i18n.js',
  'util/array.js',
  'util/ClassSet.js',
  'util/color.js',
  'util/math.js',
  'util/object.js',
  'util/util.js',
  'util/domBuilder.js',

  // Models (depends on utilities and properties)
  'models/property.js',
  'models/Action.js', 
  'models/Item.js',
  'models/Canvas.js',
  'models/Line.js',
  'models/Text.js',
  'models/Stamp.js',
  'models/stamps/Anchor.js',
  'models/stamps/Belay.js',
  'models/stamps/Piton.js',
  'models/stamps/Rappel.js',

  // Views (depends on models)
  'views/Item.js',
  'views/Canvas.js',
  'views/Line.js',
  'views/Text.js',
  'views/Stamp.js',
  'views/stamps/Anchor.js',
  'views/stamps/Belay.js',
  'views/stamps/Piton.js',
  'views/stamps/Rappel.js',

  // Render utilities
  'render/DashedLine.js',

  // Modes (depends on models and views)
  'modes/Mode.js',
  'modes/Select.js',
  'modes/Line.js',
  'modes/LineEdit.js',
  'modes/Stamp.js',
  'modes/Text.js',

  // GUI components (depends on modes and utilities)
  'gui/input/input.js',
  'gui/input/buttonbar.js',
  'gui/input/colorwell.js',
  'gui/input/spinner.js',
  'gui/ColorPicker.js',
  'gui/TextArea.js',
  'gui/OptionBar.js',
  'gui/GUI.js',

  // Controllers (depends on everything else)
  'controllers/Canvas.js',

  // Main client (depends on controllers and GUI)
  'Client.js'
];

/**
 * Load a JavaScript file dynamically
 * @param {string} path - Path to the JavaScript file
 * @returns {Promise} Promise that resolves when the file is loaded
 */
function loadScript(path) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = false; // Maintain order
    
    script.onload = resolve;
    script.onerror = reject;
    
    // Convert the module path to the actual file URL
    // In a bundled environment, we'll need to inline these files
    // For now, we'll create a way to access them
    script.src = new URL(`./betacreator/${path}`, import.meta.url).href;
    
    document.head.appendChild(script);
  });
}

/**
 * Load all BetaCreator modules in the correct order
 * @returns {Promise} Promise that resolves when all modules are loaded
 */
export async function loadBetaCreatorLibrary() {
  // If already loaded, return immediately
  if (window.bc && window.bc.Client) {
    return Promise.resolve();
  }

  try {
    // Load all modules in order
    for (const modulePath of MODULE_LOAD_ORDER) {
      await loadScript(modulePath);
    }

    // Verify that the main client is available
    if (!window.bc || !window.bc.Client) {
      throw new Error('BetaCreator library failed to load properly');
    }

    // Make sure the global BetaCreator function is available
    if (!window.BetaCreator) {
      throw new Error('BetaCreator global function not found');
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Failed to load BetaCreator library:', error);
    throw error;
  }
}

/**
 * Get the BetaCreator constructor function
 * @returns {Function} The BetaCreator constructor
 */
export function getBetaCreator() {
  if (!window.BetaCreator) {
    throw new Error('BetaCreator library not loaded. Call loadBetaCreatorLibrary() first.');
  }
  return window.BetaCreator;
}

// Export the namespaces for TypeScript definitions
export const bc = window.bc;
/**
 * BetaCreator Library Bundle
 * This file contains all the BetaCreator library code bundled together
 */

// Load the Google Closure Library shim
import './goog-shim.js';

// All BetaCreator files will be concatenated here during build
// For now, we'll create a loader that dynamically imports the files

let betaCreatorLoaded = false;

/**
 * Load the BetaCreator library by dynamically loading all required files
 */
export async function loadBetaCreatorLibrary() {
  if (betaCreatorLoaded && window.bc && window.bc.Client) {
    return Promise.resolve();
  }

  // In development, we need to load the files
  // In production, they should be bundled
  
  try {
    // Import all the BetaCreator files in the right order
    const modules = await Promise.all([
      import('./betacreator/util/i18n.js'),
      import('./betacreator/util/array.js'),
      import('./betacreator/util/ClassSet.js'),
      import('./betacreator/util/color.js'),
      import('./betacreator/util/math.js'), 
      import('./betacreator/util/object.js'),
      import('./betacreator/util/util.js'),
      import('./betacreator/util/domBuilder.js'),
      import('./betacreator/models/property.js'),
      import('./betacreator/models/Action.js'),
      import('./betacreator/models/Item.js'),
      import('./betacreator/models/Canvas.js'),
      import('./betacreator/models/Line.js'),
      import('./betacreator/models/Text.js'),
      import('./betacreator/models/Stamp.js'),
      import('./betacreator/models/stamps/Anchor.js'),
      import('./betacreator/models/stamps/Belay.js'),
      import('./betacreator/models/stamps/Piton.js'),
      import('./betacreator/models/stamps/Rappel.js'),
      import('./betacreator/views/Item.js'),
      import('./betacreator/views/Canvas.js'),
      import('./betacreator/views/Line.js'),
      import('./betacreator/views/Text.js'),
      import('./betacreator/views/Stamp.js'),
      import('./betacreator/views/stamps/Anchor.js'),
      import('./betacreator/views/stamps/Belay.js'),
      import('./betacreator/views/stamps/Piton.js'),
      import('./betacreator/views/stamps/Rappel.js'),
      import('./betacreator/render/DashedLine.js'),
      import('./betacreator/modes/Mode.js'),
      import('./betacreator/modes/Select.js'),
      import('./betacreator/modes/Line.js'),
      import('./betacreator/modes/LineEdit.js'),
      import('./betacreator/modes/Stamp.js'),
      import('./betacreator/modes/Text.js'),
      import('./betacreator/gui/input/input.js'),
      import('./betacreator/gui/input/buttonbar.js'),
      import('./betacreator/gui/input/colorwell.js'),
      import('./betacreator/gui/input/spinner.js'),
      import('./betacreator/gui/ColorPicker.js'),
      import('./betacreator/gui/TextArea.js'),
      import('./betacreator/gui/OptionBar.js'),
      import('./betacreator/gui/GUI.js'),
      import('./betacreator/controllers/Canvas.js'),
      import('./betacreator/Client.js')
    ]);

    betaCreatorLoaded = true;
    
    if (!window.BetaCreator) {
      throw new Error('BetaCreator global function not found after loading modules');
    }

    return Promise.resolve();
  } catch (error) {
    console.error('Failed to load BetaCreator library:', error);
    throw error;
  }
}

/**
 * Get the BetaCreator constructor function
 */
export function getBetaCreator() {
  if (!window.BetaCreator) {
    throw new Error('BetaCreator library not loaded. Call loadBetaCreatorLibrary() first.');
  }
  return window.BetaCreator;
}
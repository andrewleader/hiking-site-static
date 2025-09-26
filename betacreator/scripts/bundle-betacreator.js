const fs = require('fs');
const path = require('path');

// Files to concatenate in dependency order
const FILES_TO_CONCATENATE = [
  // Google Closure Library shim
  'src/lib/goog-shim.js',
  
  // Utilities
  'src/lib/betacreator/util/i18n.js',
  'src/lib/betacreator/util/array.js',
  'src/lib/betacreator/util/ClassSet.js',
  'src/lib/betacreator/util/color.js',
  'src/lib/betacreator/util/math.js',
  'src/lib/betacreator/util/object.js',
  'src/lib/betacreator/util/util.js',
  'src/lib/betacreator/util/domBuilder.js',

  // Models
  'src/lib/betacreator/models/property.js',
  'src/lib/betacreator/models/Action.js',
  'src/lib/betacreator/models/Item.js',
  'src/lib/betacreator/models/Canvas.js',
  'src/lib/betacreator/models/Line.js',
  'src/lib/betacreator/models/Text.js',
  'src/lib/betacreator/models/Stamp.js',
  'src/lib/betacreator/models/stamps/Anchor.js',
  'src/lib/betacreator/models/stamps/Belay.js',
  'src/lib/betacreator/models/stamps/Piton.js',
  'src/lib/betacreator/models/stamps/Rappel.js',

  // Views
  'src/lib/betacreator/views/Item.js',
  'src/lib/betacreator/views/Canvas.js',
  'src/lib/betacreator/views/Line.js',
  'src/lib/betacreator/views/Text.js',
  'src/lib/betacreator/views/Stamp.js',
  'src/lib/betacreator/views/stamps/Anchor.js',
  'src/lib/betacreator/views/stamps/Belay.js',
  'src/lib/betacreator/views/stamps/Piton.js',
  'src/lib/betacreator/views/stamps/Rappel.js',

  // Render
  'src/lib/betacreator/render/DashedLine.js',

  // Modes
  'src/lib/betacreator/modes/Mode.js',
  'src/lib/betacreator/modes/Select.js',
  'src/lib/betacreator/modes/Line.js',
  'src/lib/betacreator/modes/LineEdit.js',
  'src/lib/betacreator/modes/Stamp.js',
  'src/lib/betacreator/modes/Text.js',

  // GUI
  'src/lib/betacreator/gui/input/input.js',
  'src/lib/betacreator/gui/input/buttonbar.js',
  'src/lib/betacreator/gui/input/colorwell.js',
  'src/lib/betacreator/gui/input/spinner.js',
  'src/lib/betacreator/gui/ColorPicker.js',
  'src/lib/betacreator/gui/TextArea.js',
  'src/lib/betacreator/gui/OptionBar.js',
  'src/lib/betacreator/gui/GUI.js',

  // Controllers
  'src/lib/betacreator/controllers/Canvas.js',

  // Main client
  'src/lib/betacreator/Client.js'
];

function concatenateFiles(files, outputPath) {
  let concatenated = '';
  
  console.log('Concatenating BetaCreator library files...');
  
  for (const file of files) {
    const filePath = path.join(process.cwd(), file);
    
    try {
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        concatenated += `\n\n/* === ${file} === */\n`;
        concatenated += content;
        console.log(`✓ Added: ${file}`);
      } else {
        console.warn(`⚠ File not found: ${file}`);
      }
    } catch (error) {
      console.error(`✗ Error reading ${file}:`, error.message);
    }
  }

  // Write the concatenated file
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, concatenated, 'utf8');
  console.log(`\n✓ BetaCreator library bundled to: ${outputPath}`);
  console.log(`Bundle size: ${(concatenated.length / 1024).toFixed(2)} KB`);
}

// Run the concatenation
const outputPath = 'src/lib/betacreator-bundled.js';
concatenateFiles(FILES_TO_CONCATENATE, outputPath);
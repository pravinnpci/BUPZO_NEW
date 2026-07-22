const fs = require('fs');
const file = 'bupzo-frontend/app/globals.css';
let content = fs.readFileSync(file, 'utf8');

// Prepend Google Fonts import if not already there
if (!content.includes('fonts.googleapis.com')) {
  content = `@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');\n` + content;
  
  // Set global body font
  content += `\nbody { font-family: 'Poppins', sans-serif; }`;
  
  fs.writeFileSync(file, content);
  console.log('Added Sprylo fonts to globals.css');
} else {
  console.log('Fonts already exist');
}

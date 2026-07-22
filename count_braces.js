const fs = require('fs');

const code = fs.readFileSync('bupzo-frontend/components/SellerDashboard.tsx', 'utf8');
let openBraces = 0;
let openParens = 0;

for (let i = 0; i < code.length; i++) {
  if (code[i] === '{') openBraces++;
  if (code[i] === '}') openBraces--;
  if (code[i] === '(') openParens++;
  if (code[i] === ')') openParens--;
}

console.log('Open Braces:', openBraces);
console.log('Open Parens:', openParens);

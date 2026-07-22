const fs = require('fs');

const code = fs.readFileSync('bupzo-frontend/components/SellerDashboard.tsx', 'utf8');

let depth = 0;
for (let i = 0; i < code.length; i++) {
  if (code[i] === '{') depth++;
  if (code[i] === '}') {
    depth--;
    if (depth < 0) {
      console.log('Unmatched } at index', i, 'line', code.substring(0, i).split('\n').length);
      process.exit(1);
    }
  }
}
console.log('Final depth:', depth);

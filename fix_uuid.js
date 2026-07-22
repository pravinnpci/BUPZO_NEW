const fs = require('fs');

let content = fs.readFileSync('bupzo-backend/app/main.py', 'utf8');
content = content.replace(/uuid\.UUID/g, 'UUID');
content = content.replace(/uuid\.uuid4/g, 'uuid4');

fs.writeFileSync('bupzo-backend/app/main.py', content);
console.log("Fixed uuid usage in main.py");

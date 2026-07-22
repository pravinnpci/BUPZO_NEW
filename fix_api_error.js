const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/lib/api.ts', 'utf8');

code = code.replace(
    /const errorMessage = json\.detail \|\| json\.message \|\| `HTTP \$\{response\.status\}`;/g,
    `const errorMessage = (typeof json.detail === 'object' ? JSON.stringify(json.detail) : json.detail) || json.message || \`HTTP \${response.status}\`;`
);

fs.writeFileSync('bupzo-frontend/lib/api.ts', code);
console.log("Updated parseJsonResponse to show detailed errors");

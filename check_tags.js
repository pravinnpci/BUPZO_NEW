const fs = require('fs');
const content = fs.readFileSync('bupzo-frontend/components/SellerDashboard.tsx', 'utf8');

const openTags = [];
// This simple regex won't work perfectly for JSX because of < > in JS expressions, but it's a start.
// A better way is to use a real parser. Let's install typescript in the script and parse it.


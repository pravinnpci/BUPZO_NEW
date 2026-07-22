const fs = require('fs');
const file = 'bupzo-admin/src/app/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "              setEditProductImage={setEditProductImage}",
  "              setEditProductImage={setEditProductImage}\n              setEditProductCategory={setEditProductCategory}\n              setEditProductSeller={setEditProductSeller}\n              setEditProductWeight={setEditProductWeight}"
);

fs.writeFileSync(file, content);

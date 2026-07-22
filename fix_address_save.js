const fs = require('fs');
let code = fs.readFileSync('bupzo-frontend/components/CustomerSettings.tsx', 'utf8');

const replaceCode = `      await createAddress(user.id, {
        ...newAddr,
        latitude: newAddr.latitude ? parseFloat(newAddr.latitude) : undefined,
        longitude: newAddr.longitude ? parseFloat(newAddr.longitude) : undefined
      });
      
      if (!user.address || !user.pincode) {
          try {
              const updatedUser = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004'}/api/users/\${user.id}\`, {
                  method: 'PUT',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({
                      address: newAddr.street + ', ' + newAddr.city + ', ' + newAddr.state,
                      pincode: newAddr.zip_code
                  })
              }).then(r => r.json());
              if (updatedUser && updatedUser.id) {
                  setUser(updatedUser);
              }
          } catch(e) {}
      }`;

code = code.replace(
    `      await createAddress(user.id, {
        ...newAddr,
        latitude: newAddr.latitude ? parseFloat(newAddr.latitude) : undefined,
        longitude: newAddr.longitude ? parseFloat(newAddr.longitude) : undefined
      });`,
    replaceCode
);

fs.writeFileSync('bupzo-frontend/components/CustomerSettings.tsx', code);
console.log("Updated CustomerSettings.tsx to update user address");

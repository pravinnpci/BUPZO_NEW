const fs = require('fs');

let content = fs.readFileSync('bupzo-frontend/lib/api.ts', 'utf8');

const apiFunc = `
export async function topUpWallet(userId: string, amount: number): Promise<any> {
  const response = await authFetch('/api/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId, amount }),
  });
  return parseJsonResponse(response);
}
`;

if (!content.includes('export async function topUpWallet')) {
    content += '\n' + apiFunc;
    fs.writeFileSync('bupzo-frontend/lib/api.ts', content);
    console.log("Added topUpWallet to api.ts");
} else {
    console.log("topUpWallet already exists");
}

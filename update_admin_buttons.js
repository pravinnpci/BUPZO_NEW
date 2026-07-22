const fs = require('fs');

let code = fs.readFileSync('bupzo-admin/src/components/AdminProducts.tsx', 'utf8');

const oldButtons = `
                            <button
                              onClick={() => onApproveProduct(p.id, !p.is_approved)}
                              className={\`\${p.is_approved ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-500 hover:bg-green-600'} text-white px-3 py-1.5 rounded text-[10px] font-bold\`}
                            >
                              {p.is_approved ? 'Reject' : 'Approve'}
                            </button>
`;

const newButtons = `
                            {!p.is_approved && (
                              <button
                                onClick={() => onApproveProduct(p.id, true)}
                                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-[10px] font-bold"
                              >
                                Approve
                              </button>
                            )}
                            {p.is_approved && (
                              <button
                                onClick={() => onApproveProduct(p.id, false)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            )}
                            {!p.is_approved && (
                              <button
                                onClick={() => onApproveProduct(p.id, false)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-[10px] font-bold"
                              >
                                Reject
                              </button>
                            )}
`;

code = code.replace(oldButtons.trim(), newButtons.trim());
fs.writeFileSync('bupzo-admin/src/components/AdminProducts.tsx', code);
console.log("Updated AdminProducts.tsx with separate Approve/Reject buttons");

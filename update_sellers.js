const fs = require('fs');
const file = 'bupzo-admin/src/components/AdminSellers.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add messaging states
content = content.replace(
  "  const [viewKycSeller, setViewKycSeller] = useState<Seller | null>(null);",
  "  const [viewKycSeller, setViewKycSeller] = useState<Seller | null>(null);\n  const [messageSeller, setMessageSeller] = useState<Seller | null>(null);\n  const [msgSubject, setMsgSubject] = useState('');\n  const [msgContent, setMsgContent] = useState('');\n  const [isSending, setIsSending] = useState(false);"
);

// 2. Add Missing KYC Document badge and Message Button
content = content.replace(
  "                  <td className=\"py-3 text-right\">\n                    <div className=\"flex justify-end gap-1.5\">\n                      <button \n                        onClick={() => {",
  `                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      {(!s.kyc_details || !s.kyc_details.aadharUrl || !s.kyc_details.gstin) && (
                        <span className="text-red-500 font-bold text-[10px] flex items-center px-2 mr-2 border border-red-200 bg-red-50 rounded" title="Missing KYC Docs">Missing Docs</span>
                      )}
                      <button 
                        onClick={() => {
                          setMessageSeller(s);
                          setMsgSubject('Important message regarding your Merchant Account');
                          setMsgContent('');
                        }}
                        title="Message Seller"
                        className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-sm font-bold flex items-center justify-center h-[24px] w-[28px]"
                      >
                        <span className="material-symbols-outlined text-[14px]">mail</span>
                      </button>
                      <button 
                        onClick={() => {`
);

// 3. Add message modal UI at the end
const messageModalStr = `      {messageSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-md w-full p-6 text-zinc-900 dark:text-zinc-100 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold font-heading">Message {messageSeller.businessName}</h3>
              <button onClick={() => setMessageSeller(null)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Subject</label>
                <input 
                  type="text" 
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Message</label>
                <textarea 
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  rows={4}
                  className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                  placeholder="Type your message here..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button 
                onClick={() => setMessageSeller(null)} 
                className="bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  if(!msgSubject || !msgContent) return alert("Please fill all fields");
                  setIsSending(true);
                  try {
                    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8004';
                    await fetch(\`\${API_URL}/api/messages/\`, {
                      method: 'POST',
                      headers: {'Content-Type': 'application/json'},
                      body: JSON.stringify({
                        sender_id: 'e6db98c7-06a2-4887-aab2-539bd9280f01',
                        receiver_id: messageSeller.owner || messageSeller.user_id,
                        subject: msgSubject,
                        content: msgContent
                      })
                    });
                    alert("Message sent successfully!");
                    setMessageSeller(null);
                  } catch (err) {
                    console.error(err);
                    alert("Error sending message.");
                  } finally {
                    setIsSending(false);
                  }
                }}
                disabled={isSending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
              >
                {isSending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSellers;`;

content = content.replace("    </div>\n  );\n};\n\nexport default AdminSellers;", messageModalStr);

fs.writeFileSync(file, content);

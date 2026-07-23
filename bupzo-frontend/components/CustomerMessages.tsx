import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

export function CustomerMessages({ user }: { user: any }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [composeReceiver, setComposeReceiver] = useState('a01b1234-5678-abcd-ef01-1234567890aa');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeContent, setComposeContent] = useState('');
  useEffect(() => {
    if (user?.id) {
      loadMessages();
      loadAllUsers();
    }
  }, [user?.id]);

  const loadAllUsers = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/users/`);
      if (resp.ok) setAllUsers(await resp.json());
    } catch (e) {}
  };

  const loadMessages = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/messages/?user_id=${user.id}`);
      if (resp.ok) {
        const msgs: any[] = await resp.json();
        setMessages(msgs);
        
        // Auto mark received messages as read
        const unreadReceived = msgs.filter(m => m.receiver_id === user.id && !m.is_read);
        if (unreadReceived.length > 0) {
          await Promise.all(
            unreadReceived.map(m => fetch(`${API_BASE_URL}/api/messages/${m.id}/read`, { method: 'PUT' }))
          );
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) return;
    try {
      const resp = await fetch(`${API_BASE_URL}/api/messages/?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: replyTo.sender_id === user.id ? replyTo.receiver_id : replyTo.sender_id,
          subject: `Re: ${replyTo.subject}`,
          content: replyContent
        })
      });
      if (resp.ok) {
        alert("Message sent!");
        setShowReplyModal(false);
        setReplyContent('');
        loadMessages();
      } else {
        alert("Failed to send message.");
      }
    } catch (err) {
      alert("Error sending message.");
    }
  };

  const handleCompose = async () => {
    if (!composeSubject.trim() || !composeContent.trim() || !composeReceiver.trim()) return;
    
    let finalReceiverId = composeReceiver;
    const foundUser = allUsers.find(u => u.email.toLowerCase() === composeReceiver.toLowerCase().trim());
    if (foundUser) {
      finalReceiverId = foundUser.id;
    }

    try {
      const resp = await fetch(`${API_BASE_URL}/api/messages/?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: finalReceiverId,
          subject: composeSubject,
          content: composeContent
        })
      });
      if (resp.ok) {
        alert("Message sent!");
        setShowComposeModal(false);
        setComposeSubject('');
        setComposeContent('');
        loadMessages();
      } else {
        alert("Failed to send message.");
      }
    } catch (err) {
      alert("Error sending message.");
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading messages...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Messages</h1>
        <button
          onClick={() => setShowComposeModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700"
        >
          Compose Message
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">You have no messages.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {messages.map((m: any) => (
              <div key={m.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="font-bold text-gray-800">
                      {m.sender_id === user.id ? `To: ${m.receiver_name}` : `From: ${m.sender_name}`}
                    </span>
                    <span className="text-xs text-gray-500 ml-3">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  {m.sender_id !== user.id && (
                    <button
                      onClick={() => {
                        setReplyTo(m);
                        setShowReplyModal(true);
                      }}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Reply
                    </button>
                  )}
                </div>
                <div className="font-semibold text-sm text-gray-700 mb-1">{m.subject}</div>
                <p className="text-sm text-gray-600">{m.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Reply to {replyTo?.sender_name}</h3>
            <textarea
              value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              className="w-full h-32 border p-3 rounded-lg text-sm mb-4 outline-none focus:border-blue-500"
              placeholder="Type your message..."
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowReplyModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleReply} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>
      )}

      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Compose Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Recipient</label>
                <select
                  value={composeReceiver}
                  onChange={e => setComposeReceiver(e.target.value)}
                  className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option value="a01b1234-5678-abcd-ef01-1234567890aa">Admin Support</option>
                  {allUsers.filter(u => u.id !== "a01b1234-5678-abcd-ef01-1234567890aa").map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name || u.email || u.phone || u.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Subject</label>
                <input
                  type="text"
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  className="w-full border p-2 rounded text-sm outline-none focus:border-blue-500"
                  placeholder="Subject"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Message</label>
                <textarea
                  value={composeContent}
                  onChange={e => setComposeContent(e.target.value)}
                  className="w-full h-32 border p-2 rounded text-sm outline-none focus:border-blue-500"
                  placeholder="Type your message..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowComposeModal(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
              <button onClick={handleCompose} className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

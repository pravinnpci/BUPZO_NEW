'use client';

import { useState, useEffect } from 'react';

export default function Notification({ messages }: { messages: string[] }) {
  const [visibleMessages, setVisibleMessages] = useState<string[]>([]);

  useEffect(() => {
    if (messages.length > visibleMessages.length) {
      setVisibleMessages(messages.slice(-3));
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {visibleMessages.map((message, index) => (
        <div key={index} className="bg-charcoal text-white p-3 rounded-lg mb-2 shadow-lg max-w-xs">
          {message}
        </div>
      ))}
    </div>
  );
}
'use client';

import { useState } from 'react';
import { toast } from 'sonner';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.8rem',
  fontFamily: 'inherit',
  fontSize: '0.92rem',
  borderRadius: '8px',
  border: '1px solid var(--parchment)',
  background: 'var(--warm-white)',
  color: 'var(--text-primary)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '0.35rem',
};

export default function ContactForm() {
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [topic,   setTopic]   = useState('general');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !message.trim()) {
      toast.error('Please add your email and a message.');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name, email, topic, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data?.error ?? 'Failed to send. Please email us instead.');
        return;
      }
      setDone(true);
      setName('');
      setEmail('');
      setMessage('');
      setTopic('general');
      toast.success('Message sent — we&apos;ll reply within 2 business days.');
    } catch {
      toast.error('Network error. Please email us directly.');
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div style={{
        padding: '1.25rem 1.5rem',
        border: '1px solid var(--parchment)',
        borderRadius: '12px',
        background: 'var(--warm-white)',
        color: 'var(--text-primary)',
      }}>
        <p style={{ margin: 0, fontWeight: 600 }}>Thanks — your message is on its way.</p>
        <p style={{ margin: '0.4rem 0 0', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Expect a reply within 2 business days. Need to add something? Just submit again.
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          style={{
            marginTop: '0.85rem',
            padding: '0.45rem 0.9rem',
            fontSize: '0.82rem',
            border: '1px solid var(--parchment)',
            borderRadius: '8px',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            fontFamily: 'inherit',
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="contact-name" style={labelStyle}>Your name (optional)</label>
        <input id="contact-name" type="text" value={name} onChange={e => setName(e.target.value.slice(0, 80))}
               style={inputStyle} maxLength={80} autoComplete="name" />
      </div>
      <div>
        <label htmlFor="contact-email" style={labelStyle}>Email *</label>
        <input id="contact-email" type="email" required value={email} onChange={e => setEmail(e.target.value.slice(0, 120))}
               style={inputStyle} maxLength={120} autoComplete="email" />
      </div>
      <div>
        <label htmlFor="contact-topic" style={labelStyle}>Topic</label>
        <select id="contact-topic" value={topic} onChange={e => setTopic(e.target.value)} style={inputStyle}>
          <option value="general">General</option>
          <option value="billing">Billing / refund</option>
          <option value="privacy">Privacy request</option>
          <option value="bug">Bug report</option>
          <option value="partnership">Partnership / B2B</option>
        </select>
      </div>
      <div>
        <label htmlFor="contact-message" style={labelStyle}>Message *</label>
        <textarea id="contact-message" required rows={6} value={message}
                  onChange={e => setMessage(e.target.value.slice(0, 4000))}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} maxLength={4000} />
        <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          {message.length} / 4000
        </div>
      </div>
      <button type="submit" disabled={sending} style={{
        padding: '0.7rem 1.2rem',
        background: sending ? '#ccc' : 'var(--terracotta)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '0.95rem',
        fontWeight: 700,
        cursor: sending ? 'default' : 'pointer',
        fontFamily: 'inherit',
        alignSelf: 'flex-start',
      }}>
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

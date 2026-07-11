import React, { useRef, useEffect, useState } from 'react';
import { X, Hash, Settings, Check, Send, Volume2, MessageSquare, Trophy } from 'lucide-react';

const CHANNELS = [
  { id: 'live-discussion', label: 'live-discussion' },
  { id: 'predictions-talk', label: 'predictions-talk' },
  { id: 'var-complaints',   label: 'var-complaints' },
];

const MOCK_ARCHIVES = {
  'predictions-talk': [
    { username: 'VAR_Official',    text: 'Welcome to #predictions-talk! 📈', timestamp: '09:00' },
    { username: 'GoalScorer',      text: 'My model is predicting Spain to go all the way.', timestamp: '09:30' },
    { username: 'ZezoFans',        text: 'France Elo rating is sky-high after the group stage.', timestamp: '11:20' },
    { username: 'MidfieldMaestro', text: 'Germany vs Argentina final would be epic!', timestamp: '12:45' },
  ],
  'var-complaints': [
    { username: 'VAR_Official', text: 'Submit complaints about refereeing calls here. 🟥🟨', timestamp: '08:00' },
    { username: 'PitchInvader', text: 'That penalty call in the 89th min was total garbage!', timestamp: '08:45' },
    { username: 'VAR_Guru',     text: 'Always trust the VAR! Best camera angles.', timestamp: '10:15' },
  ],
};

export default function ChatSidebar({
  isOpen, onClose,
  messages, nickname, setNickname,
  activeChannel, setActiveChannel,
  onSendMessage,
  isCometChatConfigured,
  accuracy,
}) {
  const [typedMessage, setTypedMessage] = useState('');
  const [isChangingName, setIsChangingName] = useState(false);
  const [newNameInput, setNewNameInput] = useState(nickname);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, activeChannel]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    await onSendMessage(typedMessage);
    setTypedMessage('');
  };

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (newNameInput.trim()) {
      setNickname(newNameInput.trim());
      localStorage.setItem('wc_chat_nickname', newNameInput.trim());
      setIsChangingName(false);
    }
  };

  return (
    <>
      {/* Backdrop on mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1050,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}
          className="lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <div
        className={isOpen ? 'animate-slide-in-right' : ''}
        style={{
          position: 'fixed', top: '64px', right: 0, bottom: 0,
          width: isOpen ? '380px' : '0',
          zIndex: 1060,
          background: '#0d1526',
          borderLeft: isOpen ? '1px solid rgba(255,215,0,0.12)' : 'none',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          fontFamily: 'Inter, sans-serif',
          boxShadow: isOpen ? '-8px 0 32px rgba(0,0,0,0.4)' : 'none',
          maxWidth: '100vw',
        }}
      >
        {isOpen && (
          <>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#071428',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={15} color="#FFD700" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#F0F4FF' }}>⚽ WC-MATCHDAY</span>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              {/* Channel List */}
              <div style={{ width: '140px', background: '#0a1020', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                <div style={{ padding: '12px 8px', flex: 1 }}>
                  <div style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', padding: '4px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Text Channels
                  </div>
                  {CHANNELS.map(ch => (
                    <ChannelBtn
                      key={ch.id}
                      name={ch.label}
                      active={activeChannel === ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                    />
                  ))}

                  <div style={{ paddingTop: '20px', fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', padding: '20px 8px 8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Stats
                  </div>
                  <div style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Trophy size={11} color="#FFD700" />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>
                      {accuracy?.winner_accuracy ?? '–'}%
                    </span>
                  </div>
                </div>

                {/* User profile */}
                <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#071428' }}>
                  {isChangingName ? (
                    <form onSubmit={handleNameSubmit} style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        value={newNameInput}
                        onChange={e => setNewNameInput(e.target.value)}
                        maxLength={15}
                        autoFocus
                        style={{
                          flex: 1, padding: '4px 6px',
                          background: '#0a1020', border: '1px solid rgba(255,255,255,0.15)',
                          borderRadius: '6px', color: 'white', fontSize: '11px',
                          outline: 'none', fontFamily: 'Inter, sans-serif',
                        }}
                      />
                      <button type="submit" style={{ background: '#FFD700', color: '#040d1a', border: 'none', borderRadius: '6px', padding: '4px 6px', cursor: 'pointer' }}>
                        <Check size={11} />
                      </button>
                    </form>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 800, color: '#040d1a',
                        }}>
                          {nickname.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1, maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nickname}</div>
                          <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>#Guest</div>
                        </div>
                      </div>
                      <button onClick={() => { setNewNameInput(nickname); setIsChangingName(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '2px' }}>
                        <Settings size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#0f1829' }}>
                {/* Channel Header */}
                <div style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  flexShrink: 0,
                }}>
                  <Hash size={14} color="rgba(255,255,255,0.4)" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{activeChannel}</span>
                </div>

                {/* Messages */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {activeChannel === 'live-discussion' ? (
                    messages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>
                        <Volume2 size={24} style={{ margin: '0 auto 8px' }} />
                        No messages yet. Be the first!
                      </div>
                    ) : (
                      messages.map((msg, i) => (
                        <ChatMsg key={i} msg={msg} isMe={msg.username === nickname} />
                      ))
                    )
                  ) : (
                    <MockArchive channel={activeChannel} />
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#0a1020', flexShrink: 0 }}>
                  {activeChannel === 'live-discussion' ? (
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        value={typedMessage}
                        onChange={e => setTypedMessage(e.target.value)}
                        placeholder={`Message #${activeChannel}`}
                        maxLength={150}
                        style={{
                          flex: 1, padding: '9px 12px',
                          background: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          borderRadius: '8px', color: 'white',
                          fontSize: '12px', outline: 'none',
                          fontFamily: 'Inter, sans-serif',
                          transition: 'border-color 0.2s',
                        }}
                        onFocus={e => e.target.style.borderColor = 'rgba(255,215,0,0.4)'}
                        onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: '9px 12px',
                          background: 'linear-gradient(135deg, #FFD700, #B8860B)',
                          color: '#040d1a', border: 'none', borderRadius: '8px',
                          cursor: 'pointer', fontWeight: 700,
                          display: 'flex', alignItems: 'center',
                        }}
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.3)', padding: '8px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.08)' }}>
                      Read-only channel
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ChannelBtn({ name, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
        padding: '6px 8px', border: 'none', borderRadius: '6px',
        cursor: 'pointer', textAlign: 'left',
        background: active ? 'rgba(255,215,0,0.08)' : 'transparent',
        color: active ? '#FFD700' : 'rgba(255,255,255,0.45)',
        fontSize: '11px', fontWeight: active ? 600 : 400,
        transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
      }}
    >
      <Hash size={11} style={{ flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
    </button>
  );
}

function ChatMsg({ msg, isMe }) {
  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
        background: isMe ? 'linear-gradient(135deg, #FFD700, #B8860B)' : 'linear-gradient(135deg, #0066CC, #003366)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '9px', fontWeight: 800,
        color: isMe ? '#040d1a' : 'white',
      }}>
        {msg.username.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'baseline', marginBottom: '2px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: isMe ? '#FFD700' : 'rgba(255,255,255,0.7)' }}>{msg.username}</span>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace' }}>{msg.timestamp || '—'}</span>
        </div>
        <p style={{
          fontSize: '12px', color: 'rgba(255,255,255,0.75)',
          background: 'rgba(255,255,255,0.05)',
          padding: '6px 10px', borderRadius: '6px',
          margin: 0, wordBreak: 'break-word', lineHeight: 1.5,
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {msg.text}
        </p>
      </div>
    </div>
  );
}

function MockArchive({ channel }) {
  const list = MOCK_ARCHIVES[channel] || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ background: 'rgba(255,215,0,0.05)', border: '1px solid rgba(255,215,0,0.15)', borderRadius: '8px', padding: '8px 12px', fontSize: '11px', color: 'rgba(255,215,0,0.7)', lineHeight: 1.5 }}>
        ℹ️ Archived channel — read only. Post in <strong>#live-discussion</strong>.
      </div>
      {list.map((msg, i) => (
        <ChatMsg key={i} msg={msg} isMe={false} />
      ))}
    </div>
  );
}

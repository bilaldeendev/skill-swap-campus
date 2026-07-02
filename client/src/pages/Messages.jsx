import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getInitials, getAvatarColor, timeAgo } from '../utils/helpers';
import { Send, MessageSquare } from 'lucide-react';
import './Messages.css';

let socket;

export default function Messages() {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimer = useRef(null);

  // Setup socket
  useEffect(() => {
    socket = io('http://localhost:5000');
    socket.emit('join', user?._id);

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('userTyping', ({ senderId }) => {
      if (senderId === activeUser?._id) setPartnerTyping(true);
    });

    socket.on('userStoppedTyping', ({ senderId }) => {
      if (senderId === activeUser?._id) setPartnerTyping(false);
    });

    return () => socket.disconnect();
  }, [user?._id, activeUser?._id]);

  // Load conversations
  useEffect(() => {
    api.get('/messages/conversations').then(({ data }) => {
      setConversations(data);
      if (userId) {
        const existing = data.find((c) => c.partner._id === userId);
        if (existing) selectConversation(existing.partner);
        else {
          // New conversation — fetch user profile
          api.get(`/users/${userId}`).then(({ data: u }) => selectConversation(u.user));
        }
      }
    });
  }, [userId]);

  const selectConversation = async (partner) => {
    setActiveUser(partner);
    navigate(`/messages/${partner._id}`, { replace: true });
    const { data } = await api.get(`/messages/${partner._id}`);
    setMessages(data);
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeUser) return;
    const content = text.trim();
    setText('');

    socket.emit('stopTyping', { senderId: user._id, receiverId: activeUser._id });

    try {
      const { data: msg } = await api.post('/messages', { receiver: activeUser._id, content });
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) { console.error(err); }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!activeUser) return;
    socket.emit('typing', { senderId: user._id, receiverId: activeUser._id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit('stopTyping', { senderId: user._id, receiverId: activeUser._id });
    }, 1500);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Layout>
      <div className="messages-page animate-fade-in">
        {/* Conversations sidebar */}
        <div className="convos-panel glass-card">
          <div className="convos-header">
            <h2>Messages</h2>
          </div>
          {conversations.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 16px' }}>
              <MessageSquare size={36} style={{ color: 'var(--text-muted)' }} />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="convos-list">
              {conversations.map(({ partner, lastMessage, unreadCount }) => (
                <button
                  key={partner._id}
                  className={`convo-item ${activeUser?._id === partner._id ? 'active' : ''}`}
                  onClick={() => selectConversation(partner)}
                >
                  <div className="avatar" style={{ width: 44, height: 44, fontSize: 15, background: getAvatarColor(partner.name), flexShrink: 0 }}>
                    {getInitials(partner.name)}
                  </div>
                  <div className="convo-info">
                    <div className="convo-name">{partner.name}</div>
                    <div className="convo-last">
                      {lastMessage?.content?.substring(0, 36)}{lastMessage?.content?.length > 36 ? '…' : ''}
                    </div>
                  </div>
                  <div className="convo-meta">
                    <div className="convo-time">{timeAgo(lastMessage?.createdAt)}</div>
                    {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chat window */}
        <div className="chat-panel glass-card">
          {!activeUser ? (
            <div className="empty-state" style={{ flex: 1 }}>
              <MessageSquare size={48} style={{ color: 'var(--text-muted)' }} />
              <h3>Select a conversation</h3>
              <p>Choose someone to chat with</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <div className="avatar" style={{ width: 40, height: 40, fontSize: 14, background: getAvatarColor(activeUser.name) }}>
                  {getInitials(activeUser.name)}
                </div>
                <div>
                  <div className="chat-partner-name">{activeUser.name}</div>
                  <div className="chat-partner-sub">{activeUser.campus || 'Student'}</div>
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {messages.map((msg, i) => {
                  const isMine = msg.sender._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id || i} className={`message-wrap ${isMine ? 'mine' : 'theirs'}`}>
                      {!isMine && (
                        <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, background: getAvatarColor(activeUser.name) }}>
                          {getInitials(activeUser.name)}
                        </div>
                      )}
                      <div className={`bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                        {msg.content}
                        <span className="bubble-time">{timeAgo(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
                {partnerTyping && (
                  <div className="message-wrap theirs">
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, background: getAvatarColor(activeUser.name) }}>
                      {getInitials(activeUser.name)}
                    </div>
                    <div className="bubble bubble-theirs typing-indicator">
                      <span /><span /><span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form className="chat-input-row" onSubmit={sendMessage}>
                <input
                  className="chat-input"
                  placeholder={`Message ${activeUser.name}...`}
                  value={text}
                  onChange={handleTyping}
                />
                <button type="submit" className="btn btn-primary" disabled={!text.trim()}>
                  <Send size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Chat() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Fetch contacts (using matches for simplicity, as matches are the valid peers)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:5000/api/match', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContacts(res.data);
        
        // If there's a pre-selected peer from navigation state
        if (location.state?.peer) {
          setSelectedContact(location.state.peer);
        } else if (res.data.length > 0) {
          // Select first contact by default
          setSelectedContact(res.data[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, [location.state]);

  // Fetch chat history
  const fetchChatHistory = async (contactId) => {
    if (!contactId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://127.0.0.1:5000/api/chat/history/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Poll for new messages when a contact is selected
  useEffect(() => {
    if (selectedContact) {
      setLoadingChat(true);
      fetchChatHistory(selectedContact.id).finally(() => setLoadingChat(false));
      
      const interval = setInterval(() => {
        fetchChatHistory(selectedContact.id);
      }, 3000); // Polling every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [selectedContact]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    
    const tempMsg = newMessage;
    setNewMessage('');
    
    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now().toString(),
      senderId: user.id,
      receiverId: selectedContact.id,
      content: tempMsg,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:5000/api/chat/send', {
        receiverId: selectedContact.id,
        content: tempMsg
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // We rely on the upcoming poll to get the actual registered message
    } catch (err) {
      console.error("Failed to send message:", err);
      // Depending on requirement, we might remove the optimistic message on failure
    }
  };

  return (
    <div className="fade-in d-flex flex-column h-100" style={{maxHeight: 'calc(100vh - 100px)'}}>
      <h1 className="fw-bold mb-1" style={{color: 'var(--accent-orange)'}}>Messages</h1>
      <p style={{color: 'var(--text-muted)'}} className="mb-4">Chat with your peers to coordinate sharing skills.</p>

      <div className="flex-grow-1 d-flex rounded-3 overflow-hidden" style={{background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', minHeight: '500px'}}>
        
        {/* Sidebar / Contacts List */}
        <div className="col-4 border-end" style={{borderColor: 'var(--border-subtle) !important', display: 'flex', flexDirection: 'column'}}>
          <div className="p-3 border-bottom" style={{borderColor: 'var(--border-subtle) !important', background: '#19191d'}}>
            <h6 className="mb-0 fw-bold text-white">Your Matches</h6>
          </div>
          <div className="flex-grow-1 overflow-auto p-2 d-flex flex-column gap-1">
            {loadingContacts ? (
              <div className="d-flex justify-content-center p-3"><div className="spinner-border spinner-border-sm text-warning"/></div>
            ) : contacts.length === 0 ? (
              <p className="p-3 text-muted text-center" style={{fontSize: '0.9rem'}}>No matched peers yet.</p>
            ) : (
              contacts.map(contact => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <div 
                    key={contact.id} 
                    className={`d-flex align-items-center gap-3 p-3 rounded cursor-pointer transition-all ${isSelected ? 'bg-secondary bg-opacity-25' : ''}`}
                    style={{cursor: 'pointer'}}
                    onClick={() => setSelectedContact(contact)}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
                  >
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{width: '40px', height: '40px', background: 'rgba(255,171,0,0.1)', color: 'var(--accent-orange)'}}>
                      {contact.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h6 className="mb-0 text-white text-truncate" style={{fontSize: '0.95rem'}}>{contact.name}</h6>
                      {contact.youCanTeach?.length > 0 && 
                        <small className="text-muted d-block text-truncate" style={{fontSize: '0.75rem'}}>Matches based on {contact.youCanTeach[0]}</small>
                      }
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="col-8 d-flex flex-column bg-dark">
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="p-3 border-bottom d-flex align-items-center gap-3" style={{borderColor: 'var(--border-subtle) !important', background: '#19191d'}}>
                 <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                      style={{width: '40px', height: '40px', background: 'rgba(255,171,0,0.2)', color: 'var(--accent-orange)'}}>
                      {selectedContact.name.charAt(0)}
                 </div>
                 <div>
                    <h5 className="mb-0 text-white">{selectedContact.name}</h5>
                    <small className="text-muted">StackMate Match</small>
                 </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-grow-1 overflow-auto p-4 d-flex flex-column gap-3" style={{backgroundColor: '#111111'}}>
                {loadingChat ? (
                   <div className="d-flex justify-content-center py-5"><div className="spinner-border text-warning"/></div>
                ) : messages.length === 0 ? (
                   <div className="mt-auto mb-auto text-center">
                      <div className="text-muted mb-2">No messages yet.</div>
                      <div className="text-muted" style={{fontSize: '0.85rem'}}>Say hello and coordinate your skill exchange!</div>
                   </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.senderId === user?.id; // Important: ensure AuthContext uses `.id`
                    return (
                      <div key={msg.id} className={`d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                        <div className={`p-3 rounded-3 shadow-sm ${isMine ? 'rounded-bottom-end-0' : 'rounded-bottom-start-0'}`} 
                             style={{
                               maxWidth: '75%', 
                               backgroundColor: isMine ? 'var(--accent-orange)' : '#2a2a30',
                               color: isMine ? '#000' : '#fff'
                             }}>
                           <div style={{wordBreak: 'break-word'}}>{msg.content}</div>
                           <div className={`mt-1 text-end ${isMine ? 'text-dark opacity-75' : 'text-muted'}`} style={{fontSize: '0.7rem'}}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <div className="p-3 border-top" style={{borderColor: 'var(--border-subtle) !important', background: '#19191d'}}>
                 <form onSubmit={handleSendMessage} className="d-flex gap-2">
                   <input 
                     type="text" 
                     className="form-control text-white border-0 shadow-none" 
                     style={{backgroundColor: '#2a2a30'}} 
                     placeholder="Type your message..." 
                     value={newMessage}
                     onChange={(e) => setNewMessage(e.target.value)}
                   />
                   <button type="submit" className="btn fw-bold px-4 flex-shrink-0" style={{backgroundColor: 'var(--accent-orange)', color: '#000'}} disabled={!newMessage.trim()}>
                     Send
                   </button>
                 </form>
              </div>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 flex-column text-muted" style={{backgroundColor: '#111111'}}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-3 opacity-50">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h5>No Chat Selected</h5>
              <p style={{fontSize: '0.9rem'}}>Select a peer from the left to start messaging.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;

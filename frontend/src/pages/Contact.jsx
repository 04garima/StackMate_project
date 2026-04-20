import React, { useState } from 'react';

function Contact() {
  const [status, setStatus] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('Message sent successfully!');
    setTimeout(() => setStatus(''), 3000);
  };

  return (
    <div className="page-container" style={{paddingTop: '4rem'}}>
      
      <h1 className="title-massive" style={{fontSize: '4.5rem', marginBottom: '1.5rem', textAlign: 'center'}}>Get in Touch</h1>
      <p className="subtitle" style={{textAlign: 'center', marginBottom: '4rem', maxWidth: '600px'}}>
        Have a question or want to get your college approved? We'd love to hear from you.
      </p>

      {/* Contact Layout mimicking Image 1 */}
      <div className="contact-layout">
        
        {/* Left Side: Info Cards */}
        <div className="contact-left">
          
          <div className="contact-info-card">
            <div className="feature-icon" style={{margin:0}}>✉️</div>
            <div>
              <h4>Email</h4>
              <p>hello@stackmate.dev</p>
            </div>
          </div>
          
          <div className="contact-info-card">
            <div className="feature-icon" style={{margin:0}}>🏫</div>
            <div>
              <h4>For Colleges</h4>
              <p>colleges@stackmate.dev</p>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="feature-icon" style={{margin:0}}>🐛</div>
            <div>
              <h4>Report a Bug</h4>
              <p>bugs@stackmate.dev</p>
            </div>
          </div>

        </div>

        {/* Right Side: Form */}
        <div className="contact-right">
          <div className="form-box" style={{maxWidth: '100%', padding: '2rem 2.5rem'}}>
            <h2 style={{fontSize: '1.5rem', marginBottom: '2rem', color: '#fff', fontFamily: 'Archivo Black'}}>Send a Message</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="input-block">
                <label>Your Name</label>
                <input type="text" className="input-field" placeholder="Ravi Sharma" required />
              </div>
              
              <div className="input-block">
                <label>Email Address</label>
                <input type="email" className="input-field" placeholder="ravi@college.edu" required />
              </div>

              <div className="input-block">
                <label>Message</label>
                <textarea className="input-field" placeholder="What's on your mind?" rows="4" style={{resize: 'vertical'}} required></textarea>
              </div>

              <button type="submit" className="btn-primary" style={{width: '100%', marginTop: '1rem', padding: '1rem'}}>
                Send Message
              </button>
              
              {status && <div className="message success" style={{marginTop: '1rem'}}>{status}</div>}
            </form>
          </div>
        </div>

      </div>

    </div>
  );
}

export default Contact;

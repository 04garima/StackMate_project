import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function SkillSelector({ label, value, onChange, placeholder }) {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Parse comma-separated string into array for internal use
  const selectedSkills = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get('http://127.0.0.1:5000/api/skills/');
        setSkills(res.data);
      } catch (err) {
        console.error('Failed to fetch skills', err);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = skills.filter(s => s.name.toLowerCase().includes(term));
    setFilteredSkills(filtered);
  }, [searchTerm, skills]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSkill = (skillName) => {
    const trimmed = skillName.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      const newSkills = [...selectedSkills, trimmed];
      onChange(newSkills.join(', '));
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = selectedSkills.filter(s => s !== skillToRemove);
    onChange(newSkills.join(', '));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (searchTerm) handleAddSkill(searchTerm);
    }
  };

  return (
    <div className="mb-4" ref={dropdownRef}>
      <label className="form-label fw-bold d-block mb-3" style={{color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
        {label}
      </label>
      
      {/* Premium Tags Display */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        {selectedSkills.map(skill => (
          <div key={skill} className="d-flex align-items-center gap-2 py-1.5 px-3 rounded-pill transition-all" 
            style={{background: 'linear-gradient(135deg, rgba(255, 171, 0, 0.15) 0%, rgba(255, 171, 0, 0.05) 100%)', border: '1px solid rgba(255, 171, 0, 0.3)', color: 'var(--accent-orange)'}}>
            <span style={{fontSize: '0.85rem', fontWeight: 600}}>{skill}</span>
            <button 
              type="button" 
              className="btn p-0 d-flex align-items-center justify-content-center border-0 shadow-none" 
              style={{width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: '10px'}}
              onClick={() => handleRemoveSkill(skill)}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="position-relative d-flex gap-2">
        <div className="flex-grow-1 position-relative">
          <input
            type="text"
            className="form-control"
            style={{background:'#0d0d10', border:'1px solid var(--border-subtle)', color:'#fff', padding: '0.75rem 1rem'}}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={selectedSkills.length === 0 ? placeholder : "Add more..."}
            onFocus={() => setShowDropdown(true)}
          />
          
          {showDropdown && searchTerm && (
            <div className="position-absolute w-100 mt-1 rounded shadow-lg z-3 animate-fade-in" style={{background: '#19191d', border: '1px solid #2a2a30', maxHeight: '200px', overflowY: 'auto'}}>
              <div className="py-1">
                {filteredSkills.length > 0 ? filteredSkills.map(skill => (
                  <div 
                    key={skill._id}
                    className="px-3 py-2"
                    style={{cursor: 'pointer', color: '#d1d5db', fontSize: '0.9rem'}}
                    onClick={() => handleAddSkill(skill.name)}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#d1d5db'; }}
                  >
                    {skill.name} <span className="text-muted ms-2" style={{fontSize: '0.75rem'}}>({skill.category})</span>
                  </div>
                )) : (
                  <div 
                    className="px-3 py-2 text-warning fw-medium"
                    style={{cursor: 'pointer', fontSize: '0.85rem'}}
                    onClick={() => handleAddSkill(searchTerm)}
                  >
                    Add "{searchTerm}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <button 
          type="button" 
          className="btn px-4 fw-bold" 
          style={{background: searchTerm ? 'var(--accent-orange)' : 'rgba(255,255,255,0.05)', color: searchTerm ? '#000' : 'rgba(255,255,255,0.3)', border: '1px solid transparent', transition: 'all 0.3s'}}
          onClick={() => handleAddSkill(searchTerm)}
          disabled={!searchTerm}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default SkillSelector;

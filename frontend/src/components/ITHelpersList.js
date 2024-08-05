import React, { useState, useEffect } from 'react';
import './ITHelpersList.css';

function ITHelpersList({ onSelectHelper }) {
  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    async function fetchHelpers() {
      const response = await fetch('http://localhost:5000/auth/it-helpers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHelpers(data);
      }
    }

    fetchHelpers();
  }, []);

  return (
    <div className="it-helpers-list">
      <ul>
        {helpers.map(helper => (
          <li key={helper.id} onClick={() => onSelectHelper(helper)}>
            {helper.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ITHelpersList;

import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = '<ENTER_YOUR_API_URL>'; // Substitui pela tua API Gateway URL

  const handleSearch = async () => {
    setLoading(true);
    const normalizedTerm = searchTerm.trim().toLowerCase();

    try {
      const url = normalizedTerm
        ? `${apiUrl}/get-definition?term=${encodeURIComponent(normalizedTerm)}`
        : `${apiUrl}/get-definition`;

      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data : [response.data];

      const filtered = data.filter(
        (item) =>
          item.term.toLowerCase() === normalizedTerm ||
          item.term.toLowerCase().includes(normalizedTerm)
      );

      setFilteredTerms(filtered.length ? filtered : data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setFilteredTerms([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>☁️ Cloud Dictionary</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search any cloud term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </header>

      <main className="dictionary-container">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : filteredTerms.length > 0 ? (
          filteredTerms.map((term) => (
            <div key={term.term} className="card">
              <h3>{term.term}</h3>
              <p>{term.definition}</p>
            </div>
          ))
        ) : (
          <p className="no-results">No results found.</p>
        )}
      </main>
    </div>
  );
};

export default App;

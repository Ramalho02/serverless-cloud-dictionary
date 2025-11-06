import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // API base URL
  const apiUrl = 'https://72l2zisur6.execute-api.us-east-1.amazonaws.com/dev';

  const handleSearch = async () => {
    setError('');
    setTerms([]);

    if (!searchTerm.trim()) {
      setError('Por favor, digite uma palavra para buscar.');
      return;
    }

    try {
      // Get ALL terms from API
      const url = `${apiUrl}/get-definition`;
      const response = await axios.get(url);

      if (!response.data || response.data.length === 0) {
        setError('Nenhum termo encontrado.');
        return;
      }

      // Case-insensitive filtering
      const filtered = response.data.filter(item =>
        item.term.toLowerCase() === searchTerm.toLowerCase()
      );

      if (filtered.length === 0) {
        setError('Nenhum termo encontrado.');
      } else {
        setTerms(filtered);
      }
    } catch (err) {
      console.error('Erro ao buscar o termo:', err);
      setError('Erro ao buscar o termo. Tente novamente.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cloud Dictionary</h1>
        <input
          type="text"
          placeholder="Digite um termo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch}>Buscar</button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <div className="dictionary-container">
        {terms.map((term, index) => (
          <div key={index} className="card">
            <h3>{term.term || 'Sem título'}</h3>
            <p>{term.definition || 'Sem definição disponível.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

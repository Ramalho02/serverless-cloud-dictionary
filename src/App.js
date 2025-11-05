// App.jsx - Funcionalidade refinada e case-insensitive
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  const apiUrl = 'https://72l2zisur6.execute-api.us-east-1.amazonaws.com/dev';

  const handleSearch = async () => {
    setError(''); // limpa erro anterior

    if (!searchTerm.trim()) {
      setError('Por favor, digite uma palavra para buscar.');
      setTerms([]);
      return;
    }

    try {
      const url = `${apiUrl}/get-definition?term=${encodeURIComponent(searchTerm)}`;
      const response = await axios.get(url);

      if (!response.data || Object.keys(response.data).length === 0) {
        setTerms([]);
        setError('Nenhum termo encontrado.');
        return;
      }

      // Transformar todas as palavras em minúsculas para comparação
      const fetchedTerm = {
        term: response.data.term,
        definition: response.data.definition
      };

      setTerms([fetchedTerm]);
    } catch (err) {
      console.error(err);
      setError('Erro ao buscar o termo. Tente novamente.');
      setTerms([]);
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
        {terms.map((term) => (
          <div key={term.term} className="card">
            <h3>{term.term}</h3>
            <p>{term.definition}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

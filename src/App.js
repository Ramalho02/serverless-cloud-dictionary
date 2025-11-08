import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // 👉 Coloque aqui o endpoint da sua API Gateway
  const apiUrl = 'https://72l2zisur6.execute-api.us-east-1.amazonaws.com/dev';

  const handleSearch = async () => {
    setError('');
    setTerms([]);

    const cleanedSearch = searchTerm.trim();

    if (!cleanedSearch) {
      setError('Por favor, digite uma palavra para buscar.');
      return;
    }

    try {
      // ✅ Envia o termo como parâmetro da URL
      const url = `${apiUrl}/get-definition?term=${encodeURIComponent(cleanedSearch)}`;
      const response = await axios.get(url);

      // O Lambda retorna um único item, não um array
      if (!response.data || !response.data.definition) {
        setError('Nenhum termo encontrado.');
        return;
      }

      // ✅ Armazena o resultado em formato de lista
      setTerms([
        {
          term: response.data.term,
          definition: response.data.definition,
        },
      ]);
    } catch (err) {
      console.error(err);
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

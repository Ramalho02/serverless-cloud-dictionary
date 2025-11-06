import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [terms, setTerms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  // API base URL
  const apiUrl = 'https://72l2zisur6.execute-api.us-east-1.amazonaws.com/dev';

  // tenta transformar o response em um array de itens
  const normalizeResponseToArray = (response) => {
    // response pode ser axios response object
    let data = response && response.data !== undefined ? response.data : response;

    console.debug('RAW response.data:', data);

    // se for string (ex: body stringified), tenta parse
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
        console.debug('Parsed JSON string into:', data);
      } catch (e) {
        // não é JSON — volta como string
        console.debug('response.data is a plain string.');
      }
    }

    // alguns lambdas retornam { body: '...json...' }
    if (data && typeof data === 'object' && data.body) {
      let body = data.body;
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (e) {
          // keep as string if cannot parse
        }
      }
      data = body;
      console.debug('Used data.body ->', data);
    }

    // Dynamo style: { Items: [...] }
    if (data && data.Items && Array.isArray(data.Items)) {
      return data.Items;
    }

    // Common shapes
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    if (data && Array.isArray(data.items)) return data.items;
    if (data && Array.isArray(data.data)) return data.data;

    // se for objeto único (uma definição)
    if (data && typeof data === 'object') return [data];

    // fallback: nada utilizável
    return [];
  };

  const handleSearch = async () => {
    setError('');
    setTerms([]);

    const rawTerm = searchTerm.trim();
    if (!rawTerm) {
      setError('Por favor, digite uma palavra para buscar.');
      return;
    }

    try {
      // 1) pegue sem query (muitos endpoints retornam tudo)
      const url = `${apiUrl}/get-definition`;
      console.debug('Requesting:', url);
      const response = await axios.get(url, { timeout: 10000 });
      console.debug('HTTP status:', response.status);

      // normalize
      const items = normalizeResponseToArray(response);
      console.debug('Normalized items count:', items.length, items);

      if (!items || items.length === 0) {
        // Se não veio nada útil, tenta com query param (algumas APIs exigem ?term=)
        console.debug('No items from base endpoint, trying with query param...');
        const url2 = `${apiUrl}/get-definition?term=${encodeURIComponent(rawTerm)}`;
        console.debug('Requesting:', url2);
        const response2 = await axios.get(url2, { timeout: 10000 });
        console.debug('HTTP status (query):', response2.status);
        const items2 = normalizeResponseToArray(response2);
        console.debug('Normalized items from query count:', items2.length, items2);

        if (!items2 || items2.length === 0) {
          setError('Nenhum termo encontrado (após tentar ambos os modos). Verifique o console.');
          return;
        } else {
          // filtro local case-insensitive & partial match (saas -> SaaS)
          const filtered2 = items2.filter((item) => {
            const text = (item.term || item.Term || item.name || item.title || '').toString();
            return text.toLowerCase().includes(rawTerm.toLowerCase());
          });
          if (filtered2.length === 0) {
            setError('Nenhum termo encontrado (após filtrar localmente). Veja console para o formato dos dados.');
          } else {
            setTerms(filtered2);
          }
          return;
        }
      }

      // se chegou aqui, temos items do primeiro fetch: filtra localmente case-insensitive e partial match
      const filtered = items.filter((item) => {
        const text = (item.term || item.Term || item.name || item.title || '').toString();
        return text.toLowerCase().includes(rawTerm.toLowerCase());
      });

      if (!filtered || filtered.length === 0) {
        setError('Nenhum termo encontrado (filtro local). Verifique console para entender o formato retornado.');
      } else {
        setTerms(filtered);
      }
    } catch (err) {
      console.error('Erro na requisição:', err);
      // Erro sem response normalmente indica Network/CORS
      if (!err.response) {
        setError('Erro de rede ou CORS. Veja o console (Network) para detalhes.');
      } else {
        // mostra status e data para ajudar debugging
        setError(`Erro ao buscar o termo (status ${err.response.status}). Veja console.`);
        console.debug('err.response.data:', err.response.data);
      }
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
            <h3>{term.term || term.Term || term.name || term.title || 'Sem título'}</h3>
            <p>{term.definition || term.Definition || term.desc || term.description || 'Sem definição disponível.'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

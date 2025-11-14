import React, { useState, useEffect } from 'react';
import SellTicketForm from '../components/SellTicketForm';
import SailingsList from '../components/SailingsList';
import { sailingAPI } from '../services/api';

function DashboardOperador({ token }) {
  const [sailings, setSailings] = useState([]);
  const [selectedSailing, setSelectedSailing] = useState(null);
  const [activeTab, setActiveTab] = useState('sailings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSailings();
  }, []);

  const loadSailings = async () => {
    try {
      setLoading(true);
      const response = await sailingAPI.getAll();
      setSailings(response.data);
    } catch (error) {
      console.error('Erro ao carregar viagens:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('sailings')}
          style={{
            background: activeTab === 'sailings' ? '#007bff' : '#6c757d',
            marginRight: '10px'
          }}
        >
          📋 Viagens Disponíveis
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          style={{
            background: activeTab === 'sell' ? '#007bff' : '#6c757d'
          }}
        >
          🎫 Vender Passagem
        </button>
      </div>

      {loading && <div className="loading"><div className="spinner"></div>Carregando...</div>}

      {activeTab === 'sailings' && !loading && (
        <div>
          <h2>Viagens Disponíveis</h2>
          <SailingsList sailings={sailings} onSelect={setSelectedSailing} />
        </div>
      )}

      {activeTab === 'sell' && !loading && (
        <div>
          <h2>Emitir Passagem</h2>
          <SellTicketForm sailing={selectedSailing} sailings={sailings} onSuccess={loadSailings} />
        </div>
      )}
    </div>
  );
}

export default DashboardOperador;

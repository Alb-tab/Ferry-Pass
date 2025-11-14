import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import DashboardOperador from './pages/DashboardOperador';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="app">
      {!token ? (
        <LoginPage onLogin={setToken} />
      ) : (
        <>
          <header className="app-header">
            <h1>🚢 FerryPass</h1>
            <button onClick={handleLogout} className="logout-btn">Sair</button>
          </header>
          <main>
            <DashboardOperador token={token} />
          </main>
        </>
      )}
    </div>
  );
}

export default App;

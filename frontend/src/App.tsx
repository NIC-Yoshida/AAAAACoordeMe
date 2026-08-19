import React, { useState } from 'react';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (username.trim().toUpperCase() === 'ADMIN') {
      setLoggedIn(true);
      setError('');
    } else {
      setError('ユーザー名が正しくありません');
    }
  };

  if (loggedIn) {
    return (
      <div className="App">
        <div className="welcome-screen">
          <h1>CoordeMe</h1>
          <p>ようこそ、ADMIN さん</p>
          <button className="logout-btn" onClick={() => { setLoggedIn(false); setUsername(''); }}>
            ログアウト
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="login-container">
        <h1 className="login-title">CoordeMe</h1>
        <div className="login-box">
          <h2>ログイン</h2>
          <input
            type="text"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="login-input"
          />
          {error && <p className="login-error">{error}</p>}
          <button className="login-btn" onClick={handleLogin}>
            ログイン
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

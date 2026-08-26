import React, { useState } from 'react';
import './App.css';

interface User {
  userId: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

function App() {
  const [username, setUsername] = useState('');
  const [user, setUser] = useState<User | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setError('ユーザー名を入力してください');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 大文字・小文字変換を行わず、入力されたIDそのままで完全一致認証APIを呼び出す
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: jsonBody({ username: trimmed }),
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        setUser(data.user);
        setLoggedIn(true);
        setError('');
      } else {
        setError(data.message || 'ユーザー名が正しくありません');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('サーバーへの接続に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUser(null);
    setUsername('');
    setError('');
  };

  if (loggedIn) {
    return (
      <div className="App">
        <div className="welcome-screen">
          <h1>CoordeMe</h1>
          <p>ようこそ、<strong>{user?.userId}</strong> さん</p>
          <button className="logout-btn" onClick={handleLogout}>
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
            onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleLogin()}
            className="login-input"
            disabled={isLoading}
          />
          {error && <p className="login-error">{error}</p>}
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? '照合中...' : 'ログイン'}
          </button>
        </div>
      </div>
    </div>
  );
}

function jsonBody(obj: any): string {
  return JSON.stringify(obj);
}

export default App;

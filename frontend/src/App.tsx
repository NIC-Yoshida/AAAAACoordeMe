import React, { useState } from 'react';
import './App.css';
import mascotIconImg from './assets/mascot-icon.png';
import navClosetImg from './assets/nav-closet.png';

// --- 位置情報コンポーネント ---
function LocationInfo() {
  // ダミーデータ（実装時は実際の位置情報から取得）
  const location = {
    city: '東京',
    district: '渋谷',
  };

  return (
    <div className="location-info">
      <span className="location-icon">📍</span>
      <span className="location-name">{location.city}・{location.district}</span>
    </div>
  );
}

// --- 気象情報コンポーネント ---
function WeatherInfo() {
  // ダミーデータ（実装時は実際の気象情報から取得）
  const weather = {
    condition: '晴',
    temperature: 26,
    humidity: 65,
    windSpeed: 3,
  };

  return (
    <div className="weather-info">
      <div className="weather-main">
        <span className="weather-icon">☀️</span>
        <span className="weather-temp">{weather.temperature}°</span>
      </div>
      <div className="weather-detail">
        <span className="weather-condition">{weather.condition}</span>
        <span className="weather-humidity">湿度 {weather.humidity}%</span>
      </div>
    </div>
  );
}

// --- マスコットアイコン（正円背景） ---
function MascotIcon() {
  return (
    <div className="mascot-wrapper">
      <img src={mascotIconImg} alt="マスコット" className="mascot-img" />
    </div>
  );
}

// --- ステータスバーコンポーネント ---
// --- HOMEアイコン（家型SVG） ---
function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 10.5L12 3L21 10.5V21H15V15H9V21H3V10.5Z" stroke="#5c4f42" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// --- クローゼットアイコン（画像） ---
function HangerIcon() {
  return (
    <img src={navClosetImg} alt="クローゼット" className="nav-closet-img" />
  );
}

// --- メニューアイコン（三本線SVG） ---
function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="3" y1="6"  x2="21" y2="6"  stroke="#5c4f42" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="#5c4f42" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3" y1="18" x2="21" y2="18" stroke="#5c4f42" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// --- ホーム画面 ---
function HomeScreen({ onChatReset }: { onChatReset: () => void }) {
  const scenes = ['仕事', '旅行', 'デート', 'アウトドア', '買い物', 'カジュアル', 'フォーマル', 'スポーツ'];
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('home');

  const handleReset = () => {
    setSelectedScene(null);
    onChatReset();
  };

  return (
    <div className="phone-frame">
      {/* 上部：ステータスバー対応ヘッダー */}
      <div className="home-header">
        <div className="header-info">
          <LocationInfo />
          <WeatherInfo />
        </div>
        <button className="reset-btn" onClick={handleReset}>最初から</button>
      </div>

      {/* メインコンテンツ */}
      <div className="home-content">
        {/* アシスタント */}
        <div className="assistant-row">
          <MascotIcon />
          <div className="chat-bubble">
            こんにちは！<br />今日はどんな予定ですか？
          </div>
        </div>

        {/* シーン選択 */}
        <div className="scene-scroll-wrapper">
          <div className="scene-tags">
            {scenes.map((scene) => (
              <button
                key={scene}
                className={`scene-tag${selectedScene === scene ? ' selected' : ''}`}
                onClick={() => setSelectedScene(scene)}
              >
                {scene}
              </button>
            ))}
          </div>
        </div>

        {/* 選択後のメッセージ */}
        {selectedScene && (
          <div className="selected-message">
            「{selectedScene}」のコーデを提案しますね！
          </div>
        )}
      </div>

      {/* ボトムナビ */}
      <div className={`bottom-nav nav-${activeNav}`}>
        <button 
          className={`nav-item${activeNav === 'home' ? ' active' : ''}`}
          onClick={() => setActiveNav('home')}
        >
          <div className="nav-icon-wrapper">
            <HomeIcon />
          </div>
          <span className="nav-label">HOME</span>
        </button>
        <button 
          className={`nav-item${activeNav === 'closet' ? ' active' : ''}`}
          onClick={() => setActiveNav('closet')}
        >
          <div className="nav-icon-wrapper">
            <HangerIcon />
          </div>
          <span className="nav-label">クローゼット</span>
        </button>
        <button 
          className={`nav-item${activeNav === 'menu' ? ' active' : ''}`}
          onClick={() => setActiveNav('menu')}
        >
          <div className="nav-icon-wrapper">
            <MenuIcon />
          </div>
          <span className="nav-label">メニュー</span>
        </button>
      </div>
    </div>
  );
}

// --- ログイン画面 ---
function App() {
  const [username, setUsername] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [chatKey, setChatKey] = useState(0);

  const handleLogin = () => {
    if (username.trim().toUpperCase() === 'ADMIN') {
      setLoggedIn(true);
      setError('');
    } else {
      setError('ユーザー名が正しくありません');
    }
  };

  // 「最初から」= チャットのみリセット（ログアウトしない）
  const handleChatReset = () => {
    setChatKey(k => k + 1);
  };

  if (loggedIn) {
    return (
      <div className="app-bg">
        <HomeScreen key={chatKey} onChatReset={handleChatReset} />
      </div>
    );
  }

  return (
    <div className="app-bg">
      <div className="phone-frame login-frame">
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

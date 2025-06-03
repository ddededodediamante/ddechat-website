import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect } from 'react';

import Toolbar from './components/Toolbar';

import Login from './pages/login';
import Sign from './pages/sign';
import Friends from './pages/friends.js';
import Alerts from './pages/alerts.js';
import Userpage from './pages/userpage.js';
import Settings from './pages/settings.js';
import Posts from './pages/posts.js';
import Postpage from './pages/postpage.js';
import Directmessage from './pages/directmessage.js';

import './static/css/Styles.css';

export default function App() {
  useEffect(() => {
    const setStyle = (property, value) => document.documentElement.style.setProperty(property, value);

    let styleSettings = {
      background: '#111',
      midground: '#333',
      foreground: '#555',
      light: '#777',
      font: '#fff'
    };

    let layoutSettings = {
      showUserTag: true,
      showToolbarLogo: true,
    };

    try {
      let myStyleSettings = localStorage.getItem('themeSettings');
      let myLayoutSettings = localStorage.getItem("layoutSettings");

      if (myStyleSettings === null || myStyleSettings === 'null') {
        localStorage.setItem('themeSettings', JSON.stringify(styleSettings));
      } else {
        styleSettings = JSON.parse(myStyleSettings);
      }

      if (myLayoutSettings === null || myLayoutSettings === 'null') {
        localStorage.setItem("layoutSettings", JSON.stringify(layoutSettings));
      } else {
        layoutSettings = JSON.parse(myLayoutSettings);
      }
    } catch (_) { }

    setStyle('--background', styleSettings?.background ?? '#111');
    setStyle('--midground', styleSettings?.midground ?? '#333');
    setStyle('--foreground', styleSettings?.foreground ?? '#555');
    setStyle('--light', styleSettings?.light ?? '#777');
    setStyle('--font', styleSettings?.font ?? '#fff');

    window.theme = styleSettings;
    window.layout = layoutSettings;
  }, []);

  return (
    <>
      <Toolbar />
      <Routes>
        <Route path="/" element={<Navigate to="/friends" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/user" element={<Userpage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/post" element={<Postpage />} />
        <Route path="/directmessage" element={<Directmessage />} />
      </Routes>
    </>
  );
}

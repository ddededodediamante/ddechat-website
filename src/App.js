import { Navigate, Route, Routes } from 'react-router-dom';

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

import './static/css/Panel.css';
import './static/css/Index.css';
import './static/css/Login.css';
import './static/css/Toolbar.css';
import './static/css/Swal2.css';

export default function App() {
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

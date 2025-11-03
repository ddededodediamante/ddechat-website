import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect } from "react";

import Toolbar from "./components/Toolbar.jsx";

import Login from "./pages/login.jsx";
import Sign from "./pages/sign.jsx";
import Friends from "./pages/friends.jsx";
import Alerts from "./pages/alerts.jsx";
import Userpage from "./pages/userpage.jsx";
import Settings from "./pages/settings.jsx";
import Posts from "./pages/posts.jsx";
import Postpage from "./pages/postpage.jsx";
import Directmessage from "./pages/directmessage.jsx";
import TOS from "./pages/tos.jsx";
import Modpanel from "./pages/modpanel.jsx";

import "./static/css/Styles.css";
import config from "./config.js";
import cache from "./cache.ts";
import Auth from "./pages/auth.jsx";

export default function App() {
  useEffect(() => {
    const setStyle = (property, value) =>
      document.documentElement.style.setProperty(property, value);

    let styleSettings = {
      background: "#111",
      midground: "#333",
      foreground: "#555",
      light: "#777",
      font: "#fff",
    };

    let layoutSettings = {
      showUserTag: true,
      showToolbarLogo: true,
    };

    try {
      let myStyleSettings = localStorage.getItem("themeSettings");
      let myLayoutSettings = localStorage.getItem("layoutSettings");

      if (myStyleSettings === null || myStyleSettings === "null") {
        localStorage.setItem("themeSettings", JSON.stringify(styleSettings));
      } else {
        styleSettings = JSON.parse(myStyleSettings);
      }

      if (myLayoutSettings === null || myLayoutSettings === "null") {
        localStorage.setItem("layoutSettings", JSON.stringify(layoutSettings));
      } else {
        layoutSettings = JSON.parse(myLayoutSettings);
      }
    } catch (_) {}

    setStyle("--background", styleSettings?.background ?? "#111");
    setStyle("--midground", styleSettings?.midground ?? "#333");
    setStyle("--foreground", styleSettings?.foreground ?? "#555");
    setStyle("--light", styleSettings?.light ?? "#777");
    setStyle("--font", styleSettings?.font ?? "#fff");

    window.theme = styleSettings;
    window.layout = layoutSettings;

    const token = localStorage.getItem("accountToken");
    if (!token) return;

    cache.usersOnline = [];

    const ws = new WebSocket(
      config.apiUrl.replace(/^http/, "ws") + "/users/presence"
    );
    let heartbeatInterval;

    ws.onopen = () => {
      console.log("Connected to DMs websocket");

      ws.send(JSON.stringify({ type: "presence:join", token }));

      heartbeatInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "presence:heartbeat" }));
        }
      }, 10000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "presence:update") {
        cache.usersOnline = data.online;
      }
    };

    ws.onclose = () => {
      clearInterval(heartbeatInterval);
    };

    return () => {
      clearInterval(heartbeatInterval);
      if (ws) ws?.close();
    };
  }, []);
  return (
    <>
      <Toolbar />
      <Routes>
        <Route path="/" element={<Navigate to="/posts" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sign" element={<Sign />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/user" element={<Userpage />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/post" element={<Postpage />} />
        <Route path="/directmessage" element={<Directmessage />} />
        <Route path="/tos" element={<TOS />} />
        <Route path="/modpanel" element={<Modpanel />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </>
  );
}
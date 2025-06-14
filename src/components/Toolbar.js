import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from "../config.js";
import axios from "axios";
import cache from "../cache.ts";

export default function Toolbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(false);

  let loginLabel = <a href="/login">Login to ddeChat</a>;

  useEffect(() => {
    const token = localStorage.getItem("accountToken") ?? "";
    if (!token || token === "") return setUser("error");

    if (!cache["user"])
      axios
        .get(`${config.apiUrl}/users/me`, {
          headers: {
            Authorization: token,
          },
        })
        .then((data) => {
          cache["user"] = data.data;
          setUser(data.data);
        })
        .catch((error) => {
          console.error(error);
          setUser("error");
        });
    else setUser(cache["user"]);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleResize = (e) => setSmallScreen(e.matches);

    handleResize(mediaQuery);
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const toggleMenu = () => setMenuOpen((open) => !open);

  if (smallScreen) {
    return (
      <nav className="toolbar">
        <div className="toolbar-container">
          <button className="hamburger-btn" onClick={toggleMenu}>
            <i className={`fa-solid ${menuOpen ? "fa-times" : "fa-bars"}`} />
          </button>

          <div className={`toolbar-links ${menuOpen ? "open" : ""}`}>
            <Link to="/posts" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-comments" />
              Posts
            </Link>
            <Link to="/friends" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-users" />
              Friends
            </Link>
            <Link to="/alerts" onClick={() => setMenuOpen(false)}>
              <i
                className={
                  (user?.alerts ?? []).some((i) => i.read === false)
                    ? "fa-solid fa-bell alertNewDot"
                    : "fa-solid fa-bell"
                }
              />
              Alerts
            </Link>
            <Link to="/settings" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-gear" />
              Settings
            </Link>
            <Link to="/tos" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-scroll" />
              Terms
            </Link>
          </div>
        </div>

        <div className="localusertag">
          {user &&
            window?.layout?.showUserTag !== false &&
            (user !== "error" ? (
              <>
                <img
                  alt=""
                  src={`${config.apiUrl}/users/${user.id}/avatar`}
                  loading="lazy"
                />
                <p>{user?.username ?? loginLabel}</p>
              </>
            ) : (
              loginLabel
            ))}
        </div>
      </nav>
    );
  } else {
    return (
      <nav className="toolbar">
        <div className="toolbar-container">
          {window?.layout?.showToolbarLogo !== false && (
            <Link to="/" className="toolbar-logo">
              <img src="/files/logo.png" alt="ddeChat Icon" loading="lazy" />
            </Link>
          )}

          <div className="toolbar-links">
            <Link to="/posts">
              <i className="fa-solid fa-comments" />
              Posts
            </Link>
            <Link to="/friends">
              <i className="fa-solid fa-users" />
              Friends
            </Link>
            <Link to="/alerts">
              <i
                className={
                  (user?.alerts ?? []).some((i) => i.read === false)
                    ? "fa-solid fa-bell alertNewDot"
                    : "fa-solid fa-bell"
                }
              />
              Alerts
            </Link>
            <Link to="/settings">
              <i className="fa-solid fa-gear" />
              Settings
            </Link>
            <Link to="/tos">
              <i className="fa-solid fa-scroll" />
              Terms
            </Link>
          </div>
        </div>

        <div className="localusertag">
          {user &&
            window?.layout?.showUserTag !== false &&
            (user !== "error" ? (
              <Link to={user?.id ? `/user?id=${user?.id}` : "/login"}>
                <img
                  alt=""
                  src={`${config.apiUrl}/users/${user.id}/avatar`}
                  loading="lazy"
                />
                <p>{user?.username ?? loginLabel}</p>
              </Link>
            ) : (
              loginLabel
            ))}
        </div>
      </nav>
    );
  }
}

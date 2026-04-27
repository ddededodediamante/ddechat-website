import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import config from "../config.js";
import { getUserCached, connectLiveSocket, onLiveNotification } from "../cache.ts";
import Loading from "./Loading.jsx";

export default function Toolbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [smallScreen, setSmallScreen] = useState(false);
  const [tick, setTick] = useState(0);

  let loginLabel = (
    <p>
      <a href="/login">Login to ddeChat</a>
    </p>
  );

  useEffect(() => {
    getUserCached()
      .then(user => setUser(user))
      .catch(error => {
        setUser("error");
        if (error.message !== "Missing token") {
          console.error(error);
        }
      });
  }, []);

  useEffect(() => {
    connectLiveSocket();
    const unsubDM = onLiveNotification("live:dmReceived", () => setTick(t => t + 1));
    const unsubAlert = onLiveNotification("live:alert", () => setTick(t => t + 1));
    return () => {
      unsubDM();
      unsubAlert();
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleResize = e => setSmallScreen(e.matches);

    handleResize(mediaQuery);
    mediaQuery.addEventListener("change", handleResize);

    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  if (smallScreen) {
    return (
      <nav className="toolbar">
        <div className="toolbar-container">
          <button className="hamburger-btn" onClick={() => setMenuOpen(open => !open)}>
            <i className={`fa-solid ${menuOpen ? "fa-times" : "fa-bars"}`} />
          </button>

          <div className={`toolbar-links ${menuOpen ? "open" : ""}`}>
            <Link to="/posts" onClick={() => setMenuOpen(false)}>
              <i className="fa-solid fa-comments" />
              Posts
            </Link>
            <Link to="/friends" onClick={() => setMenuOpen(false)}>
              <i
                className={`fa-solid fa-users ${(user?.unreadDMFrom?.length ?? 0) > 0 ? "alertNewDot" : ""}`}
              />
              Friends
            </Link>
            <Link to="/alerts" onClick={() => setMenuOpen(false)}>
              <i
                className={`fa-solid fa-users ${(user?.alerts ?? []).some(i => i.read === false) ? "alertNewDot" : ""}`}
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
            {user && user?.isModerator === true && (
              <Link to="/modpanel" onClick={() => setMenuOpen(false)}>
                <i className="fa-solid fa-wrench" />
                Mod Panel
              </Link>
            )}
          </div>
        </div>

        <div className="localusertag">
          {user !== null ? (
            window?.layout?.showUserTag !== false &&
            (user !== "error" ? (
              <>
                <img
                  alt=""
                  src={`${config.apiUrl}/users/user/${user.id}/avatar`}
                  loading="lazy"
                />
                {user?.username ? (
                  <p
                    onClick={() => {
                      navigate(`/user?id=${user?.id}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {user.username}
                  </p>
                ) : (
                  loginLabel
                )}
              </>
            ) : (
              loginLabel
            ))
          ) : (
            <Loading />
          )}
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
              <i
                className={`fa-solid fa-users ${(user?.unreadDMFrom?.length ?? 0) > 0 ? "alertNewDot" : ""}`}
              />
              Friends
            </Link>
            <Link to="/alerts">
              <i
                className={`fa-solid fa-users ${(user?.alerts ?? []).some(i => i.read === false) ? "alertNewDot" : ""}`}
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
            {user && user.isModerator === true && (
              <Link to="/modpanel">
                <i className="fa-solid fa-wrench" />
                Mod Panel
              </Link>
            )}
          </div>
        </div>

        <div className="localusertag">
          {user !== null ? (
            window?.layout?.showUserTag !== false &&
            (user !== "error" ? (
              <>
                <img
                  alt=""
                  src={`${config.apiUrl}/users/user/${user.id}/avatar`}
                  loading="lazy"
                />
                {user?.username ? (
                  <p
                    onClick={() => {
                      navigate(`/user?id=${user?.id}`);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {user.username}
                  </p>
                ) : (
                  loginLabel
                )}
              </>
            ) : (
              loginLabel
            ))
          ) : (
            <Loading size="1.3rem" />
          )}
        </div>
      </nav>
    );
  }
}

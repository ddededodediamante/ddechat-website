import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import config from "../config.js";
import axios from "axios";
import cache from "../cache.ts";

export default function Toolbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accountToken") ?? "";
    if (!token || token === "") return;

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

  return (
    <nav className="toolbar">
      <div className="toolbar-container">
        {window?.layout?.showToolbarLogo !== false && (
          <Link to="/" className="toolbar-logo">
            <img src="/files/logo.png" alt="ddeChat Icon"></img>
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
        </div>
      </div>

      <div className="LocalUserTag">
        {user &&
          window?.layout?.showUserTag !== false &&
          (user !== "error" ? (
            <>
              <img alt="" src={`${config.apiUrl}/users/${user.id}/avatar`} />
              <p>{user?.username ?? <a href="/login">Login to ddeChat</a>}</p>
            </>
          ) : (
            <a href="/login">Login to ddeChat</a>
          ))}
      </div>
    </nav>
  );
}

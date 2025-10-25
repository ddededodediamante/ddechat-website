import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import Loading from "../components/Loading.jsx";
import cache from "../cache.ts";

export default function Friends() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accountToken");
    if (token)
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
          console.error("Error fetching user data:", error);
          navigate("/login");
        });
    else navigate("/login");
  }, [navigate]);

  function handleUnfriend(friendId) {
    axios
      .delete(`${config.apiUrl}/users/${friendId}/friend`, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
        },
      })
      .then(() => {
        setUser((prevUser) => ({
          ...prevUser,
          friends: prevUser.friends.filter((f) => f.id !== friendId),
        }));
      })
      .catch((error) => {
        console.error("Error unfriending user:", error);
      });
  }

  return (
    <>
      <div className="panel-content">
        <p className="title">
          <i className="fa-solid fa-users" />
          Friends
        </p>
        <div className="line" />
        {user ? (
          user.friends && user.friends.length > 0 ? (
            user.friends.map((f) => (
              <div className="posts-post" key={f.id}>
                {f.id && (
                  <Link to={`/user?id=${f.id}`}>
                    <img alt="" src={`${config.apiUrl}/users/${f.id}/avatar`} />
                  </Link>
                )}
                <div className="vertical">
                  <p>{f.username}</p>
                  <p className="grey">
                    Friends since {moment(f.addedOn).fromNow()}
                  </p>
                </div>
                <div className="buttons">
                  <button
                    onClick={() => {
                      navigate(`/directmessage?id=${f.id}`);
                    }}
                  >
                    Message
                  </button>
                  <button
                    className="danger"
                    onClick={() => handleUnfriend(f.id)}
                  >
                    Unfriend
                  </button>
                </div>
              </div>
            ))
          ) : (
            "You have no friends yet, try adding some!"
          )
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

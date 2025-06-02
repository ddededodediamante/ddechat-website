import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.json";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";
import Loading from "../components/Loading";

export default function Friends() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accountToken");
    if (token) {
      axios
        .get(`${config.apiUrl}/users/me`, {
          headers: {
            Authorization: token,
          },
        })
        .then((data) => {
          setUser(data.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

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
              <div className="posts-post">
                {f.id && (
                  <Link to={`/user?id=${f.id}`}>
                    <img alt="" src={`${config.apiUrl}/users/${f.id}/avatar`} />
                  </Link>
                )}
                <div className="vertical">
                  <p>{f.username}</p>
                  <p className="grey">Friends since {moment(f.addedOn).fromNow()}</p>
                </div>
                <div className="buttons">
                  <button
                    onClick={() => {
                      navigate(`/directmessage?id=${f.id}`);
                    }}
                  >
                    Message
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

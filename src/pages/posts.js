import axios from "axios";
import Post from "../components/Post";
import { useEffect, useState } from "react";
import config from "../config.json";
import Loading from "../components/Loading";

export default function Posts() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [postContent, setPostContent] = useState();
  const [showFriends, setShowFriends] = useState(true);

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
        });
    }

    axios
      .get(`${config.apiUrl}/posts/latest`, {
        headers: {
          Authorization: token,
        },
      })
      .then((data) => {
        setPosts(data.data);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, []);

  function sendPost() {
    document.querySelector("div.horizontal textarea#postText").value = "";

    axios
      .post(
        config.apiUrl + "/posts",
        {
          content: String(postContent).trim(),
        },
        {
          headers: {
            Authorization: localStorage.getItem("accountToken"),
          },
        }
      )
      .then((data) => setPosts([data.data, ...posts.latest]));
  }

  function toggleShowFriends() {
    setShowFriends(!showFriends);
  }

  return (
    <div className="panel-content">
      {user && (
        <div
          className="horizontal"
          style={{
            width: "100%",
            gap: "10px",
            height: "fit-content",
            alignItems: "center",
          }}
        >
          <img
            alt=""
            src={`${config.apiUrl}/users/user/${user.username}/avatar`}
            width={60}
            height={60}
            style={{ borderRadius: "25%" }}
          />
          <textarea
            placeholder={
              user.username ? "What's new, " + user.username + "?" : "What's new?"
            }
            maxLength={2000}
            disabled={user.id === null}
            onInput={(e) => setPostContent(e.target.value)}
            id="postText"
          />
          <button onClick={sendPost}>Post</button>
        </div>
      )}
      <div className="line" />
      {posts && posts?.latest ? (
        posts?.latest?.length > 0 ? (
          <>
            <div className="collapse">
              <p className="title smaller">
                {showFriends ? (
                  <i className="fa-solid fa-expand" onClick={toggleShowFriends} />
                ) : (
                  <i className="fa-solid fa-compress" onClick={toggleShowFriends} />
                )}
                By your friends
              </p>

              <div id="YFPCP">
                {showFriends &&
                  (posts?.personalized?.length > 0 ? (
                    posts.personalized.map((p) => <Post data={p} />)
                  ) : (
                    <p>Recent posts made by your friends will appear here.</p>
                  ))}
              </div>
            </div>
            {posts.latest.map((p) => (
              <Post data={p} />
            ))}
          </>
        ) : (
          <p>Nobody's said a word yet. Quiet bunch.</p>
        )
      ) : (
        <Loading />
      )}
    </div>
  );
}

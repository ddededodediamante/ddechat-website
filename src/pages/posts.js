import axios from "axios";
import Post from "../components/Post";
import { useEffect, useState } from "react";
import config from "../config.json";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";

export default function Posts() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState({});
  const [postContent, setPostContent] = useState();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

    if (!sessionStorage.getItem("latestPosts")) {
      axios
        .get(`${config.apiUrl}/posts/latest`, {
          headers: {
            Authorization: token,
          },
        })
        .then((data) => {
          setLoading(false);
          setPosts(data.data);
          sessionStorage.setItem("latestPosts", JSON.stringify(data.data));
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      setLoading(false);
      setPosts(JSON.parse(sessionStorage.getItem("latestPosts")));
    }
  }, []);

  function sendPost() {
    let textarea = document.getElementById("postText");
    textarea.disabled = true;
    textarea.ariaDisabled = true;

    let postbutton = document.getElementById('postButton');
    postbutton.disabled = true;
    postbutton.ariaDisabled = true;

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
      .then((data) => {
        navigate(`/post?id=${data.data.id}`, { replace: true });
      });
  }

  return (
    <>
      <div className="panel-content">
        {loading
          ? <Loading />
          : <>
            {user?.id
              ? <div
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
                  src={`${config.apiUrl}/users/${user.id}/avatar`}
                  width={60}
                  height={60}
                  style={{ borderRadius: "25%" }}
                />
                <textarea
                  placeholder={
                    user.username ? "What's new, " + user.username + "?" : "What's new?"
                  }
                  maxLength={2000}
                  disabled={user?.id === null}
                  onInput={(e) => setPostContent(e.target.value.trim())}
                  id="postText"
                />
                <button id="postButton" onClick={sendPost}>Post</button>
              </div>
              : <p>Login to send posts!</p>
            }

            <div className="line" />

            {posts?.length > 0 ? posts.map(p => <Post data={p} />) : <p>Nobody's said a word yet. Quiet bunch.</p>}
          </>
        }
      </div>
    </>);
}

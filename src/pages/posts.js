import axios from "axios";
import Post from "../components/Post";
import { useEffect, useState } from "react";
import config from "../config.js";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import cache, { savePost } from "../cache.ts";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt({ breaks: true, linkify: true });

export default function Posts() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState({});
  const [postContent, setPostContent] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accountToken");

    if (!cache["user"]) {
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
          });
    } else {
      setUser(cache["user"]);
    }

    if (!cache["latestPosts"]) {
      axios
        .get(`${config.apiUrl}/posts/latest`, {
          headers: {
            Authorization: token,
          },
        })
        .then((data) => {
          setLoading(false);
          setPosts(data.data);
          cache["latestPosts"] = data.data;
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    } else {
      setLoading(false);
      setPosts(cache["latestPosts"]);
    }
  }, []);

  function sendPost() {
    setPostContent('');

    let postbutton = document.getElementById("postButton");
    postbutton.disabled = true;
    postbutton.onclick = () => {};

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
        if (!cache.latestPosts) cache.latestPosts = [];
        cache.latestPosts.unshift(data.data);
        savePost(data.data.id, data.data);

        navigate(`/post?id=${data.data.id}`);
      });
  }

  return (
    <>
      <div className="panel-content">
        {loading ? (
          <Loading />
        ) : (
          <>
            {user?.id ? (
              <div
                style={{
                  width: "100%",
                  gap: "10px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{ display: "flex", gap: "4px", marginBottom: "8px" }}
                >
                  {["edit", "preview"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background:
                          activeTab === tab
                            ? "var(--foreground)"
                            : "var(--midground)",
                      }}
                    >
                      {tab === "edit" ? "Edit" : "Preview"}
                    </button>
                  ))}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <img
                    alt=""
                    src={`${config.apiUrl}/users/${user.id}/avatar`}
                    width={60}
                    height={60}
                    style={{ borderRadius: "25%" }}
                  />

                  {activeTab === "edit" ? (
                    <textarea
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      disabled={!user?.id}
                      placeholder={
                        user.username
                          ? `What's new, ${user.username}?`
                          : "What's new?"
                      }
                      style={{
                        padding: "8px",
                        borderRadius: "8px",
                        minHeight: "60px",
                        width: "100%",
                        resize: "vertical",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        color: "var(--font)",
                        border: "1px solid #ccc",
                        padding: "8px",
                        borderRadius: "8px",
                        minHeight: "120px",
                        width: "100%",
                        overflowY: "auto",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: md.render(postContent),
                      }}
                    />
                  )}

                  <button
                    onClick={() => sendPost(postContent)}
                    disabled={!postContent.trim()}
                    id="postButton"
                  >
                    Post
                  </button>
                </div>
              </div>
            ) : (
              <p>Login to send posts!</p>
            )}

            <div className="line" />

            {posts?.length > 0 ? (
              posts.map((post, index) => (
                <>
                  <Post data={post} />
                  {index !== posts.length - 1 && <div className="line" />}
                </>
              ))
            ) : (
              <p>Nobody's said a word yet. Quiet bunch.</p>
            )}
          </>
        )}
      </div>
    </>
  );
}

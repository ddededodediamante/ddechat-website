import axios from "axios";
import Post from "../components/Post";
import { useEffect, useState } from "react";
import config from "../config.js";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import cache, { savePost } from "../cache.ts";
import markdown from "../functions/Markdown.js";
import EmojiPanel from "../components/Emojipanel.js";

export default function Posts() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState({});
  const [postContent, setPostContent] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [loading, setLoading] = useState(true);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [isPosting, setPosting] = useState(false);
  const [filter, setFilter] = useState("roots");

  function fetchPosts(filter = "all") {
    setLoading(true);

    const token = localStorage.getItem("accountToken");

    let query = "";

    if (filter === "replies") query = "?isReply=true";
    else if (filter === "roots") query = "?isReply=false";
    else if (filter === "hasReplies") query = "?hasReplies=true";
    else if (filter === "noReplies") query = "?hasReplies=false";

    axios
      .get(`${config.apiUrl}/posts/latest${query}`, {
        headers: {
          Authorization: token,
        },
      })
      .then((data) => {
        setLoading(false);
        setPosts(data.data);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }

  useEffect(() => {
    const token = localStorage.getItem("accountToken");

    if (!cache["user"]) {
      if (token) {
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
      }
    } else setUser(cache["user"]);

    fetchPosts(filter);
  }, [filter]);

  function sendPost() {
    setPostContent("");
    setPosting(true);

    axios
      .post(
        config.apiUrl + "/posts",
        {
          content: postContent.trim(),
        },
        {
          headers: {
            Authorization: localStorage.getItem("accountToken"),
          },
        }
      )
      .then((data) => {
        savePost(data.data.id, data.data);
        navigate(`/post?id=${data.data.id}`);
      })
      .finally(() => setPosting(false));
  }

  function toggleEmojiPanel() {
    setShowEmojiPanel((prev) => !prev);
  }

  return (
    <>
      <div className="panel-content">
        {user?.id ? (
          <div
            style={{
              width: "100%",
              gap: "10px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ display: "flex", gap: "5px" }}>
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
              <button
                key="emojis"
                onClick={toggleEmojiPanel}
                style={{
                  background: showEmojiPanel
                    ? "var(--foreground)"
                    : "var(--midground)",
                }}
              >
                Emojis
              </button>
            </div>

            {showEmojiPanel && <EmojiPanel close={toggleEmojiPanel} />}

            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
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
                    height: "fit-content",
                    width: "100%",
                    resize: "vertical",
                  }}
                />
              ) : (
                <div
                  style={{
                    color: "var(--font)",
                    backgroundColor: "var(--midground)",
                    padding: "8px",
                    borderRadius: "8px",
                    minHeight: "60px",
                    width: "100%",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: markdown.render(postContent),
                  }}
                />
              )}

              <button
                onClick={() => sendPost(postContent)}
                disabled={isPosting || !postContent.trim()}
                id="postButton"
              >
                {isPosting ? <Loading size="15px" /> : "Post"}
              </button>
            </div>
          </div>
        ) : (
          <p>Login to send posts.</p>
        )}

        <div className="line" />

        {loading ? (
          <Loading />
        ) : posts?.length > 0 ? (
          <>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{ padding: "6px", borderRadius: "6px" }}
            >
              <option value="all">All Posts</option>
              <option value="roots">Only Root Posts</option>
              <option value="replies">Only Replies</option>
              <option value="hasReplies">With Replies</option>
              <option value="noReplies">Without Replies</option>
            </select>

            {posts.map((post, index) => (
              <>
                <Post data={post} showParentPost={true} />
                {index !== posts.length - 1 && <div className="line" />}
              </>
            ))}
          </>
        ) : (
          <p>Nobody's said a word yet. Quiet bunch.</p>
        )}
      </div>
    </>
  );
}

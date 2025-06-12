import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import Post from "../components/Post";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import cache, { savePost, getPost } from "../cache.ts";
import markdown from "../functions/Markdown.js";
import EmojiPanel from "../components/Emojipanel.js";

export default function Postpage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [parentPost, setParentPost] = useState(null);
  const [parentPostLoading, setParentPostLoading] = useState(false);
  const [user, setUser] = useState(undefined);
  const [activeTab, setActiveTab] = useState("edit");
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setReplying] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accountToken");
    if (!token) {
      setUser(null);
      return;
    }

    if (!cache["user"]) {
      axios
        .get(`${config.apiUrl}/users/me`, {
          headers: { Authorization: token },
        })
        .then((res) => {
          setUser(res.data);
          cache["user"] = res.data;
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setUser(null);
        });
    } else {
      setUser(cache["user"]);
    }
  }, []);

  useEffect(() => {
    if (!id || user === undefined) return;

    setPost(null);
    setParentPost(null);
    setParentPostLoading(false);

    const fetchParent = (parentId) => {
      setParentPostLoading(true);

      if (!getPost(parentId)) {
        axios
          .get(`${config.apiUrl}/posts/${parentId}`)
          .then((parentRes) => {
            savePost(parentId, parentRes.data);
            setParentPost(parentRes.data);
          })
          .catch((error) => {
            console.error("Error fetching parent post:", error);
            setParentPost(null);
          })
          .finally(() => {
            setParentPostLoading(false);
          });
      } else {
        setParentPost(getPost(parentId));
        setParentPostLoading(false);
      }
    };

    if (!getPost(id)) {
      axios
        .get(`${config.apiUrl}/posts/${id}`)
        .then((res) => {
          savePost(id, res.data);
          setPost(res.data);
          if (user) {
            setLiked(res.data.likes.includes(user.id));
          }
          if (res.data.replyingToId) {
            fetchParent(res.data.replyingToId);
          } else {
            setParentPost(null);
          }
        })
        .catch((error) => {
          console.error("Error fetching post data:", error);
          setPost(null);
          setParentPost(null);
        });
    } else {
      const cached = getPost(id);
      setPost(cached);
      if (user) {
        setLiked(cached.likes.includes(user.id));
      }
      if (cached.replyingToId) {
        fetchParent(cached.replyingToId);
      } else {
        setParentPost(null);
      }
    }
  }, [id, user]);

  function toggleLike(e) {
    if (e.target.disabled) return;
    const token = localStorage.getItem("accountToken");
    if (token) {
      axios
        .patch(
          `${config.apiUrl}/posts/${id}/like`,
          {},
          { headers: { Authorization: token } }
        )
        .then((res) => {
          setPost(res.data);
          setLiked(res.data.liked);
          savePost(id, res.data);
        })
        .catch((error) => {
          console.error("Error toggling like:", error);
        });
    }
  }

  function deletePost() {
    if (!user) return;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Confirm",
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`${config.apiUrl}/posts/${id}`, {
            headers: { Authorization: localStorage.getItem("accountToken") },
          })
          .then(() => {
            const posts = cache?.posts;

            if (posts) {
              let _parentPost = getPost(parentPost?.id);
              if (_parentPost && _parentPost.id) {
                delete posts[_parentPost.id];
                if (!_parentPost?.replyingToId) delete cache.latestPosts;
              } else {
                delete cache.latestPosts;
              }

              if (posts[id]) {
                delete posts[id];
              }
            }

            navigate("/posts");
          })
          .catch((error) => {
            console.error("Error deleting post:", error);
          });
      }
    });
  }

  function editPost() {
    if (!user || !(user.isModerator || user.id === post?.author?.id)) return;

    Swal.fire({
      title: "Edit Post",
      input: "textarea",
      inputValue: post.content,
      inputAttributes: {
        "aria-label": "Edit your post content",
      },
      showCancelButton: true,
      confirmButtonText: "Save",
      preConfirm: (newContent) => {
        if (!newContent || newContent.trim().length === 0) {
          Swal.showValidationMessage("Content can't be empty");
          return false;
        }
        if (newContent.length > 2000) {
          Swal.showValidationMessage(
            "Content is too long (max 2000 characters)."
          );
          return false;
        }

        return axios
          .patch(
            `${config.apiUrl}/posts/${id}`,
            { content: newContent },
            { headers: { Authorization: localStorage.getItem("accountToken") } }
          )
          .then((res) => {
            setPost(res.data);
            savePost(id, res.data);
            const index = cache["latestPosts"]?.findIndex((p) => p.id === id);
            if (index !== -1) cache["latestPosts"][index] = res.data;
            Swal.fire("Post Updated", "Your post has been edited", "success");
          })
          .catch((error) => {
            console.error("Error updating post:", error);
            Swal.showValidationMessage("Failed to update post.");
          });
      },
    });
  }

  function sendReply() {
    const postContent = replyContent?.trim();
    if (!postContent) return;

    setReplying(true);

    axios
      .post(
        `${config.apiUrl}/posts`,
        { content: postContent, reply: id },
        { headers: { Authorization: localStorage.getItem("accountToken") } }
      )
      .then((res) => {
        setPost(res.data);
        savePost(id, res.data);

        const index = cache["latestPosts"].findIndex((post) => post.id === id);
        if (index !== -1) cache["latestPosts"][index] = res.data;
      })
      .catch((error) => {
        console.error("Error sending reply:", error);
      })
      .finally(() => setReplying(false));

    setReplyContent("");
  }

  function toggleEmojiPanel() {
    setShowEmojiPanel((prev) => !prev);
  }

  return (
    <>
      <div className="panel-content">
        {post ? (
          post.replyingToId && parentPost === null && parentPostLoading ? (
            <Loading />
          ) : (
            <>
              {parentPost && (
                <div
                  style={{
                    borderLeft: "4px solid var(--light)",
                    paddingLeft: "10px",
                  }}
                >
                  <Post data={parentPost} />
                </div>
              )}

              <Post data={post} />

              <div className="post-page-buttons">
                <button onClick={toggleLike} disabled={!user}>
                  <i
                    style={{ color: liked ? "#ff4545" : "#fff" }}
                    className="fa-solid fa-heart"
                  />
                  {post?.likes?.length ?? 0}
                </button>

                {user && post && user?.id === post?.author?.id && (
                  <button onClick={editPost} disabled={!user}>
                    <i
                      style={{ color: "#ffffff" }}
                      className="fa-solid fa-pen"
                    />
                    Edit
                  </button>
                )}

                {user &&
                  post &&
                  (user?.isModerator || user?.id === post?.author?.id) && (
                    <button onClick={deletePost} disabled={!user}>
                      <i
                        style={{ color: "#ff4545" }}
                        className="fa-solid fa-trash"
                      />
                      Delete
                    </button>
                  )}
              </div>

              <div className="line" />

              <p className="small title">Replies</p>

              {user?.id && (
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

                  {showEmojiPanel && <EmojiPanel />}

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
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
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
                          __html: markdown.render(replyContent),
                        }}
                      />
                    )}

                    <button
                      onClick={sendReply}
                      disabled={isReplying || !replyContent.trim()}
                      id="postButton"
                    >
                      {isReplying ? <Loading size="15px" /> : "Post"}
                    </button>
                  </div>
                </div>
              )}

              {post?.replies && post?.replies.length > 0 ? (
                post.replies.map((reply) => (
                  <Post key={reply.id} data={reply} />
                ))
              ) : (
                <p>Nobody has replied yet.</p>
              )}
            </>
          )
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

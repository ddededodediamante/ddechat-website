import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import { useSearchParams } from "react-router-dom";
import Post from "../components/Post";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import cache from "../cache.ts";

export default function Postpage() {
  const [post, setPost] = useState(null);
  const [parentPost, setParentPost] = useState(null);
  const [parentPostLoading, setParentPostLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accountToken");
    if (token) {
      axios
        .get(`${config.apiUrl}/users/me`, {
          headers: { Authorization: token },
        })
        .then((res) => setUser(res.data))
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  useEffect(() => {
    if (!id || user === null) return;

    setPost(null);
    setParentPost(null);
    setParentPostLoading(false);

    const fetchParent = (parentId) => {
      setParentPostLoading(true);

      if (!cache["posts"]) cache["posts"] = {};
      if (!cache["posts"][parentId]) {
        axios
          .get(`${config.apiUrl}/posts/${parentId}`)
          .then((parentRes) => {
            cache["posts"][parentId] = parentRes.data;
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
        setParentPost(cache["posts"][parentId]);
        setParentPostLoading(false);
      }
    };

    if (!cache["posts"]) cache["posts"] = {};
    if (!cache["posts"][id]) {
      axios
        .get(`${config.apiUrl}/posts/${id}`)
        .then((res) => {
          cache["posts"][id] = res.data;
          setPost(res.data);
          setLiked(res.data.likes.includes(user.id));

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
      const cached = cache["posts"][id];
      setPost(cached);
      setLiked(cached.likes.includes(user.id));

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
            sessionStorage.removeItem("latestPosts");
            window.location.href = "/posts";
          })
          .catch((error) => {
            console.error("Error deleting post:", error);
          });
      }
    });
  }

  function sendReply() {
    if (!replyContent.trim()) return;
    axios
      .post(
        `${config.apiUrl}/posts`,
        { content: replyContent.trim(), reply: id },
        { headers: { Authorization: localStorage.getItem("accountToken") } }
      )
      .then((res) => setPost(res.data))
      .catch((error) => {
        console.error("Error sending reply:", error);
      });
    setReplyContent("");
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

              {user && (
                <div
                  className="horizontal reply-section"
                  style={{
                    width: "100%",
                    gap: "10px",
                    height: "fit-content",
                    alignItems: "center",
                  }}
                >
                  <img
                    alt="User Avatar"
                    src={`${config.apiUrl}/users/${user.id}/avatar`}
                    width={60}
                    height={60}
                    style={{ borderRadius: "25%" }}
                  />
                  <textarea
                    placeholder="Make a reply"
                    maxLength={2000}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    id="postText"
                  />
                  <button onClick={sendReply}>Reply</button>
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

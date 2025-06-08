import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import { useNavigate, useSearchParams } from "react-router-dom";
import Post from "../components/Post";
import Loading from "../components/Loading";
import Swal from "sweetalert2";
import cache, { savePost, getPost } from "../cache.ts";

export default function Postpage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [post, setPost] = useState(null);
  const [parentPost, setParentPost] = useState(null);
  const [parentPostLoading, setParentPostLoading] = useState(false);
  const [user, setUser] = useState(undefined);
  const [replyContent, setReplyContent] = useState("");
  const [liked, setLiked] = useState(false);
  const [isReplying, setReplying] = useState(false);

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
                  <button onClick={sendReply} disabled={!replyContent.trim()}>
                    {isReplying ? <Loading size="15px" /> : "Reply"}
                  </button>
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

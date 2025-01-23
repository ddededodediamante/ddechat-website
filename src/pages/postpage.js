import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.json";
import { Link, useSearchParams } from "react-router-dom";
import Post from "../components/Post";
import Loading from "../components/Loading";

export default function Postpage() {
  const [post, setPost] = useState(null);
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

    if (id) {
      axios
        .get(`${config.apiUrl}/posts/post/${id}`)
        .then((res) => {
          setPost(res.data);
          setLiked(res.data.likes.includes(user?.id));
        })
        .catch((error) => {
          console.error("Error fetching post data:", error);
        });
    }
  }, [id, user?.id]);

  function toggleLike(e) {
    if (e.target.disabled) return;
    const token = localStorage.getItem("accountToken");
    if (token) {
      axios
        .patch(
          `${config.apiUrl}/posts/post/${id}/like`,
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
    <div className="panel-content">
      {post && post.replyingToId && (
        <Link to={`/post?id=${post.replyingToId}`}>
          <p className="smaller title">
            <i className="fa-solid fa-rotate-left" /> Go to original post
          </p>
        </Link>
      )}

      {post ? (
        <>
          <Post data={post} />
          <div className="post-page-buttons">
            <button onClick={toggleLike} disabled={!user}>
              <i
                style={{ color: liked ? "#ff4545" : "#fff" }}
                className="fa-solid fa-heart"
              />
              {post?.likes?.length ?? 0}
            </button>
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
                src={`${config.apiUrl}/users/user/${user.username}/avatar`}
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

          {post.replies && post.replies.length > 0 ? (
            post.replies.map((reply) => <Post key={reply.id} data={reply} />)
          ) : (
            <p>Nobody has replied yet.</p>
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

import axios from "axios";
import Toolbar from "../components/Toolbar";
import { useEffect, useState } from "react";
import config from "../config.json";
import { Link, useSearchParams } from "react-router-dom";
import Post from "../components/Post";

export default function Postpage() {
    const [post, setPost] = useState({});
    const [user, setUser] = useState({});
    const [replyContent, setReplyContent] = useState();
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id").trim();

    const [liked, setLiked] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("accountToken");
        if (token) {
            axios
                .get(`${config.apiUrl}/users/me`, {
                    headers: {
                        Authorization: token,
                    },
                })
                .then(data => {
                    setUser(data.data);
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                });
        }

        if (id && id !== "") {
            axios
                .get(`${config.apiUrl}/posts/post/${id}`)
                .then(data => {
                    setPost(data.data);
                    setLiked(data.data.likes.includes(user.id))
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, [id, user.id]);

    function toggleLike(e) {
        if (e.target.disabled) return;

        const token = localStorage.getItem("accountToken");
        if (token) {
            axios
                .patch(`${config.apiUrl}/posts/post/${id}/like`, {}, {
                    headers: {
                        Authorization: token,
                    },
                })
                .then(data => {
                    setPost(data.data);
                    setLiked(data.data.liked);
                })
                .catch(error => {
                    console.error(error);
                });
        }
    }

    function sendReply() {
        document.querySelector('div.horizontal textarea#postText').value = '';

        axios
            .post(config.apiUrl + '/posts', {
                content: String(replyContent).trim(),
                reply: id
            }, {
                headers: {
                    Authorization: localStorage.getItem("accountToken")
                },
            })
            .then(data => setPost(data.data));
    }

    return (
        <div className="horizontal">
            <Toolbar />
            <div className="panel-content">
                {post?.replyingToId &&
                    <Link to={`/post?id=${post.replyingToId}`}>
                        <p className="smaller title">
                            <i className="fa-solid fa-rotate-left" />
                            Go to original post
                        </p>
                    </Link>
                }

                <Post data={post} />
                <div className="post-page-buttons">
                    <button onClick={toggleLike} disabled={!user}>
                        <i
                            style={{ color: liked ? '#ff4545' : '#fff' }}
                            className="fa-solid fa-heart"
                        />
                        {post?.likes?.length ?? 0}
                    </button>
                </div>

                <div className="line" />

                <p className="small title">Replies</p>
                <div className="horizontal" style={{ width: '100%', gap: '10px', height: 'fit-content', alignItems: 'center' }}>
                    {user.avatar && <img
                        alt=""
                        src={`${config.apiUrl}/users/user/${user.username}/avatar`}
                        width={60}
                        height={60}
                        style={{ borderRadius: '25%' }}
                    />}
                    <textarea
                        placeholder={"Make a reply"}
                        maxLength={2000}
                        disabled={user.id === null}
                        onInput={e => setReplyContent(e.target.value)}
                        id="postText"
                    />
                    <button onClick={sendReply}>Reply</button>
                </div>

                {(post.replies && post.replies.length > 0)
                    ? post.replies.map((p) => <Post data={p} />)
                    : <p>Nobody has replied yet.</p>
                }
            </div>
        </div>
    );
}

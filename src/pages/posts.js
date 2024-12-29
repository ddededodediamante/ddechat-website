import axios from "axios";
import Toolbar from "../components/Toolbar";
import Post from "../components/Post";
import { useEffect, useState } from "react";
import config from "../config.json";

export default function Posts() {
    const [user, setUser] = useState({});
    const [posts, setPosts] = useState([]);
    const [postContent, setPostContent] = useState();

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

        axios
            .get(`${config.apiUrl}/posts/latest`)
            .then(data => {
                setPosts(data.data);
            })
            .catch(error => {
                console.error("Error fetching user data:", error);
            });
    }, []);

    function sendPost() {
        document.querySelector('div.horizontal textarea#postText').value = '';

        axios
            .post(config.apiUrl + '/posts', {
                content: String(postContent).trim()
            }, {
                headers: {
                    Authorization: localStorage.getItem("accountToken")
                },
            })
            .then(data => setPosts([data.data, ...posts]));
    }

    return (
        <div className="horizontal">
            <Toolbar />
            <div className='panel-content'>
                <div className="horizontal" style={{ width: '100%', gap: '10px', height: 'fit-content', alignItems: 'center' }}>
                    {user.avatar && <img
                        alt=""
                        src={`${config.apiUrl}/users/user/${user.username}/avatar`}
                        width={60}
                        height={60}
                        style={{ borderRadius: '25%' }}
                    />}
                    <textarea
                        placeholder={
                            user.username
                                ? "What's new, " + user.username + "?"
                                : "What's new?"
                        }
                        maxLength={2000}
                        disabled={user.id === null}
                        onInput={e => setPostContent(e.target.value)}
                        id="postText"
                    />
                    <button onClick={sendPost}>Post</button>
                </div>
                <div className="line" />
                {posts && posts?.length > 0
                    ? posts.map((p) => <Post data={p} />)
                    : <p>Nobody's said a word yet. Quiet bunch.</p>
                }
            </div>
        </div >
    );
}

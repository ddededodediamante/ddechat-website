import axios from "axios";
import Toolbar from "../components/Toolbar";
import { useEffect, useState } from "react";
import config from "../config.json";
import { Link, useNavigate } from "react-router-dom";
import moment from "moment";

export default function Friends() {
    const navigate = useNavigate();
    const [user, setUser] = useState({});

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
                    navigate('/login');
                });
        } else {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="horizontal">
            <Toolbar />
            <div className='panel-content'>
                <p className="title">
                    <i className="fa-solid fa-users" />
                    Friends
                </p>
                <div className="line" />
                {user.friends && user.friends.length > 0
                    ? user.friends.map(f =>
                        <div className="posts-post">
                            {f.id &&
                                <Link to={`/user?username=${f.username}`}>
                                    <img
                                        alt=""
                                        src={`${config.apiUrl}/users/user/${f.username}/avatar`}
                                    />
                                </Link>
                            }
                            <div className="vertical">
                                <p>{f.username}</p>
                                <p className="grey">Friends since {moment(f.addedOn).fromNow()}</p>
                            </div>
                        </div>)
                    : 'You have no friends yet, try adding some!'}
            </div>
        </div>
    );
}

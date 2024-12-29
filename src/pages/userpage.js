import axios from "axios";
import Toolbar from "../components/Toolbar";
import { useEffect, useState } from "react";
import config from "../config.json";
import { useSearchParams } from "react-router-dom";
import moment from "moment";

export default function Userpage() {
    const [user, setUser] = useState({});
    const [localUser, setLocalUser] = useState({});
    const [searchParams] = useSearchParams();

    const [pendingFR, setPendingFR] = useState(false);
    const [incomingFR, setIncomingFR] = useState(false);
    const [isFriend, setIsFriend] = useState(false);

    const username = searchParams.get("username")?.trim();

    useEffect(() => {
        if (username && username !== "") {
            axios
                .get(`${config.apiUrl}/users/user/${username}`)
                .then(data => {
                    setUser(data.data);

                    const token = localStorage.getItem("accountToken");
                    if (token) {
                        axios
                            .get(`${config.apiUrl}/users/me`, {
                                headers: {
                                    Authorization: token,
                                },
                            })
                            .then(data => {
                                setLocalUser(data.data);
                                setPendingFR(
                                    (data.data?.outgoingFR ?? []).some(v => v.id === user.id)
                                );
                                setIncomingFR(
                                    (data.data?.incomingFR ?? []).some(v => v.id === user.id)
                                );
                                setIsFriend(
                                    (data.data?.friends ?? []).some((v) => v.id === user.id)
                                );
                            })
                            .catch(error => {
                                console.error("Error fetching user data:", error);
                            });
                    }
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                });
        }
    }, [username, user.id]);

    function sendFriendRequest() {
        if (!username || !user || !localUser.id) return;

        axios
            .post(`${config.apiUrl}/users/user/${username}/friendRequest`, {}, {
                headers: {
                    Authorization: localStorage.getItem("accountToken"),
                },
            })
            .then(() => {
                setPendingFR(true);
            })
            .catch(error => {
                console.error("Error sending friend request:", error);
                alert("Failed to send friend request.");
            });
    }

    function cancelFriendRequest() {
        if (!username || !user || !localUser.id) return;

        axios
            .delete(`${config.apiUrl}/users/user/${username}/friendRequest`, {
                headers: {
                    Authorization: localStorage.getItem("accountToken"),
                },
            })
            .then(() => {
                setPendingFR(false);
            })
            .catch(error => {
                console.error("Error canceling friend request:", error);
                alert("Failed to cancel friend request.");
            });
    }

    function addFriend() {
        if (!username || !user || !localUser.id) return;

        axios
            .post(`${config.apiUrl}/users/user/${username}/friendRequestAction`, {}, {
                headers: {
                    Authorization: localStorage.getItem("accountToken"),
                },
            })
            .then(() => {
                setIncomingFR(true);
            })
            .catch(error => {
                console.error("Error sending friend request:", error);
                alert("Failed to send friend request.");
            });
    }

    function declineFriend() {
        if (!username || !user || !localUser.id) return;

        axios
            .delete(`${config.apiUrl}/users/user/${username}/friendRequestAction`, {
                headers: {
                    Authorization: localStorage.getItem("accountToken"),
                },
            })
            .then(() => {
                setIncomingFR(false);
            })
            .catch(error => {
                console.error("Error canceling friend request:", error);
                alert("Failed to cancel friend request.");
            });
    }

    return (
        <div className="horizontal">
            <Toolbar />
            <div className="panel-content">
                <p className="title">
                    {user.avatar && user.username ? (
                        <img
                            alt=""
                            src={`${config.apiUrl}/users/user/${user.username}/avatar`}
                        />
                    ) : (
                        <i className="fa-solid fa-user" />
                    )}
                    {user.username ?? "Unknown user"}
                </p>
                {user.created && (
                    <p>{"Created: " + moment(user.created).fromNow()}</p>
                )}
                {isFriend && <p>Friends</p>}

                <div className="line" />

                {isFriend ? <></> : incomingFR
                    ? <>
                        <button onClick={addFriend} disabled={!localUser.id}>
                            <i className="fa-solid fa-user-plus" />
                            Accept Friend Request
                        </button>
                        <button onClick={declineFriend} disabled={!localUser.id}>
                            <i className="fa-solid fa-user-minus" />
                            Decline Friend Request
                        </button>
                    </>
                    : !pendingFR ? (
                        <button onClick={sendFriendRequest} disabled={!localUser.id}>
                            <i className="fa-solid fa-user-plus" />
                            Send Friend Request
                        </button>
                    ) : (
                        <button onClick={cancelFriendRequest} disabled={!localUser.id}>
                            <i className="fa-solid fa-user-slash" />
                            Cancel Friend Request
                        </button>
                    )
                }
            </div>
        </div>
    );
}

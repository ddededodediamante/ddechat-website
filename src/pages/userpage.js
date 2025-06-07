import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import Loading from "../components/Loading";
import Post from "../components/Post.js";
import cache from "../cache.ts";

export default function Userpage() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const [friendStatus, setFriendStatus] = useState({
    pending: false,
    incoming: false,
    friend: false,
  });

  const userIdentity =
    searchParams.get("id")?.trim() ?? searchParams.get("username")?.trim();

  function updateFriendStatus(userData, targetId) {
    setFriendStatus({
      pending: (userData?.outgoingFR ?? []).some((v) => v.id === targetId),
      incoming: (userData?.incomingFR ?? []).some((v) => v.id === targetId),
      friend: (userData?.friends ?? []).some((v) => v.id === targetId),
    });
  }

  async function fetchLocalUser(token) {
    const res = await axios.get(`${config.apiUrl}/users/me`, {
      headers: { Authorization: token },
    });
    return res.data;
  }

  useEffect(() => {
    if (!userIdentity) return;

    const fetchUser = async () => {
      try {
        const { data: fetchedUser } = await axios.get(
          `${config.apiUrl}/users/${userIdentity}`
        );
        setUser(fetchedUser);

        const token = localStorage.getItem("accountToken");
        if (token) {
          if (!cache["user"]) {
            try {
              const me = await fetchLocalUser(token);
              cache["user"] = me;
              setLocalUser(me);
              updateFriendStatus(me, fetchedUser.id);
            } catch (err) {
              console.error("Error fetching local user:", err);
            }
          } else {
            const me = cache["user"];
            setLocalUser(me);
            updateFriendStatus(me, fetchedUser.id);
          }
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }

      try {
        const { data: postsArray } = await axios.get(
          `${config.apiUrl}/users/${userIdentity}/posts`
        );
        setPosts(postsArray ?? []);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setPosts([]);
      }
    };

    fetchUser();
  }, [userIdentity]);

  function sendFriendRequest() {
    if (!user?.id || user.id === localUser?.id) return;

    axios
      .post(
        `${config.apiUrl}/users/${userIdentity}/friendRequest`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("accountToken"),
          },
        }
      )
      .then(() => setFriendStatus((s) => ({ ...s, pending: true })))
      .catch((err) => {
        console.error("Error sending friend request:", err);
        alert("Failed to send friend request.");
      });
  }

  function cancelFriendRequest() {
    if (!user?.id || user.id === localUser?.id) return;

    axios
      .delete(`${config.apiUrl}/users/${userIdentity}/friendRequest`, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
        },
      })
      .then(() => setFriendStatus((s) => ({ ...s, pending: false })))
      .catch((err) => {
        console.error("Error canceling friend request:", err);
        alert("Failed to cancel friend request.");
      });
  }

  function addFriend() {
    if (!user?.id || user.id === localUser?.id) return;

    axios
      .post(
        `${config.apiUrl}/users/${userIdentity}/friendRequestAction`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("accountToken"),
          },
        }
      )
      .then(() =>
        setFriendStatus((s) => ({ ...s, pending: false, incoming: false }))
      )
      .catch((err) => {
        console.error("Error accepting friend request:", err);
        alert("Failed to accept friend request.");
      });
  }

  function declineFriend() {
    if (!user?.id || user.id === localUser?.id) return;

    axios
      .delete(`${config.apiUrl}/users/${userIdentity}/friendRequestAction`, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
        },
      })
      .then(() =>
        setFriendStatus((s) => ({ ...s, pending: false, incoming: false }))
      )
      .catch((err) => {
        console.error("Error declining friend request:", err);
        alert("Failed to decline friend request.");
      });
  }

  const renderFriendButtons = () => {
    if (
      !localUser?.id ||
      !user?.id ||
      friendStatus.friend ||
      user.id === localUser.id
    )
      return;

    if (friendStatus.incoming) {
      return (
        <>
          <button onClick={addFriend}>
            <i className="fa-solid fa-user-plus" />
            Accept Friend Request
          </button>
          <button onClick={declineFriend}>
            <i className="fa-solid fa-user-minus" />
            Decline Friend Request
          </button>
        </>
      );
    }

    if (!friendStatus.pending) {
      return (
        <button onClick={sendFriendRequest}>
          <i className="fa-solid fa-user-plus" />
          Send Friend Request
        </button>
      );
    }

    return (
      <button onClick={cancelFriendRequest}>
        <i className="fa-solid fa-user-slash" />
        Cancel Friend Request
      </button>
    );
  };

  return (
    <div className="panel-content">
      {!loading ? (
        <>
          <p className="title">
            {user?.id ? (
              <div
                className={
                  cache?.usersOnline?.includes(user?.id)
                    ? "online-indicator"
                    : ""
                }
                style={{ width: "60px", height: "60px" }}
              >
                <img alt="" src={`${config.apiUrl}/users/${user.id}/avatar`} />
              </div>
            ) : (
              <i className="fa-solid fa-user" />
            )}
            {user?.username ?? "Unknown user"}
            {user?.isModerator && <i className="fa-solid fa-hammer"></i>}
            {friendStatus.friend && <i className="fa-solid fa-users" />}
          </p>

          {user?.created && <p>{"Joined " + moment(user.created).fromNow()}</p>}

          {renderFriendButtons()}

          <div className="line" />

          <h2>Posts</h2>

          {posts ? (
            posts.length > 0 ? (
              posts.map((post, index) => (
                <>
                  <Post key={post.id} data={post} showParentPost={true} />
                  {index !== posts.length - 1 && <div className="line" />}
                </>
              ))
            ) : (
              <p>This user hasn't posted anything yet.</p>
            )
          ) : (
            <Loading />
          )}
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

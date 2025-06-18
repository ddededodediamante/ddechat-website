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
  const [isFollowing, setIsFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState({
    pending: false,
    incoming: false,
    friend: false,
  });

  const userIdentity =
    searchParams.get("id")?.trim() ?? searchParams.get("username")?.trim();

  function updateFriendStatus(userData, targetId) {
    setFriendStatus({
      pending: (userData?.friendrequests?.outgoing ?? []).some(
        (v) => v.id === targetId
      ),
      incoming: (userData?.friendrequests?.incoming ?? []).some(
        (v) => v.id === targetId
      ),
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
              setIsFollowing(
                me?.follow?.following?.some((u) => u.id === fetchedUser.id)
              );
            } catch (err) {
              console.error("Error fetching local user:", err);
            }
          } else {
            const me = cache["user"];
            setLocalUser(me);
            updateFriendStatus(me, fetchedUser.id);
            setIsFollowing(
              me?.follow?.following?.some((u) => u.id === fetchedUser.id)
            );
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
        setFriendStatus((_) => ({
          friend: true,
          pending: false,
          incoming: false,
        }))
      )
      .catch((err) => {
        console.error("Error accepting friend request:", err);
      });
  }

  function removeFriend() {
    if (!user?.id || user.id === localUser?.id) return;

    axios
      .delete(`${config.apiUrl}/users/${userIdentity}/friend`, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
        },
      })
      .then(() =>
        setFriendStatus((_) => ({
          friend: false,
          pending: false,
          incoming: false,
        }))
      )
      .catch((error) => {
        console.error("Error unfriending user:", error);
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

  function followUser() {
    axios
      .post(
        `${config.apiUrl}/users/${userIdentity}/follow`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("accountToken"),
          },
        }
      )
      .then((response) => {
        cache["user"] = response.data;
        setLocalUser(response.data);
        setIsFollowing(true);
        setUser((prev) => {
          if (!prev || !localUser?.id) return prev;
          const newFollowers = [
            ...(prev.follow?.followers ?? []),
            localUser.id,
          ];
          return {
            ...prev,
            follow: {
              ...prev.follow,
              followers: newFollowers,
            },
          };
        });
      })
      .catch((err) => {
        console.error("Error following user:", err);
        alert("Failed to follow user.");
      });
  }

  function unfollowUser() {
    axios
      .delete(`${config.apiUrl}/users/${userIdentity}/follow`, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
        },
      })
      .then((response) => {
        cache["user"] = response.data;
        setLocalUser(response.data);
        setIsFollowing(false);
        setUser((prev) => {
          if (!prev || !localUser?.id) return prev;
          const newFollowers = (prev.follow?.followers ?? []).filter(
            (id) => id !== localUser.id
          );
          return {
            ...prev,
            follow: {
              ...prev.follow,
              followers: newFollowers,
            },
          };
        });
      })
      .catch((err) => {
        console.error("Error unfollowing user:", err);
        alert("Failed to unfollow user.");
      });
  }

  const renderFriendButtons = () => {
    if (!localUser?.id || !user?.id || user.id === localUser.id) return;

    if (friendStatus.friend) {
      return (
        <button onClick={removeFriend}>
          <i className="fa-solid fa-user-slash" />
          Unfriend
        </button>
      );
    }

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
        <i className="fa-solid fa-user-minus" />
        Cancel Friend Request
      </button>
    );
  };

  const renderFollowButton = () => {
    if (!localUser?.id || !user?.id || user.id === localUser.id) return null;

    return isFollowing ? (
      <button onClick={unfollowUser}>
        <i className="fa-solid fa-user-xmark" />
        Unfollow
      </button>
    ) : (
      <button onClick={followUser}>
        <i className="fa-solid fa-user-check" />
        Follow
      </button>
    );
  };

  return (
    <div className="panel-content">
      {!loading ? (
        <>
          <p
            className={`${user?.banner ? "banner " : ""}title`}
            style={{
              backgroundImage: user?.banner
                ? `url(${config.apiUrl}/users/${user.id}/banner/)`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "10px",
            }}
          >
            {user?.id ? (
              <div
                className={
                  cache?.usersOnline?.includes(user?.id)
                    ? "online-indicator"
                    : ""
                }
                style={{ width: "60px", height: "60px" }}
              >
                <img
                  alt=""
                  src={`${config.apiUrl}/users/${user.id}/avatar`}
                  style={{ outline: "3px solid var(--background)" }}
                />
              </div>
            ) : (
              <i className="fa-solid fa-user" />
            )}
            {user?.username ?? "Unknown user"}
            {user?.isModerator && <i className="fa-solid fa-hammer"></i>}
            {friendStatus.friend && <i className="fa-solid fa-users" />}
          </p>

          {user?.created && (
            <p>
              {user?.follow?.followers?.length > 0 && (
                <>
                  {user.follow.followers.length}{" "}
                  {user.follow.followers.length === 1
                    ? "follower"
                    : "followers"}
                  {" · "}
                </>
              )}
              Joined {moment(user.created).fromNow()}
            </p>
          )}

          <div className="horizontal fit-all" style={{ gap: "10px" }}>
            {renderFollowButton()}

            {renderFriendButtons()}
          </div>

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

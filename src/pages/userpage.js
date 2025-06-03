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

  const [pendingFR, setPendingFR] = useState(false);
  const [incomingFR, setIncomingFR] = useState(false);
  const [isFriend, setIsFriend] = useState(false);

  const [loading, setLoading] = useState(true);

  const userId = searchParams.get("id")?.trim();

  useEffect(() => {
    if (userId && userId !== "") {
      axios
        .get(`${config.apiUrl}/users/${userId}`)
        .then((data) => {
          setUser(data.data);

          const token = localStorage.getItem("accountToken");
          if (token) {
            if (!cache["user"]) {
              axios
                .get(`${config.apiUrl}/users/me`, {
                  headers: {
                    Authorization: token,
                  },
                })
                .then((data) => {
                  cache["user"] = data.data;
                  setLocalUser(data.data);
                  setPendingFR(
                    (data.data?.outgoingFR ?? []).some((v) => v.id === userId)
                  );
                  setIncomingFR(
                    (data.data?.incomingFR ?? []).some((v) => v.id === userId)
                  );
                  setIsFriend(
                    (data.data?.friends ?? []).some((v) => v.id === userId)
                  );
                })
                .catch((error) => {
                  console.error("Error fetching user data:", error);
                })
                .finally(() => {
                  setTimeout(() => {
                    setLoading(false);
                  }, 50);
                });
            } else {
              let data = cache["user"];
              setLocalUser(data);
              setPendingFR(
                (data?.outgoingFR ?? []).some((v) => v.id === userId)
              );
              setIncomingFR(
                (data?.incomingFR ?? []).some((v) => v.id === userId)
              );
              setIsFriend((data?.friends ?? []).some((v) => v.id === userId));
              setTimeout(() => {
                setLoading(false);
              }, 50);
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });

      if (!cache["posts"]) cache["posts"] = {};
      if (!Object.values(cache["posts"]).some((i) => i?.author?.id === userId)) {
        axios
          .get(`${config.apiUrl}/users/${userId}/posts`)
          .then((data) => {
            const postsArray = data.data ?? [];
            postsArray.forEach((post) => {
              if (post && post?.id) cache["posts"][post.id] = post;
            });
            setPosts(postsArray);
          })
          .catch((err) => {
            console.error("Error fetching user posts:", err);
            setPosts([]);
          });
      } else {
        setPosts(
          Object.values(cache["posts"]).filter((i) => i?.author?.id === userId)
        );
      }
    }
    console.log(cache)
  }, [userId]);

  function sendFriendRequest() {
    if (!userId || !user || !localUser.id || user.id === localUser.id) return;

    axios
      .post(
        `${config.apiUrl}/users/${userId}/friendRequest`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("accountToken"),
          },
        }
      )
      .then(() => {
        setPendingFR(true);
      })
      .catch((error) => {
        console.error("Error sending friend request:", error);
        alert("Failed to send friend request.");
      });
  }

  function cancelFriendRequest() {
    if (!userId || !user || !localUser.id || user.id === localUser.id) return;

    axios
      .delete(`${config.apiUrl}/users/${userId}/friendRequest`, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
        },
      })
      .then(() => {
        setPendingFR(false);
      })
      .catch((error) => {
        console.error("Error canceling friend request:", error);
        alert("Failed to cancel friend request.");
      });
  }

  function addFriend() {
    if (!userId || !user || !localUser.id || user.id === localUser.id) return;

    axios
      .post(
        `${config.apiUrl}/users/${userId}/friendRequestAction`,
        {},
        {
          headers: {
            Authorization: localStorage.getItem("accountToken"),
          },
        }
      )
      .then(() => {
        setPendingFR(false);
        setIncomingFR(false);
      })
      .catch((error) => {
        console.error("Error sending friend request:", error);
        alert("Failed to send friend request.");
      });
  }

  function declineFriend() {
    if (!userId || !user || !localUser.id || user.id === localUser.id) return;

    axios
      .delete(`${config.apiUrl}/users/${userId}/friendRequestAction`, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
        },
      })
      .then(() => {
        setPendingFR(false);
        setIncomingFR(false);
      })
      .catch((error) => {
        console.error("Error canceling friend request:", error);
        alert("Failed to cancel friend request.");
      });
  }

  const renderFriendButtons = () => {
    if (!localUser?.id || !user?.id || isFriend || user.id === localUser.id)
      return;

    if (incomingFR) {
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

    if (!pendingFR) {
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
    <>
      <div className="panel-content">
        {loading === false ? (
          <>
            <p className="title">
              {user?.id ? (
                <img alt="" src={`${config.apiUrl}/users/${user.id}/avatar`} />
              ) : (
                <i className="fa-solid fa-user" />
              )}
              {user?.username ?? "Unknown user"}
              {user?.isModerator && <i className="fa-solid fa-hammer"></i>}
              {isFriend && localUser?.id && <i className="fa-solid fa-users" />}
            </p>

            {user?.created && (
              <p>{"Joined " + moment(user.created).fromNow()}</p>
            )}

            {renderFriendButtons()}

            <div className="line" />

            <h2>Posts</h2>

            {posts ? (
              posts.length > 0 ? (
                posts.map((post, index) => (
                  <>
                    <Post data={post} showParentPost={true} />
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
    </>
  );
}

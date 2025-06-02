import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.json";
import { useSearchParams } from "react-router-dom";
import moment from "moment";
import Loading from "../components/Loading";

export default function Userpage() {
  const [user, setUser] = useState(null);
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
            axios
              .get(`${config.apiUrl}/users/me`, {
                headers: {
                  Authorization: token,
                },
              })
              .then((data) => {
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
                setTimeout(() => { setLoading(false) }, 200);
              })
              .catch((error) => {
                console.error("Error fetching user data:", error);
                setLoading(false);
              });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setLoading(false);
        });
    }
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
    if (!localUser?.id || !user?.id || isFriend || user.id === localUser.id) return;

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
              {user.id ? (
                <img alt="" src={`${config.apiUrl}/users/${user.id}/avatar`} />
              ) : (
                <i className="fa-solid fa-user" />
              )}
              {user.username ?? "Unknown user"}
              {user.isModerator && (<i class="fa-solid fa-hammer"></i>)}
            </p>

            {user.id && <p style={{ color: "var(--light)", fontSize: "18px" }}>{user.id}</p>}

            {user.created && <p>{"Joined " + moment(user.created).fromNow()}</p>}

            {isFriend && <p style={{ fontSize: "17px", display: 'flex', gap: '5px' }}>
              <i className="fa-solid fa-users" />
              Friends with this user
            </p>}

            {(isFriend && localUser?.id) && <div className="line" />}

            {renderFriendButtons()}
          </>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

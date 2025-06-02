import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import config from "../config.json";
import Loading from "../components/Loading";
import Message from "../components/Message";

export default function Directmessage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [localUser, setLocalUser] = useState(null);
  const [socket, setSocket] = useState(null);

  const [messageContent, setMessageContent] = useState("");
  const [effect, setEffect] = useState("");
  const [spoiler, setSpoiler] = useState(false);

  const [searchParams] = useSearchParams();
  const userId = searchParams.get("id")?.trim();

  useEffect(() => {
    if (user !== null || localUser !== null) return;

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
                setMessages(
                  data.data?.messages?.find((i) => i?.author?.id === userId)
                    ?.contents ?? []
                );

                setTimeout(() => {
                  let panel = document.querySelector('.panel-content')
                  panel.scrollTo({
                    top: panel.scrollHeight,
                    behavior: "instant",
                  });
                }, 50);
              })
              .catch((error) => {
                console.error("Error fetching local user data:", error);
                navigate("/");
              });
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          navigate("/");
        });
    }
  }, [userId, localUser, user, navigate]);

  useEffect(() => {
    if (socket !== null || !localUser?.id || !user?.id) return;

    const newSocket = new WebSocket(config.apiUrl.replace(/^http/, 'ws'));
    setSocket(newSocket);

    const notificationSound = new Audio("/files/notification.wav");
    notificationSound.volume = 0.5;

    newSocket.onopen = () => {
      console.log("Connected to server");

      newSocket.send(JSON.stringify({
        type: "dm:join",
        token: localStorage.getItem("accountToken"),
        recipientId: userId,
      }));
    };

    newSocket.onmessage = (event) => {
      const { type, message } = JSON.parse(event.data);

      if (type === "dm:receive") {
        if (!message.username) {
          if (message.userId === localUser.id) message.username = localUser.username;
          else if (message.userId === user.id) message.username = user.username;
          else return;
        }

        let panel = document.querySelector('.panel-content');
        let atBottomScroll = panel.scrollHeight - panel.scrollTop - panel.clientHeight <= 10

        if (!document.hasFocus()) notificationSound.play();

        setMessages(m => [...m, message]);

        setTimeout(() => {
          if (atBottomScroll) {
            panel.scrollTo({
              top: panel.scrollHeight,
              behavior: "instant",
            });
          }
        }, 50);
      }
    };

    newSocket.onclose = () => {
      console.log("Disconnected from server");
    };
  }, [socket, userId, localUser, user?.id, user?.username]);

  function sendMessage() {
    document.querySelector("div.horizontal textarea#postText").value = "";

    socket.send(JSON.stringify({
      type: "dm:message",
      recipientId: userId,
      content: messageContent,
      effect,
      spoiler
    }));

    setMessageContent("");
    setEffect("");
    setSpoiler(false);
  }

  window.addEventListener("beforeunload", () => {
    if (socket !== null) socket.close();
  });
  window.addEventListener("unload", () => {
    if (socket !== null) socket.close();
  });

  return (
    <>
      <div className="panel-content" style={{ overflowX: "hidden" }}>
        {(user?.id && localUser?.id) ? (
          <>
            {messages.map((p) => (<Message data={p} />))}

            <div
              className="horizontal reply-section"
              style={{
                width: "100%",
                gap: "10px",
                height: "fit-content",
                alignItems: "center",
              }}
            >
              <textarea
                placeholder="Send a message"
                maxLength={1000}
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                id="postText"
              />
              <button
                style={{ ...(effect === 'zoomIn' ? { backgroundColor: "#555" } : {}) }}
                onClick={() => effect === 'zoomIn' ? setEffect('') : setEffect('zoomIn')}
              >
                <img src="/files/megaphone.png" height={"28px"} alt="zoomIn" />
              </button>
              <button
                style={{ ...(effect === 'glow' ? { backgroundColor: "#555" } : {}) }}
                onClick={() => effect === 'glow' ? setEffect('') : setEffect('glow')}
              >
                <img src="/files/star.png" height={"28px"} alt="glow" />
              </button>
              <button
                style={{ ...(effect === 'loud' ? { backgroundColor: "#555" } : {}) }}
                onClick={() => effect === 'loud' ? setEffect('') : setEffect('loud')}
              >
                <img src="/files/angerbubble.png" height={"28px"} alt="loud" />
              </button>
              <button
                style={{ ...(spoiler ? { backgroundColor: "#555" } : {}) }}
                onClick={() => setSpoiler(!spoiler)}
              >
                <img src="/files/eyes.png" height={"28px"} alt="spoiler" />
              </button>
              <button onClick={sendMessage}>Send</button>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import config from "../config.json";
import Loading from "../components/Loading";
import Message from "../components/Message";
import { Helmet } from "react-helmet-async";

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
        .get(`${config.apiUrl}/users/user/${userId}`)
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

        setMessages(m => [...m, message]);

        setTimeout(() => {
          let panel = document.querySelector('.panel-content')
          panel.scrollTo({
            top: panel.scrollHeight,
            behavior: "smooth",
          });
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
      <Helmet>
        <title>ddeChat - Direct Messages</title>
        <meta name="description" content="Chat and send fun effects in real time with other people." />
        <meta property="og:image" content="%PUBLIC_URL%/files/logo.png" />
      </Helmet>

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
                id="postText"
              />
              <button onClick={sendMessage}>Send</button>
              <button
                style={{ ...(effect === 'zoomIn' ? { backgroundColor: "#444" } : {}) }}
                onClick={() => effect === 'zoomIn' ? setEffect('') : setEffect('zoomIn')}
              >
                <img src="/files/megaphone.png" height={"28px"} alt="zoomIn" />
              </button>
              <button
                style={{ ...(effect === 'glow' ? { backgroundColor: "#444" } : {}) }}
                onClick={() => effect === 'glow' ? setEffect('') : setEffect('glow')}
              >
                <img src="/files/star.png" height={"28px"} alt="glow" />
              </button>
              <button
                style={{ ...(spoiler ? { backgroundColor: "#444" } : {}) }}
                onClick={() => setSpoiler(!spoiler)}
              >
                <img src="/files/eyes.png" height={"28px"} alt="spoiler" />
              </button>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

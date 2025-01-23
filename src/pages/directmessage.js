import axios from "axios";
import Post from "../components/Post";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import config from "../config.json";
import Loading from "../components/Loading";
import { io } from "socket.io-client";

export default function Directmessage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState(null);
  const [localUser, setLocalUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [messageContent, setMessageContent] = useState("");

  const [searchParams] = useSearchParams();
  const username = searchParams.get("username")?.trim();

  useEffect(() => {
    if (username && username !== "") {
      axios
        .get(`${config.apiUrl}/users/user/${username}`)
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
                  localUser?.messages?.find((i) => i?.author?.username === username)
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
  }, [username, user?.id, localUser?.messages, navigate]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("dm:receive", ({ content, username }) => {
      setMessages((prev) => [...prev, { content, username, created: Date.now() }]);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  }, [socket]);

  function sendMessage() {
    document.querySelector("div.horizontal textarea#postText").value = "";

    socket.emit("dm:message", {
      username: localUser.username,
      content: messageContent,
      created: Date.now(),
    });

    setMessages((prev) => [
      ...prev,
      {
        username: localUser.username,
        content: messageContent,
        created: Date.now(),
      },
    ]);

    setMessageContent("");

    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "instant",
    });
  }

  return (
    <div className="panel-content">
      {messages ? (
        <>
          {messages.map((p) => (
            <Post data={p} noSocial={true} />
          ))}
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
          </div>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

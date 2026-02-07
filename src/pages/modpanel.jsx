import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import cache from "../cache.ts";
import Swal from "sweetalert2";

export default function Modpanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const [banUserId, setBanUserId] = useState("");
  const [banReason, setBanReason] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accountToken");

    if (!cache["user"]) {
      if (token) {
        axios
          .get(`${config.apiUrl}/users/me`, {
            headers: {
              Authorization: token,
            },
          })
          .then((data) => {
            cache["user"] = data.data;
            setUser(data.data);
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
            navigate("/posts");
          });
      } else navigate("/posts");
    } else setUser(cache["user"]);
  }, [navigate]);

  useEffect(() => {
    if (user && user.isModerator !== true) navigate("/posts");
  }, [user, navigate]);

  async function handleBulkDelete() {
    const token = localStorage.getItem("accountToken");
    const params = {};
    if (author) params.author = author;
    if (content) params.content = content;

    if (!params.author && !params.content) {
      Swal.fire(
        "Error",
        "Please provide author or content to delete.",
        "error"
      );
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete all matching posts.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete them",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.delete(`${config.apiUrl}/posts`, {
        headers: { Authorization: token },
        params,
      });

      Swal.fire(
        "Deleted!",
        `Deleted ${res.data.deletedCount} post(s).`,
        "success"
      );
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error",
        err.response?.data?.error || "Failed to delete posts",
        "error"
      );
    }
  }

  async function handleUserBan() {
    const token = localStorage.getItem("accountToken");
    try {
      await axios.post(
        `${config.apiUrl}/users/ban/user`,
        { userId: banUserId, reason: banReason },
        { headers: { Authorization: token } }
      );
      Swal.fire("Success", "User and all associated IPs banned", "success");
      setBanUserId("");
      setBanReason("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to ban", "error");
    }
  }

  return (
    <>
      <div className="panel-content">
        <p className="title">
          <i className="fa-solid fa-wrench" /> Moderator Panel
        </p>
        <div className="line" />
        {user ? (
          <div className="settings">
            <div className="settingsWrap">
              <div className="settings">
                <h2>Target User Posts</h2>

                <label>Author ID</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Enter ID..."
                />

                <label>Content</label>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter exact content..."
                />
                <button className="danger" onClick={handleBulkDelete}>
                  <i className="fa-solid fa-trash" /> Delete Matching Posts
                </button>
              </div>
            </div>

            <div className="settingsWrap">
              <div className="settings">
                <h2>Ban User</h2>
                <label>Target User ID</label>
                <input
                  type="text"
                  value={banUserId}
                  onChange={(e) => setBanUserId(e.target.value)}
                  placeholder="Enter ID..."
                />
                <label>Reason</label>
                <input
                  type="text"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  placeholder="Reason for ban..."
                />
                <button className="danger" onClick={handleUserBan}>
                  <i className="fa-solid fa-gavel" /> Ban Permanently
                </button>
                <p style={{ fontSize: '12px', opacity: 0.5 }}>
                  Note: This will automatically blacklist every IP address this user has ever logged in from.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

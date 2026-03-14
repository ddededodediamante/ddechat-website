import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import { getUserCached } from "../cache.ts";
import Swal from "sweetalert2";

export default function Modpanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("posts");

  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");

  const [banTarget, setBanTarget] = useState("");
  const [banReason, setBanReason] = useState("");

  const [unbanTarget, setUnbanTarget] = useState("");

  const [readonlyTarget, setReadonlyTarget] = useState("");

  const [profileTarget, setProfileTarget] = useState("");
  const [clearAvatar, setClearAvatar] = useState(false);
  const [clearBanner, setClearBanner] = useState(false);
  const [clearBio, setClearBio] = useState(false);

  const [warnTarget, setWarnTarget] = useState("");
  const [warnReason, setWarnReason] = useState("");

  const [usernameTarget, setUsernameTarget] = useState("");
  const [newUsername, setNewUsername] = useState("");

  const [altsTarget, setAltsTarget] = useState("");
  const [altsResult, setAltsResult] = useState(null);
  const [altsLoading, setAltsLoading] = useState(false);

  useEffect(() => {
    getUserCached()
      .then(user => setUser(user))
      .catch(error => {
        console.error(error);
        navigate("/posts");
      });
  }, [navigate]);

  useEffect(() => {
    if (user && user.isModerator !== true) navigate("/posts");
  }, [user, navigate]);

  const token = () => localStorage.getItem("accountToken");

  async function handleBulkDelete() {
    const params = {};
    if (author) params.author = author;
    if (content) params.content = content;

    if (!params.author && !params.content) {
      Swal.fire("Error", "Please provide author or content to delete.", "error");
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
        headers: { Authorization: token() },
        params,
      });
      Swal.fire("Deleted!", `Deleted ${res.data.deletedCount} post(s).`, "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.error || "Failed to delete posts", "error");
    }
  }

  async function handleUserBan() {
    if (!banTarget.trim()) return Swal.fire("Error", "Please enter a target user.", "error");

    const confirm = await Swal.fire({
      title: "Ban this user?",
      text: "This will ban the account and blacklist all associated IPs.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ban",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.post(
        `${config.apiUrl}/users/mod/${encodeURIComponent(banTarget)}/ban`,
        { reason: banReason },
        { headers: { Authorization: token() } }
      );
      Swal.fire("Banned", res.data.message, "success");
      setBanTarget("");
      setBanReason("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to ban user", "error");
    }
  }

  async function handleUserUnban() {
    if (!unbanTarget.trim()) return Swal.fire("Error", "Please enter a target user.", "error");

    try {
      const res = await axios.post(
        `${config.apiUrl}/users/mod/${encodeURIComponent(unbanTarget)}/unban`,
        {},
        { headers: { Authorization: token() } }
      );
      Swal.fire("Unbanned", res.data.message, "success");
      setUnbanTarget("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to unban user", "error");
    }
  }

  async function handleReadOnly() {
    if (!readonlyTarget.trim()) return Swal.fire("Error", "Please enter a target user.", "error");

    try {
      const res = await axios.patch(
        `${config.apiUrl}/users/mod/${encodeURIComponent(readonlyTarget)}/readonly`,
        {},
        { headers: { Authorization: token() } }
      );
      Swal.fire("Updated", res.data.message, "success");
      setReadonlyTarget("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to toggle read-only", "error");
    }
  }

  async function handleClearProfile() {
    if (!profileTarget.trim()) return Swal.fire("Error", "Please enter a target user.", "error");
    if (!clearAvatar && !clearBanner && !clearBio)
      return Swal.fire("Error", "Select at least one field to clear.", "error");

    try {
      const res = await axios.delete(
        `${config.apiUrl}/users/mod/${encodeURIComponent(profileTarget)}/profile`,
        {
          headers: { Authorization: token() },
          data: { avatar: clearAvatar, banner: clearBanner, bio: clearBio },
        }
      );
      Swal.fire("Cleared", res.data.message, "success");
      setProfileTarget("");
      setClearAvatar(false);
      setClearBanner(false);
      setClearBio(false);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to clear profile fields", "error");
    }
  }

  async function handleWarn() {
    if (!warnTarget.trim()) return Swal.fire("Error", "Please enter a target user.", "error");
    if (!warnReason.trim()) return Swal.fire("Error", "A reason is required.", "error");

    try {
      const res = await axios.post(
        `${config.apiUrl}/users/mod/${encodeURIComponent(warnTarget)}/warn`,
        { reason: warnReason },
        { headers: { Authorization: token() } }
      );
      Swal.fire("Warning Issued", res.data.message, "success");
      setWarnTarget("");
      setWarnReason("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to warn user", "error");
    }
  }

  async function handleResetUsername() {
    if (!usernameTarget.trim()) return Swal.fire("Error", "Please enter a target user.", "error");
    if (!newUsername.trim()) return Swal.fire("Error", "Please enter a new username.", "error");

    try {
      const res = await axios.patch(
        `${config.apiUrl}/users/mod/${encodeURIComponent(usernameTarget)}/username`,
        { username: newUsername },
        { headers: { Authorization: token() } }
      );
      Swal.fire("Updated", res.data.message, "success");
      setUsernameTarget("");
      setNewUsername("");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to update username", "error");
    }
  }

  async function handleFindAlts() {
    if (!altsTarget.trim()) return Swal.fire("Error", "Please enter a target user.", "error");
    setAltsLoading(true);
    setAltsResult(null);
    try {
      const res = await axios.get(
        `${config.apiUrl}/users/mod/${encodeURIComponent(altsTarget)}/alts`,
        { headers: { Authorization: token() } }
      );
      setAltsResult(res.data);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.error || "Failed to fetch alts", "error");
    } finally {
      setAltsLoading(false);
    }
  }

  const tabs = [
    { id: "posts", label: "Posts" },
    { id: "ban", label: "Ban" },
    { id: "restrict", label: "Restrict" },
    { id: "profile", label: "Profile" },
    { id: "alts", label: "Alts" },
  ];

  return (
    <>
      <div className="panel-content">
        <p className="title">
          <i className="fa-solid fa-wrench" /> Moderator Panel
        </p>
        <div className="line" />
        {user ? (
          <>
            <div className="horizontal fit-all mod-tabs">
              {tabs.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  className={tab === id ? "tab-active" : undefined}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="settingsWrap">
              <div className={tab === "posts" ? "settings" : "hidden"}>
                <h2>Bulk Delete Posts</h2>
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

              <div className={tab === "ban" ? "settings" : "hidden"}>
                <h2>Ban User</h2>
                <label>Username or ID</label>
                <input
                  type="text"
                  value={banTarget}
                  onChange={(e) => setBanTarget(e.target.value)}
                  placeholder="Enter username or ID..."
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
                <p className="mod-note">
                  Note: This will automatically blacklist every IP address this user has ever logged in from.
                </p>

                <hr />

                <h2>Unban User</h2>
                <label>Username or ID</label>
                <input
                  type="text"
                  value={unbanTarget}
                  onChange={(e) => setUnbanTarget(e.target.value)}
                  placeholder="Enter username or ID..."
                />
                <button onClick={handleUserUnban}>
                  <i className="fa-solid fa-unlock" /> Unban User
                </button>
                <p className="mod-note">
                  Note: This will also remove all IP bans associated with this user.
                </p>
              </div>

              <div className={tab === "restrict" ? "settings" : "hidden"}>
                <h2>Toggle Read-Only</h2>
                <label>Username or ID</label>
                <input
                  type="text"
                  value={readonlyTarget}
                  onChange={(e) => setReadonlyTarget(e.target.value)}
                  placeholder="Enter username or ID..."
                />
                <button onClick={handleReadOnly}>
                  <i className="fa-solid fa-lock" /> Toggle Read-Only
                </button>

                <hr />

                <h2>Warn User</h2>
                <label>Username or ID</label>
                <input
                  type="text"
                  value={warnTarget}
                  onChange={(e) => setWarnTarget(e.target.value)}
                  placeholder="Enter username or ID..."
                />
                <label>Reason</label>
                <input
                  type="text"
                  value={warnReason}
                  onChange={(e) => setWarnReason(e.target.value)}
                  placeholder="Reason for warning..."
                />
                <button onClick={handleWarn}>
                  <i className="fa-solid fa-triangle-exclamation" /> Issue Warning
                </button>
              </div>

              <div className={tab === "profile" ? "settings" : "hidden"}>
                <h2>Clear Profile Fields</h2>
                <label>Username or ID</label>
                <input
                  type="text"
                  value={profileTarget}
                  onChange={(e) => setProfileTarget(e.target.value)}
                  placeholder="Enter username or ID..."
                />
                <label>Fields to Clear</label>
                <div className="mod-checkbox-group">
                  {[
                    { label: "Avatar", state: clearAvatar, setter: setClearAvatar },
                    { label: "Banner", state: clearBanner, setter: setClearBanner },
                    { label: "Bio", state: clearBio, setter: setClearBio },
                  ].map(({ label, state, setter }) => (
                    <label key={label} className="mod-checkbox-label">
                      <input
                        type="checkbox"
                        checked={state}
                        onChange={(e) => setter(e.target.checked)}
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <button className="danger" onClick={handleClearProfile}>
                  <i className="fa-solid fa-eraser" /> Clear Selected Fields
                </button>

                <hr />

                <h2>Reset Username</h2>
                <label>Username or ID</label>
                <input
                  type="text"
                  value={usernameTarget}
                  onChange={(e) => setUsernameTarget(e.target.value)}
                  placeholder="Enter username or ID..."
                />
                <label>New Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter new username..."
                />
                <button onClick={handleResetUsername}>
                  <i className="fa-solid fa-user-pen" /> Set Username
                </button>
              </div>

              <div className={tab === "alts" ? "settings" : "hidden"}>
                <h2>Find Alt Accounts</h2>
                <label>Username or ID</label>
                <input
                  type="text"
                  value={altsTarget}
                  onChange={(e) => { setAltsTarget(e.target.value); setAltsResult(null); }}
                  placeholder="Enter username or ID..."
                  onKeyDown={(e) => e.key === "Enter" && handleFindAlts()}
                />
                <button onClick={handleFindAlts} disabled={altsLoading}>
                  <i className={`fa-solid ${altsLoading ? "fa-spinner fa-spin" : "fa-magnifying-glass"}`} /> {altsLoading ? "Searching..." : "Find Alts"}
                </button>

                {altsResult && (
                  <div className="mod-alts-result">
                    <p className="mod-alts-summary">
                      Checked {altsResult.checkedIps} IP(s) and found {altsResult.alts.length} alt account(s)
                    </p>
                    {altsResult.alts.length === 0 ? (
                      <p className="mod-empty">No alt accounts found.</p>
                    ) : (
                      <div className="mod-alts-list">
                        {altsResult.alts.map((alt) => (
                          <div key={alt.id} className="mod-alt-card">
                            <div className="mod-alt-card-header">
                              <strong>{alt.username}</strong>
                              <span className="mod-alt-id">ID: {alt.id}</span>
                              {alt.banned && (
                                <span className="mod-alt-banned">
                                  banned
                                </span>
                              )}
                            </div>
                            <span className="mod-alt-ips">
                              Shared IPs: {alt.sharedIps.join(", ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

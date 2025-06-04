import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import cache from "../cache.ts";

const setStyle = (property, value) =>
  document.documentElement.style.setProperty(property, value);

export default function Settings() {
  const darkerTheme = {
    background: "#000000",
    midground: "#222222",
    foreground: "#444444",
    light: "#666666",
    font: "#ffffff",
    primary: "#3d80e4",
    danger: "#cf3232",
  };

  const darkTheme = {
    background: "#111111",
    midground: "#333333",
    foreground: "#555555",
    light: "#777777",
    font: "#ffffff",
    primary: "#3d80e4",
    danger: "#cf3232",
  };

  const lightTheme = {
    background: "#ffffff",
    midground: "#dddddd",
    foreground: "#bbbbbb",
    light: "#999999",
    font: "#000000",
    primary: "#3d80e4",
    danger: "#cf3232",
  };

  const navigate = useNavigate();
  const [tab, setTab] = useState("avatar");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarFileURI, setAvatarFileURI] = useState("");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState(darkTheme);
  const [layoutSettings, setLayoutSettings] = useState({
    showUserTag: true,
    showToolbarLogo: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("accountToken") ?? "";
    if (token === "") return navigate("/login");

    if (!cache["user"])
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
          console.error(error);
          setUser("error");
        });
    else setUser(cache["user"]);
  }, [navigate]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("themeSettings");
    if (savedTheme) {
      setTheme((prevTheme) => ({ ...prevTheme, ...JSON.parse(savedTheme) }));
    }

    const savedLayout = localStorage.getItem("layoutSettings");
    if (savedLayout) {
      setLayoutSettings(JSON.parse(savedLayout));
    }
  }, []);

  function handleAvatarChange(event) {
    let file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setAvatarFileURI(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setAvatarFileURI("");
    }

    setAvatarFile(file);
  }

  function handleThemeChange(key, value) {
    const newTheme = { ...theme, [key]: value };

    setTheme(newTheme);
    setStyle(`--${key}`, value);

    localStorage.setItem("themeSettings", JSON.stringify(newTheme));
  }

  function handleLayoutChange(key, value) {
    const newSettings = { ...layoutSettings, [key]: value };
    setLayoutSettings(newSettings);
    localStorage.setItem("layoutSettings", JSON.stringify(newSettings));
    window.layout = newSettings;
  }

  function applyPreset(preset) {
    setTheme(preset);
    setStyle("--background", preset.background);
    setStyle("--midground", preset.midground);
    setStyle("--foreground", preset.foreground);
    setStyle("--light", preset.light);
    setStyle("--font", preset.font);
    setStyle("--primary", preset.primary);
    setStyle("--danger", preset.danger);

    localStorage.setItem("themeSettings", JSON.stringify(preset));
  }

  async function handleAvatarSubmit() {
    if (!avatarFile) return;

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    axios
      .post(`${config.apiUrl}/users/me/avatar`, formData, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
          "Content-Type": "multipart/form-data",
        },
      })
      .then((data) => {
        if (data.data) cache["user"] = data.data;
        document.getElementById("avatarUpload").value = "";;
        
        Swal.fire({
          title: "Avatar Updated",
          text: "Your avatar was updated",
          footer: "The changes will be visible on the next page reload",
          animation: true,
        });
      })
      .catch((error) => {
        Swal.fire({
          title: "Avatar Uploading Error",
          text: error?.response?.data?.error ?? error,
          animation: true,
        });
      });
  }

  function logout() {
    localStorage.removeItem("accountToken");
    window.location.replace("/login");
  }

  return (
    <>
      <div className="panel-content">
        <p className="title">
          <i className="fa-solid fa-cog" />
          Settings
        </p>

        <div className="line" />

        {user ? (
          <>
            <div className="horizontal fit-all" style={{ gap: "5px" }}>
              {["avatar", "theme", "layout"].map((name) => (
                <button
                  key={name}
                  onClick={() => setTab(name)}
                  style={{
                    background:
                      tab === name ? "var(--foreground)" : "var(--midground)",
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              ))}
            </div>

            <div className="settingsWrap">
              <div className={tab === "avatar" ? "settings" : "hidden"}>
                <h2>Preview</h2>
                <div className="horizontal fit-all">
                  <img
                    alt=""
                    src={
                      avatarFileURI !== ""
                        ? avatarFileURI
                        : `${config.apiUrl}/users/${user.id}/avatar`
                    }
                    style={{
                      borderRadius: "25%",
                      backgroundColor: "var(--foreground)",
                      padding: "8px",
                      width: "70px",
                      height: "70px",
                    }}
                  />
                </div>

                <p>Change Avatar</p>
                <input
                  type="file"
                  id="avatarUpload"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleAvatarChange}
                />
                <button
                  disabled={avatarFileURI === ""}
                  onClick={handleAvatarSubmit}
                >
                  Submit Avatar
                </button>
              </div>
              <div className={tab === "theme" ? "settings" : "hidden"}>
                {Object.keys(theme).map((key) => (
                  <div key={key} className="horizontal" style={{ gap: "5px" }}>
                    <label>
                      {key.charAt(0).toUpperCase() + key.slice(1)}:{" "}
                    </label>
                    <input
                      type="color"
                      value={theme[key]}
                      onChange={(e) => handleThemeChange(key, e.target.value)}
                    />
                  </div>
                ))}
                <div className="horizontal" style={{ gap: "5px" }}>
                  <button onClick={() => applyPreset(darkerTheme)}>
                    <i className="fa-solid fa-cloud-moon"></i>
                    Darker Theme
                  </button>
                  <button onClick={() => applyPreset(darkTheme)}>
                    <i className="fa-solid fa-moon"></i>
                    Dark Theme
                  </button>
                  <button onClick={() => applyPreset(lightTheme)}>
                    <i className="fa-solid fa-sun"></i>
                    Light Theme
                  </button>
                </div>
              </div>
              <div className={tab === "layout" ? "settings" : "hidden"}>
                <p style={{ color: "var(--font)", opacity: 0.5 }}>
                  Applies after page refresh
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={window?.layout?.showUserTag ?? true}
                    onChange={(e) =>
                      handleLayoutChange("showUserTag", e.target.checked)
                    }
                  />
                  Show User Tag
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={window?.layout?.showToolbarLogo ?? true}
                    onChange={(e) =>
                      handleLayoutChange("showToolbarLogo", e.target.checked)
                    }
                  />
                  Show Toolbar Logo
                </label>
              </div>
            </div>

            <div className="line" />
            <button onClick={logout}>
              <i className="fa-solid fa-right-from-bracket"></i>
              Log out
            </button>
          </>
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

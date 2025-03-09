import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.json";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

const setStyle = (property, value) =>
  document.documentElement.style.setProperty(property, value);

export default function Settings() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("avatar");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarFileURI, setAvatarFileURI] = useState("");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState({
    background: "#111111",
    midground: "#333333",
    foreground: "#555555",
    light: "#777777",
    font: "#ffffff",
  });
  const [layoutSettings, setLayoutSettings] = useState({
    showUserTag: true,
    showToolbarLogo: true,
  });

  const darkerTheme = {
    background: "#000000",
    midground: "#222222",
    foreground: "#444444",
    light: "#666666",
    font: "#ffffff",
  };

  const darkTheme = {
    background: "#111111",
    midground: "#333333",
    foreground: "#555555",
    light: "#777777",
    font: "#ffffff",
  };

  const lightTheme = {
    background: "#ffffff",
    midground: "#dddddd",
    foreground: "#bbbbbb",
    light: "#999999",
    font: "#000000",
  };

  useEffect(() => {
    const token = localStorage.getItem("accountToken");
    if (token) {
      axios
        .get(`${config.apiUrl}/users/me`, { headers: { Authorization: token } })
        .then((data) => setUser(data.data))
        .catch((error) => {
          console.error("Error fetching user data:", error);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
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

  function handleLayoutChangeg(key, value) {
    const newSettings = { ...layoutSettings, [key]: value };
    setLayoutSettings(newSettings);
    localStorage.setItem("layoutSettings", JSON.stringify(newSettings));
    window.layout = newSettings;
  }

  function applyPreset(preset) {
    setTheme(preset);
    setStyle("--background", preset.background);
    setStyle("--midground", preset.midground);
    setStyle("--foreground", preset.background);
    setStyle("--light", preset.light);
    setStyle("--font", preset.font);

    localStorage.setItem("themeSettings", JSON.stringify(preset));
  }

  async function handleAvatarSubmit() {
    if (!avatarFile) {
      Swal.fire({
        title: "Avatar File Required",
        text: "You must provide an image for your avatar",
        animation: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append("avatar", avatarFile);

    axios
      .post(`${config.apiUrl}/users/me/avatar`, formData, {
        headers: {
          Authorization: localStorage.getItem("accountToken"),
          "Content-Type": "multipart/form-data",
        },
      })
      .then(() =>
        Swal.fire({
          title: "Avatar Updated",
          text: "Your avatar was updated",
          footer: "The changes will be visible on the next page reload",
          animation: true,
        })
      )
      .catch((error) =>
        Swal.fire({
          title: "Avatar Uploading Error",
          text: error?.response?.data?.error ?? error,
          animation: true,
        })
      );
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
        {user ? (
          <>
            <div className="line" />

            <div
              className="horizontal"
              style={{ marginLeft: '10px', gap: "5px", height: "fit-content" }}
            >
              {["avatar", "theme", "layout"].map((name) => (
                <button
                  key={name}
                  onClick={() => setTab(name)}
                  style={{
                    background:
                      tab === name ? "var(--foreground)" : "var(--midground)",
                      borderBottomRightRadius: 0,
                      borderBottomLeftRadius: 0
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </button>
              ))}
            </div>

            <div className="settings" id="top">
              <div className={tab === "avatar" ? "settings" : "hidden"}>
                <h2>Avatar</h2>

                <div
                  className="horizontal"
                  style={{
                    gap: "10px",
                    justifyContent: "start",
                    alignItems: "center",
                    height: "fit-content",
                  }}
                >
                  <img
                    alt=""
                    src={
                      avatarFileURI !== ""
                        ? avatarFileURI
                        : `${config.apiUrl}/users/user/${user.id}/avatar`
                    }
                    width={70}
                    height={70}
                    style={{
                      borderRadius: "25%",
                      backgroundColor: "var(--midground)",
                      padding: "8px",
                    }}
                  />
                  <input
                    type="file"
                    id="avatarUpload"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleAvatarChange}
                  />
                  <button onClick={handleAvatarSubmit}>Submit Avatar</button>
                </div>
              </div>

              <div className={tab === "theme" ? "settings" : "hidden"}>
                <h2>Theme Settings</h2>
                {Object.keys(theme).map((key) => (
                  <div key={key}>
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
                    <i class="fa-solid fa-cloud-moon"></i>
                    Darker Theme
                  </button>
                  <button onClick={() => applyPreset(darkTheme)}>
                    <i class="fa-solid fa-moon"></i>
                    Dark Theme
                  </button>
                  <button onClick={() => applyPreset(lightTheme)}>
                    <i class="fa-solid fa-sun"></i>
                    Light Theme
                  </button>
                </div>
              </div>

              <div className={tab === "layout" ? "settings" : "hidden"}>
                <h2>Layout Settings</h2>
                <p style={{ color: "var(--light)" }}>
                  Applies after page refresh
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={layoutSettings.showUserTag}
                    onChange={(e) =>
                      handleLayoutChangeg("showUserTag", e.target.checked)
                    }
                  />
                  Show User Tag
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={layoutSettings.showToolbarLogo}
                    onChange={(e) =>
                      handleLayoutChangeg("showToolbarLogo", e.target.checked)
                    }
                  />
                  Show Toolbar Logo
                </label>
              </div>
            </div>

            <div className="line" />

              <button onClick={logout}>
                <i class="fa-solid fa-right-from-bracket"></i>
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

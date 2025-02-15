import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.json";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

export default function Settings() {
  const navigate = useNavigate();
  const [avatarFile, setAvatarFile] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accountToken");
    if (token) {
      axios
        .get(`${config.apiUrl}/users/me`, {
          headers: {
            Authorization: token,
          },
        })
        .then((data) => {
          setUser(data.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, [navigate]);

  function handleAvatarChange(event) {
    setAvatarFile(event.target.files[0]);
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
      .then(() => {
        Swal.fire({
          title: "Avatar Updated",
          text: "Your avatar was updated",
          footer: "The changes will be visible on the next page reload",
          animation: true,
        });
      })
      .catch((error) => {
        console.error(error);
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
    <div className="panel-content">
      <p className="title">
        <i className="fa-solid fa-cog" />
        Settings
      </p>

      <div className="line" />
      {user ? (
        <>
          <label htmlFor="avatarUpload">Upload Avatar:</label>
          <input
            type="file"
            id="avatarUpload"
            accept="image/png, image/jpeg"
            onChange={handleAvatarChange}
          />
          <button onClick={handleAvatarSubmit}>Submit Avatar</button>
          <br />
          <button onClick={logout}>Log out</button>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
}

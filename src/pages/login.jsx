import axios from "axios";
import config from "../config.js";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

import Loading from "../components/Loading.jsx";

export default function Login() {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isValid = true;

    if (usernameInput.length < 3 || usernameInput.length > 20) isValid = false;
    if (passwordInput.length < 8 || passwordInput.length > 50) isValid = false;

    setValid(isValid);
  }, [usernameInput, passwordInput]);

  async function loginButton() {
    if (!valid) return;

    const username = document.querySelector(
      '.login-form input[type="text"]'
    ).value;
    const password = document.querySelector(
      '.login-form input[type="password"]'
    ).value;

    setLoading(true);

    await axios
      .put(config.apiUrl + "/users/login", { username, password })
      .then(data => {
        setLoading(false)

        localStorage.setItem("accountToken", data.data.token);
        window.location.href = "/posts";
      })
      .catch(error => {
        console.error(error);

        return Swal.fire({
          title: "Login Failed",
          text: error?.response?.data?.error ?? error,
          animation: true,
        });
      });
  }

  function githubLogin() {
    const token = localStorage.getItem("accountToken");
    const authUrl = `${config.apiUrl}/auth/github${
      token ? `?token=${token}` : ""
    }`;
    window.location.href = authUrl;
  }

  return (
    <div className="login-container">
      <h1>
        Login to <strong>ddeChat</strong>
      </h1>

      <Link to="/sign">No account? Sign up instead!</Link>

      <div className="login-form">
        <input
          type="text"
          placeholder="Username"
          maxLength={20}
          minLength={3}
          required
          onInput={e => setUsernameInput(e.currentTarget.value)}
        />
        <input
          type="password"
          placeholder="Password"
          maxLength={50}
          minLength={8}
          required
          onInput={e => setPasswordInput(e.currentTarget.value)}
        />
        <button onClick={loginButton} disabled={!valid || loading}>
          Login
          {loading && <Loading iconOnly={true} size="1em"></Loading>}
        </button>

        <div style={{ textAlign: "center" }}>or</div>

        <button onClick={githubLogin}>
          <i className="fa-brands fa-github" />
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}

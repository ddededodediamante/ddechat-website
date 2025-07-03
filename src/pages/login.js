import axios from "axios";
import config from "../config.js";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";

export default function Login() {
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [valid, setValid] = useState(false);

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

    await axios
      .put(config.apiUrl + "/users/login", { username, password })
      .then((data) => {
        document.querySelector(".login-form button").innerText =
          "Logging in...";
        localStorage.setItem("accountToken", data.data.token);
        window.location.href = "/posts";
      })
      .catch((error) => {
        console.error(error);

        return Swal.fire({
          title: "Login Failed",
          text: error?.response?.data?.error ?? error,
          animation: true,
        });
      });
  }

  return (
    <>
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
            required={true}
            onInput={(e) => setUsernameInput(e.currentTarget.value)}
          />
          <input
            type="password"
            placeholder="Password"
            maxLength={50}
            minLength={8}
            required={true}
            onInput={(e) => setPasswordInput(e.currentTarget.value)}
          />
          <button
            onClick={loginButton}
            disabled={!valid}
            aria-disabled={!valid}
          >
            Login
          </button>
        </div>
      </div>
    </>
  );
}

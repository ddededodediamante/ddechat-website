import axios from "axios";
import config from "../config.json";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";

export default function Login() {
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let isValid = true;

    if (usernameInput.length < 3 || usernameInput.length > 20) isValid = false;
    if (passwordInput.length < 8 || passwordInput.length > 50) isValid = false;

    setValid(isValid);
  }, [usernameInput, passwordInput]);

  async function loginButton() {
    if (!valid) return Swal.fire({
      title: "Invalid Input/s",
      text: 'One or more inputs are invalid, please make sure they are valid first!',
      animation: true
    });

    const username = document.querySelector('.loginInput[type="text"]').value;
    const password = document.querySelector('.loginInput[type="password"]').value;

    await axios
      .put(config.apiUrl + "/users/login", { username, password })
      .then((data) => {
        document.querySelector("button.loginButton").innerText = "Logging in...";
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
      <Helmet>
        <title>ddeChat - Login</title>
        <meta name="description" content="Login to an account in ddeChat." />
        <meta property="og:image" content="%PUBLIC_URL%/files/logo.png" />
      </Helmet>

      <div className="login-container">
        <h1>
          Login to <strong>ddeChat</strong>
        </h1>

        <Link to="/sign">No account? Sign up instead!</Link>

        <div className="loginForm">
          <input
            type="text"
            placeholder="Username"
            className="loginInput"
            maxLength={20}
            minLength={3}
            required={true}
            onInput={(e) => setUsernameInput(e.currentTarget.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="loginInput"
            maxLength={50}
            minLength={8}
            required={true}
            onInput={(e) => setPasswordInput(e.currentTarget.value)}
          />
          <button
            className="loginButton"
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

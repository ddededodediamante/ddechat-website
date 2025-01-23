import axios from 'axios';
import config from '../config.json';
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";

export default function Login() {
  async function loginButton() {
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
        />
        <input
          type="password"
          placeholder="Password"
          className="loginInput"
          maxLength={50}
          minLength={8}
          required={true}
        />
        <button className="loginButton" onClick={loginButton}>
          Login
        </button>
      </div>
    </div>
  );
}

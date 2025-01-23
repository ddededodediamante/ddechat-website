import axios from 'axios';
import config from '../config.json';
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";

export default function Login() {
  async function signButton() {
    const username = document.querySelector('.loginInput[type="text"]').value;
    const password = document.querySelector('.loginInput[type="password"]').value;

    await axios
      .post(config.apiUrl + "/users/create", { username, password })
      .then((data) => {
        document.querySelector("button.loginButton").innerText = "Logging in...";
        localStorage.setItem("accountToken", data.data.token);
        window.location.href = "/posts";
      })
      .catch((error) => {
        console.error(error);

        return Swal.fire({
          title: "Sign Up Failed",
          text: error?.response?.data?.error ?? error,
          animation: true,
        });
      });
  }

  return (
    <div className="login-container">
      <h1>
        Sign up to <strong>ddeChat</strong>
      </h1>

      <Link to="/login">Already have an account? Login instead!</Link>

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
        <button className="loginButton" onClick={signButton}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

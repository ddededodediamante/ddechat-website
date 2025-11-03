import axios from "axios";
import { useEffect, useState } from "react";
import config from "../config.js";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import cache from "../cache.ts";

export default function Settings() {
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  localStorage.setItem("accountToken", token);

  const password = urlParams.get("password");
  const auth = urlParams.get("auth");
  const isNew = urlParams.get("isNew") === "true";

  return (
    <>
      <div className="panel-content">
        <h1>Authentication Successful</h1>
        <p>You have successfully logged in using {auth}!</p>
        {isNew && (
          <>
            <br />
            <strong>Note:</strong> A new account has been created for you
            automatically. Your password is: <code>{password}</code>
          </>
        )}
        <a href="/posts">Go to main page</a>
      </div>
    </>
  );
}

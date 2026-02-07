import { useEffect } from "react";

export default function Auth() {
  const urlParams = new URLSearchParams(window.location.search);

  const token = urlParams.get("token");
  const password = urlParams.get("password");
  const auth = urlParams.get("auth") || "something";
  const flow = urlParams.get("flow");

  if (token !== null) localStorage.setItem("accountToken", token);

  useEffect(() => {
    if (flow === "login") {
      window.location.replace("/posts");
    }
  }, [flow]);

  if (flow === "login") return null;

  return (
    <div className="panel-content">
      <p className="title">
        <i className="fa-solid fa-user" />
        Authentication Successful
      </p>

      <div className="line" />

      <strong>
        You have successfully logged in using <strong>{auth}</strong>!
      </strong>

      {flow === "new" && (
        <>
          <p>A new account has been created for you automatically.</p>
          <p>
            Your temporary password is:{" "}
            <code>{password ?? "unknown"}</code>
          </p>
          <p className="grey">
            Please change your password as soon as possible for security reasons.
          </p>
        </>
      )}

      {flow === "linked" && (
        <p>
          You can now access your account using <strong>{auth}</strong>.
        </p>
      )}

      <a href="/posts">Go to main page</a>
    </div>
  );
}

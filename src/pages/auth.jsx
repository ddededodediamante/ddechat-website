export default function Auth() {
  const urlParams = new URLSearchParams(window.location.search);

  const token = urlParams.get("token");
  const password = urlParams.get("password");
  urlParams.delete("token");
  urlParams.delete("password");

  if (token !== null) localStorage.setItem("accountToken", token);

  const auth = urlParams.get("auth") || "something";
  const isNew = urlParams.get("isNew") === "true";

  return (
    <>
      <div className="panel-content">
        <p className="title">
          <i className="fa-solid fa-user" />
          Authentication Successful
        </p>
        <div className="line" />
        <strong>
          You have successfully logged in using <strong>{auth}</strong>!
        </strong>
        {isNew ? (
          <>
            A new account has been created for you automatically.
            <br />
            <p>
              Your temporary password is: <code>{password ?? "unknown"}</code>
            </p>
            <p className="grey">
              Please change your password after logging in for security reasons.
            </p>
          </>
        ) : <p>You can now access your account using <strong>{auth}</strong>.</p>}
        <a href="/posts">Go to main page</a>
      </div>
    </>
  );
}

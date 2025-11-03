export default function Auth() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");
  localStorage.setItem("accountToken", token);

  const password = urlParams.get("password");
  const auth = urlParams.get("auth") || "something";
  const isNew = urlParams.get("isNew") === "true";

  return (
    <>
      <div className="panel-content">
        <h1>Authentication Successful</h1>
        <p>
          You have successfully logged in using <strong>{auth}</strong>!
        </p>
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

import Alert from "../components/Alert.jsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading.jsx";
import cache, { getUserCached } from "../cache.ts";
import api from "../api.js";

export default function Alerts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserCached()
      .then(user => {
        setUser(user);
        setTimeout(() => {
          api
            .patch("/users/alerts/read", {})
            .then(() => {
              if (Array.isArray(cache["user"]?.["alerts"])) {
                cache["user"]["alerts"].forEach(i => {
                  i.read = true;
                });
              }
            })
            .catch(console.error);
        }, 1000);
      })
      .catch(error => {
        console.error(error);
        navigate("/login");
      });
  }, [navigate]);

  return (
    <>
      <div className="panel-content">
        <p className="title">
          <i className="fa-solid fa-bell" />
          Alerts
        </p>
        <div className="line" />
        {user ? (
          user.alerts && user.alerts.length > 0 ? (
            user.alerts
              .sort((a, b) => new Date(b.receivedOn) - new Date(a.receivedOn))
              .map((i, idx) => (
                <Alert key={`${i.receivedOn}-${i.type}-${idx}`} data={i} />
              ))
          ) : (
            "You have no notifications."
          )
        ) : (
          <Loading />
        )}
      </div>
    </>
  );
}

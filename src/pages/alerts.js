import axios from "axios";
import Alert from "../components/Alert";
import { useEffect, useState } from "react";
import config from "../config.js";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";

export default function Alerts() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("accountToken");
    if (token) {
      axios
        .get(`${config.apiUrl}/users/me`, {
          headers: {
            Authorization: token,
          },
        })
        .then((data) => {
          setUser(data.data);

          setTimeout(() => {
            const token = localStorage.getItem("accountToken");
            if (token) {
              axios
                .patch(
                  `${config.apiUrl}/users/me/readAlerts`,
                  {},
                  {
                    headers: {
                      Authorization: token,
                    },
                  }
                )
                .catch((error) => {
                  console.error(error);
                });
            }
          }, 1000);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
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
              .map((i) => <Alert data={i} />)
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

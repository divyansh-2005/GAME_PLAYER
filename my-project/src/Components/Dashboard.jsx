import React, { useEffect, useState } from "react";
import { useTma } from "./tma/hook";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Header from "./Header";

const API_BASE_URL = import.meta.env.VITE_API_KEY;

const Dashboard = () => {
  const { user, isLoading, isError } = useTma();
  const navigate = useNavigate();
  const [message, setMessage] = useState();
  const [currentUser, setCurrentUser] = useState(null);

  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/user/dashboard`)
      .then((res) => {
        // console.log(res);
        if (res.data.valid) {
          setMessage(res.data.valid);
          setCurrentUser(res.data.user);
          // console.log(res.data.user);
        } else {
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  }, [currentUser, message]);

  // if (isLoading) {
  //   return <div style={{ color: "white" }}>Loading...</div>;
  // }

  // if (isError) {
  //   return (
  //     <div style={{ color: "white" }}>
  //       This app opens only in Telegram mini app
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return <div style={{ color: "white" }}>No user data available</div>;
  // }

  return (
    <>
      <Header />
      {currentUser ? (
        <div>
          <center>
            {" "}
            <p style={{ color: "white" }} className="text-6xl m-4">
              Dashboard
            </p>
          </center>
          <p style={{ color: "white" }}>Name: {currentUser.name}</p>
          <p style={{ color: "white" }}>Username: {currentUser.username}</p>
          <p style={{ color: "white" }}>Points: {currentUser.points}</p>
        </div>
      ) : (
        <span>Loading...</span>
      )}
    </>
  );
};

export default Dashboard;

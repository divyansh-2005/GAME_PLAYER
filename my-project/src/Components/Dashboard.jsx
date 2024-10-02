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

  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/user/dashboard`)
      .then((res) => {
        // console.log(res);
        if (res.data.valid) {
          setMessage(res.data.valid);
        } else {
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  });

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
      <div className="text-white text-4xl">logged in successfully</div>
      <span className="text-white text-xl">
        <Link to="/">go to home</Link>
      </span>
    </>

    // <div>
    //   <h1 style={{ color: "white" }}>Dashboard</h1>
    //   <p style={{ color: "white" }}>
    //     Name: {user.firstName} {user.lastName}
    //   </p>
    //   <p style={{ color: "white" }}>Username: {user.username}</p>
    //   <p style={{ color: "white" }}>Points: {user.points}</p>
    // </div>
  );
};

export default Dashboard;

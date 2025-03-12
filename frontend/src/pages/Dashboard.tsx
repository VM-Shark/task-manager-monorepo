import { useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth?.token) {
      navigate("/login");
    }
  }, [auth, navigate]);

  return <h1>Welcome to your Dashboard, {auth?.user?.name}!</h1>;
};

export default Dashboard;

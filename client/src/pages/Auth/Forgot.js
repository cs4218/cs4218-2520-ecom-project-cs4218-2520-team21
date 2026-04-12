// Xenos Fiorenzo Anong, A0257672U
import React, { useState } from "react";
import Layout from "../../components/Layout";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import "../../styles/AuthStyles.css";
import { useAuth } from "../../context/auth";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [answer, setAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [auth, setAuth] = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  // form function
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/auth/forgot-password", {
        email,
        answer,
        newPassword,
      });
      if (res && res.data.success) {
        toast.success(res.data && res.data.message, {
          duration: 5000,
          icon: "🙏",
          style: {
            background: "green",
            color: "white",
          },
        });
        setAuth({
          ...auth,
          user: null,
          token: "",
        });
        localStorage.removeItem("auth");
        navigate("/login");
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      console.log(error);
      if (error.response) {
        if (error.response.status === 500) {
          toast.error("Something went wrong");
        } else if (error.response.data) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Something went wrong");
        }
      } else {
        toast.error("Something went wrong");
      }
    }
  };
  return (
    <Layout title="Forgot Password - Ecommerce App">
      <div className="form-container " style={{ minHeight: "90vh" }}>
        <form onSubmit={handleSubmit}>
          <h4 className="title">FORGOT PASSWORD</h4>

          <div className="mb-3">
            <input
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              id="exampleInputEmail1"
              placeholder="Enter Your Email "
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="form-control"
              id="exampleInputanswer1"
              placeholder="What is Your Favorite sports"
              required
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="form-control"
              id="exampleInputPassword1"
              placeholder="Enter New Password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary">
            RESET PASSWORD
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default Forgot;

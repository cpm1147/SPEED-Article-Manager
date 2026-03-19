/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import landingStyles from "@/styles/Landing.module.scss";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function Home() {
  const router = useRouter();

  const [showWarning, setShowWarning] = useState(true);

  const [registerFormData, setRegisterFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [loginFormData, setLoginFormData] = useState({
    email: "",
    password: "",
  });

  const [registerError, setRegisterError] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleRegisterChange = (e: any) => {
    setRegisterFormData({
      ...registerFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginChange = (e: any) => {
    setLoginFormData({
      ...loginFormData,
      [e.target.name]: e.target.value,
    });
  };

  async function handleRegisterSubmit(e: any) {
    e.preventDefault();

    if (
      !registerFormData.first_name ||
      !registerFormData.last_name ||
      !registerFormData.password ||
      !registerFormData.email
    ) {
      setRegisterError("Please complete registration form!");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerFormData),
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("user_id", data._id);
        localStorage.setItem("first_name", data.first_name);
        localStorage.setItem("last_name", data.last_name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);
        localStorage.setItem("access_token", data.access_token);
        router.push(`./articles`);
      }
    } catch (error) {
      console.error(error);
      setRegisterError("Error trying to register!");
    }
  }

  async function handleLoginSubmit(e: any) {
    e.preventDefault();

    if (!loginFormData.password || !loginFormData.email) {
      setLoginError("Please complete login form!");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginFormData), 
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem("user_id", data._id);
        localStorage.setItem("first_name", data.first_name);
        localStorage.setItem("last_name", data.last_name);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);
        localStorage.setItem("access_token", data.access_token);
        router.push(`./articles`);
      }
    } catch (error) {
      console.error(error);
      setRegisterError("Error trying to login!");
    }
  }

  useEffect(() => {
    if (localStorage.getItem("access_token")) {
      router.push("./articles");
    }
  }, [router]);

  return (
    <div className={landingStyles.container}>
      {showWarning && (
        <div className={landingStyles.warningBanner}>
          <span>
            ⚠️ Heads up: The backend runs on a free server that spins down after inactivity. 
            First request may take up to 50 seconds to wake up.
          </span>
          <button onClick={() => setShowWarning(false)}>✕</button>
        </div>
      )}
      <div className={landingStyles.formWrapper}>
        <h1>Software Practice Empirical Evidence Database</h1>
        <div className="flex my-5 w-2/3 space-x-5">
          <form className={landingStyles.form} onSubmit={handleRegisterSubmit}>
            <h2>Register Here:</h2>
            <input
              type="text"
              name="first_name"
              value={registerFormData.first_name}
              onChange={handleRegisterChange}
              placeholder="First Name"
            />
            <input
              type="text"
              name="last_name"
              value={registerFormData.last_name}
              onChange={handleRegisterChange}
              placeholder="Last Name"
            />
            <input
              type="text"
              name="email"
              value={registerFormData.email}
              onChange={handleRegisterChange}
              placeholder="Email"
            />
            <input
              type="password"
              name="password"
              value={registerFormData.password}
              onChange={handleRegisterChange}
              placeholder="Password"
            />
            <div className={landingStyles.error}>
              <p>{registerError}</p>
            </div>
            <button type="submit">REGISTER</button>
          </form>
          <form className={landingStyles.form} onSubmit={handleLoginSubmit}>
            <h2>Or login here:</h2>
            <input
              type="text"
              name="email"
              value={loginFormData.email}
              onChange={handleLoginChange}
              placeholder="Email"
            />
            <input
              type="password"
              name="password"
              value={loginFormData.password}
              onChange={handleLoginChange}
              placeholder="Password"
            />
            <div className={landingStyles.error}>
              <p>{loginError}</p>
            </div>
            <button type="submit">LOGIN</button>
          </form>
        </div>
      </div>
    </div>
  );
}

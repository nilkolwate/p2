import React, { useState } from "react";
import axios from "axios";
import "./AdminLogin.css";

function AdminLogin() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    function handleLogin() {

        axios.post("http://localhost:3000/admin-login", {
            email: email,
            password: password
        })
        .then(function(response) {

            localStorage.setItem("adminEmail", email);

            window.location.href = "/otp";

        })
        .catch(function(error) {

            alert(error.response?.data || "Login failed.");

        });
    }

    return (
        <div className="login-page">

            <div className="login-card">

                <div className="logo-circle">
                    🛡️
                </div>

                <div className="brand-name">
                    BLOCKVAULT
                </div>

                <h1>
                    Admin <span>Login</span>
                </h1>

                <p className="subtitle">
                    Sign in to manage certificates and blockchain records.
                </p>

                <div className="input-group">

                    <label>Administrator Username</label>

                    <div className="input-box">

                        <span className="input-icon">👤</span>

                        <input
                            type="text"
                            placeholder="Enter username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                    </div>

                </div>

                <div className="input-group">

                    <label>Password</label>

                    <div className="input-box">

                        <span className="input-icon">🔒</span>

                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            className="eye-button"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "👁️" : "👁"}
                        </button>

                    </div>

                </div>

                <div className="login-options">

                    <label className="remember">

                        <input type="checkbox" />

                        <span>Remember me</span>

                    </label>

                    <span className="forgot">
                        Forgot password?
                    </span>

                </div>

                <button
                    className="login-button"
                    onClick={handleLogin}
                >
                    Login <span>→</span>
                </button>

            </div>

        </div>
    );
}

export default AdminLogin;
import React, { useState } from "react";
import axios from "axios";
import "./OTP.css";

function OTP() {

    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");

    const email = localStorage.getItem("adminEmail");

    function handleVerify() {

        axios.post("http://localhost:3000/verify-otp", {
            email: email,
            otp: otp
        })
        .then(function(response) {

            setMessage(response.data.message);

        })
        .catch(function(error) {

            setMessage(error.response?.data || "OTP verification failed.");

        });
    }

    return (
        <div className="otp-page">

            <div className="otp-card">

                <div className="otp-logo">
                    🛡️
                </div>

                <div className="otp-brand">
                    BLOCKVAULT
                </div>

                <h1>
                    Verify <span>Identity</span>
                </h1>

                <p className="otp-subtitle">
                    Two-factor authentication
                </p>

                <div className="security-icon">
                    🔐
                </div>

                <h2>Enter Verification Code</h2>

                <p className="otp-description">
                    We have sent a 6-digit verification code to your
                    registered email address.
                </p>

                <div className="otp-input-box">

                    <input
                        type="text"
                        maxLength="6"
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />

                </div>

                <button
                    className="verify-button"
                    onClick={handleVerify}
                >
                    Verify OTP <span>→</span>
                </button>

                {message && (
                    <p className="otp-message">
                        {message}
                    </p>
                )}

                <p className="secure-text">
                    🔒 Your account is protected with two-factor authentication.
                </p>

            </div>

        </div>
    );
}

export default OTP;
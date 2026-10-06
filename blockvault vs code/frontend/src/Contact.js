import React, { useState } from "react";
import "./Contact.css";

function Contact() {

  const [userEmail, setUserEmail] = useState("");

  function submitBoxProblem(boxId, problemTitle) {

    const box = document.getElementById(boxId);

    if (!box) {
      return;
    }

    const textarea = box.querySelector("textarea");

    if (!textarea) {
      return;
    }

    if (userEmail.trim() === "") {
      alert("Please enter your email address.");
      return;
    }

    if (textarea.value.trim() === "") {
      alert("Please describe the problem you are facing.");
      return;
    }

    fetch("http://localhost:3000/support", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        userEmail: userEmail,

        problem:
          problemTitle +
          ":\n" +
          textarea.value

      })

    })

      .then((response) => response.text())

      .then((result) => {

        alert(result);

        textarea.value = "";

      })

      .catch((error) => {

        console.log(error);

        alert("Failed to submit problem.");

      });

  }


  function showProblemBox(boxId) {

    const box = document.getElementById(boxId);

    if (box) {
      box.style.display = "block";
    }

  }


  return (

    <div className="contact-page">


      {/* Header */}

      <div className="contact-header">

        <h1>BlockVault</h1>

        <p>Help & Support Center</p>

      </div>


      <div className="contact-container">


        {/* Left Side */}

        <div className="help-section">


          <h2>How can we help you?</h2>

          <p className="help-description">

            Select the problem you are facing while using BlockVault.

          </p>


          <div className="problem-list">


            {/* Certificate Problem */}

            <div className="problem-item">

              <h3>Certificate Problem</h3>

              <p>

                Having a problem with your certificate or certificate details?

              </p>


              <button

                onClick={() =>
                  showProblemBox("certificate-problem-box")
                }

              >

                Get Help

              </button>


              <div

                id="certificate-problem-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "certificate-problem-box",

                      "Certificate Problem"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>



            {/* QR Code Not Working */}

            <div className="problem-item">

              <h3>QR Code Not Working</h3>

              <p>

                QR code is not opening or is not showing the certificate.

              </p>


              <button

                onClick={() =>
                  showProblemBox("qr-problem-box")
                }

              >

                Get Help

              </button>


              <div

                id="qr-problem-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "qr-problem-box",

                      "QR Code Not Working"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>



            {/* Certificate Verification Problem */}

            <div className="problem-item">

              <h3>Certificate Verification Problem</h3>

              <p>

                Certificate verification is failing or showing an unexpected result.

              </p>


              <button

                onClick={() =>
                  showProblemBox("verification-problem-box")
                }

              >

                Get Help

              </button>


              <div

                id="verification-problem-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "verification-problem-box",

                      "Certificate Verification Problem"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>



            {/* Certificate Not Found */}

            <div className="problem-item">

              <h3>Certificate Not Found</h3>

              <p>

                Your certificate cannot be found using the certificate ID.

              </p>


              <button

                onClick={() =>
                  showProblemBox("not-found-problem-box")
                }

              >

                Get Help

              </button>


              <div

                id="not-found-problem-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "not-found-problem-box",

                      "Certificate Not Found"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>



            {/* Login Problem */}

            <div className="problem-item">

              <h3>Login Problem</h3>

              <p>

                Having trouble logging into your BlockVault account?

              </p>


              <button

                onClick={() =>
                  showProblemBox("login-problem-box")
                }

              >

                Get Help

              </button>


              <div

                id="login-problem-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "login-problem-box",

                      "Login Problem"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>



            {/* OTP Problem */}

            <div className="problem-item">

              <h3>OTP Problem</h3>

              <p>

                OTP is not received, incorrect, or has expired.

              </p>


              <button

                onClick={() =>
                  showProblemBox("otp-problem-box")
                }

              >

                Get Help

              </button>


              <div

                id="otp-problem-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "otp-problem-box",

                      "OTP Problem"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>



            {/* Forgot Password */}

            <div className="problem-item">

              <h3>Forgot Password</h3>

              <p>

                Forgot your password and cannot access your account?

              </p>


              <button

                onClick={() =>
                  showProblemBox("forgot-password-box")
                }

              >

                Get Help

              </button>


              <div

                id="forgot-password-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "forgot-password-box",

                      "Forgot Password"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>



            {/* Other Problem */}

            <div className="problem-item">

              <h3>Other Problem</h3>

              <p>

                Facing another problem that is not listed above?

              </p>


              <button

                onClick={() =>
                  showProblemBox("other-problem-box")
                }

              >

                Get Help

              </button>


              <div

                id="other-problem-box"

                style={{

                  display: "none",

                  marginTop: "15px"

                }}

              >


                <input

                  type="email"

                  placeholder="Enter your email address"

                  value={userEmail}

                  onChange={(e) =>
                    setUserEmail(e.target.value)
                  }

                  style={{

                    width: "100%",

                    padding: "12px",

                    marginBottom: "10px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box"

                  }}

                />


                <textarea

                  placeholder="Describe the problem you are facing..."

                  rows="5"

                  style={{

                    width: "100%",

                    padding: "12px",

                    borderRadius: "10px",

                    border: "1px solid #ddd",

                    boxSizing: "border-box",

                    resize: "vertical"

                  }}

                ></textarea>


                <button

                  style={{

                    marginTop: "10px"

                  }}

                  onClick={() =>

                    submitBoxProblem(

                      "other-problem-box",

                      "Other Problem"

                    )

                  }

                >

                  Submit Problem

                </button>


              </div>

            </div>


          </div>


          {/* Right Side */}

          <div className="contact-side">


            <div className="support-card">

              <h2>Need More Help?</h2>

              <p>

                If you cannot solve your problem using the help options,

                submit your problem to the BlockVault support team.

              </p>

              <button className="submit-problem">

                Submit Your Problem

              </button>

            </div>


            <div className="contact-card">

              <h2>BlockVault Support</h2>


              <div className="contact-info">

                <span>📧</span>

                <div>

                  <small>EMAIL</small>

                  <p>blockvault0926@gmail.com</p>

                </div>

              </div>


              <div className="contact-info">

                <span>🛡️</span>

                <div>

                  <small>SUPPORT</small>

                  <p>

                    Certificate Verification & Technical Support

                  </p>

                </div>

              </div>


            </div>


          </div>


        </div>


      </div>


    </div>

  );

}


export default Contact;
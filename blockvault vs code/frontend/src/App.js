import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";
import Contact from "./Contact";
import AdminLogin from "./AdminLogin";
import OTP from "./OTP";

function App() {

  

  const [showForm, setShowForm] = useState(false);
  const [showBlockchain, setShowBlockchain] = useState(false);
  const [blockchainData, setBlockchainData] = useState([]);

  const [showVerify, setShowVerify] = useState(false);
  const [certificateId, setCertificateId] = useState("");
  const [verifyResult, setVerifyResult] = useState("");

  const [showDetails, setShowDetails] = useState(false);
  const [detailsId, setDetailsId] = useState("");
  const [certificateDetails, setCertificateDetails] = useState(null);

  const [showRevoke, setShowRevoke] = useState(false);
  const [revokeId, setRevokeId] = useState("");
  const [revokeResult, setRevokeResult] = useState("");

  const [studentId, setStudentId] = useState("");
  const [certificateName, setCertificateName] = useState("");
  const [issueDate, setIssueDate] = useState("");

  useEffect(() => {
    const currentPath = window.location.pathname;

    if (currentPath.startsWith("/verify/")) {
      const id = currentPath.split("/")[2];

      axios.get("http://localhost:3000/certificate/" + id)
        .then(response => {
          setCertificateDetails(response.data);
          setShowDetails(true);
        })
        .catch(error => {
          console.log(error);
        });
    }
  }, []);

    const path = window.location.pathname;

  if (path === "/contact") {
    return <Contact />;
  }

  if (path === "/admin") {
  return <AdminLogin />;
}

if (path === "/otp") {
  return <OTP />;
}
  
  const createCertificate = () => {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first");
      return;
    }

    axios.post(
      "http://localhost:3000/certificate",
      {
        student_id: studentId,
        certificate_name: certificateName,
        issue_date: issueDate
      },
      {
        headers: {
          Authorization: "Bearer " + token
        }
      }
    )
    .then(response => {
      alert("Certificate created successfully");
      setStudentId("");
      setCertificateName("");
      setIssueDate("");
      setShowForm(false);
    })
    .catch(error => {
      console.log(error);
      alert("Certificate creation failed");
    });
  };

  return (
    <div style={{
      width: "600px",
      margin: "50px auto",
      padding: "30px",
      border: "2px solid #333",
      borderRadius: "10px",
      fontFamily: "Arial",
      textAlign: "center"
    }}>

      <h1>BLOCKVAULT</h1>

      <h2>Admin Dashboard</h2>

      <hr />

      <button
        onClick={() => setShowForm(true)}
        style={{ margin: "10px", padding: "12px 25px" }}
      >
        Create Certificate
      </button>

      {showForm && (
        <div style={{ marginTop: "20px" }}>

          <h3>Create Certificate</h3>

          <input
            type="number"
            placeholder="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
          />

          <br /><br />

          <input
            type="text"
            placeholder="Certificate Name"
            value={certificateName}
            onChange={(e) => setCertificateName(e.target.value)}
          />

          <br /><br />

          <input
            type="date"
            value={issueDate}
            onChange={(e) => setIssueDate(e.target.value)}
          />

          <br /><br />

          <button
            onClick={createCertificate}
            style={{ padding: "10px 20px" }}
          >
            Create
          </button>

        </div>
      )}

      <br />

      <button
        onClick={() => setShowVerify(true)}
        style={{ margin: "10px", padding: "12px 25px" }}
      >
        Verify Certificate
      </button>

      {showVerify && (
        <div style={{ marginTop: "20px" }}>

          <h3>Verify Certificate</h3>

          <input
            type="number"
            placeholder="Certificate ID"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
          />

          <br /><br />

          <button
            onClick={() => {

              axios.get(
                "http://localhost:3000/verify/" + certificateId
              )
              .then(response => {
                setVerifyResult(response.data);
              })
              .catch(error => {
                console.log(error);
                setVerifyResult("Verification failed");
              });

            }}
            style={{ padding: "10px 20px" }}
          >
            Verify
          </button>

          {verifyResult && (
            <p style={{
              marginTop: "15px",
              fontWeight: "bold"
            }}>
              {verifyResult}
            </p>
          )}

        </div>
      )}

      <br />

      <button
        onClick={() => setShowDetails(true)}
        style={{ margin: "10px", padding: "12px 25px" }}
      >
        View Certificate Details
      </button>

      {showDetails && (
        <div style={{ marginTop: "20px" }}>

          <h3>Certificate Details</h3>

          <input
            type="number"
            placeholder="Certificate ID"
            value={detailsId}
            onChange={(e) => setDetailsId(e.target.value)}
          />

          <br /><br />

          <button
            onClick={() => {

              axios.get(
                "http://localhost:3000/certificate/" + detailsId
              )
              .then(response => {
                setCertificateDetails(response.data);
              })
              .catch(error => {
                console.log(error);
                alert("Certificate not found");
              });

            }}
            style={{ padding: "10px 20px" }}
          >
            Get Details
          </button>

          {certificateDetails && (
            <div style={{
              marginTop: "15px",
              textAlign: "left"
            }}>

              <p>
                <b>Certificate ID:</b>
                {" "}{certificateDetails.certificate_id}
              </p>

              <p>
                <b>Student ID:</b>
                {" "}{certificateDetails.student_id}
              </p>

              <p>
                <b>Certificate Name:</b>
                {" "}{certificateDetails.certificate_name}
              </p>

              <p>
                <b>Issue Date:</b>
                {" "}{certificateDetails.issue_date}
              </p>

              <p>
                <b>Status:</b>
                {" "}{certificateDetails.status}
              </p>

              <p>
                <b>Hash:</b>
                {" "}{certificateDetails.hash}
              </p>

            </div>
          )}

        </div>
      )}

      <br />

      <button
        onClick={() => setShowRevoke(true)}
        style={{ margin: "10px", padding: "12px 25px" }}
      >
        Revoke Certificate
      </button>

      {showRevoke && (
        <div style={{ marginTop: "20px" }}>

          <h3>Revoke Certificate</h3>

          <input
            type="number"
            placeholder="Certificate ID"
            value={revokeId}
            onChange={(e) => setRevokeId(e.target.value)}
          />

          <br /><br />

          <button
            onClick={() => {

              const token = localStorage.getItem("token");

              axios.put(
                "http://localhost:3000/revoke/" + revokeId,
                {},
                {
                  headers: {
                    Authorization: "Bearer " + token
                  }
                }
              )
              .then(response => {
                setRevokeResult(response.data);
              })
              .catch(error => {
                console.log(error);
                setRevokeResult("Revocation failed");
              });

            }}
            style={{ padding: "10px 20px" }}
          >
            Revoke
          </button>

          {revokeResult && (
            <p style={{
              marginTop: "15px",
              fontWeight: "bold"
            }}>
              {revokeResult}
            </p>
          )}

        </div>
      )}

      <br />

      <button
        onClick={() => {

          const token = localStorage.getItem("token");

          axios.get(
            "http://localhost:3000/blockchain",
            {
              headers: {
                Authorization: "Bearer " + token
              }
            }
          )
          .then(response => {
            setBlockchainData(response.data);
            setShowBlockchain(true);
          })
          .catch(error => {
            console.log(error);
            alert("Failed to load blockchain");
          });

        }}
        style={{ margin: "10px", padding: "12px 25px" }}
      >
        View Blockchain
      </button>

      {showBlockchain && (
        <div style={{ marginTop: "20px" }}>

          <h3>Blockchain Records</h3>

          {blockchainData.map((block) => (

            <div
              key={block.block_id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                margin: "10px"
              }}
            >

              <p>
                <b>Block ID:</b> {block.block_id}
              </p>

              <p>
                <b>Certificate ID:</b> {block.certificate_id}
              </p>

              <p>
                <b>Action:</b> {block.action}
              </p>

              <p>
                <b>Previous Hash:</b> {block.previous_hash}
              </p>

              <p>
                <b>Block Hash:</b> {block.block_hash}
              </p>

            </div>

          ))}

        </div>
      )}

    </div>
  );
}

export default App;
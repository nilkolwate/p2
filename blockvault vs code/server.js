require("dotenv").config();

const db = require("./database");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const auth = require("./routes/auth");
const sendSupportEmail = require("./routes/support");

const app = express();

app.use(bodyParser.json());
app.use(cors());


// ADMIN LOGIN
app.post("/admin-login", function(req, res) {
    auth.loginAdmin(req, res);
});


// OTP VERIFICATION
app.post("/verify-otp", function(req, res) {
    auth.verifyOTP(req, res);
});


// SUPPORT
app.post("/support", function(req, res) {

    console.log("SUPPORT ROUTE HIT");
    console.log(req.body);

    sendSupportEmail(req, res);

});

app.listen(3000, function() {
    console.log("Server running on port 3000");
});
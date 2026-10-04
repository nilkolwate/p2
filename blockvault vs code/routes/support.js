const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

function sendSupportEmail(req, res) {

    const problem = req.body.problem;
    const userEmail = req.body.userEmail;

    if (!userEmail || userEmail.trim() === "") {
        res.status(400).send("Please enter your email address.");
        return;
    }

    if (!problem || problem.trim() === "") {
        res.status(400).send("Please describe the problem.");
        return;
    }

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: "blockvault.support@gmail.com",
        replyTo: userEmail,
        subject: "BlockVault Support Problem",
        text:
            "User Email: " + userEmail +
            "\n\nProblem:\n" + problem
    };

    transporter.sendMail(mailOptions, function(err, info) {

        if (err) {
            console.log("Email sending failed:", err.message);
            res.status(500).send("Failed to send problem.");
            return;
        }

        console.log("Support email sent successfully");
        res.send("Problem submitted successfully.");

    });
}

module.exports = sendSupportEmail;
const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

console.log("in backend");

// Configure CORS options
const allowedOrigins = [
  "http://localhost:3000",
  "https://vacationnerja.com",
  "https://www.vacationnerja.com",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
// Middleware
app.use(cors(corsOptions)); // Enable CORS for cross-origin requests
app.use(bodyParser.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Email configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.get("/hello", (req, res) => {
  res.json({ message: "hello world" });
});
// POST endpoint for handling form submissions
app.post("/send-email", (req, res) => {
  console.log("in backend app.post");

  const {
    fullName,
    email,
    phone,
    checkInDate,
    checkOutDate,
    totalAdults,
    totalChildren,
    childrenAges,
    apartment,
    apartmentId,
    nights,
    estimatedPrice,
    message,
  } = req.body;

  // Determine recipient based on apartment
  const recipientEmail = apartmentId === 'casa-stella'
    ? (process.env.EMAIL_TO_STELLA || process.env.EMAIL_TO)
    : (process.env.EMAIL_TO_MIA || process.env.EMAIL_TO);

  const apartmentName = apartment || 'VacationNerja';

  // Email content
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    cc: process.env.EMAIL_CC,
    subject: `New Booking Request - ${apartmentName}`,
    html: `
      <h2>New Booking Request - ${apartmentName}</h2>
      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Apartment:</strong> ${apartmentName}</p>
      <p><strong>Check-in Date:</strong> ${checkInDate}</p>
      <p><strong>Check-out Date:</strong> ${checkOutDate}</p>
      <p><strong>Nights:</strong> ${nights || 'N/A'}</p>
      <p><strong>Estimated Price:</strong> ${estimatedPrice ? '€' + estimatedPrice : 'N/A'}</p>
      <p><strong>Total Adults:</strong> ${totalAdults}</p>
      <p><strong>Total Children:</strong> ${totalChildren}</p>
      ${childrenAges && childrenAges.length > 0 ? childrenAges.map(age => `<p><strong>Child Age:</strong> ${age}</p>`).join('') : ''}
      ${message ? `<p><strong>Message:</strong> ${message}</p>` : ''}
    `,
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error); // Log the error
      return res.status(500).send("Error sending email");
    }
    console.log("Email sent:", info.response);
    res.status(200).send("Email sent successfully");
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

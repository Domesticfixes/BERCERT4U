require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API to send emails
app.post("/send-emails", async (req, res) => {
  const {
    customerEmail,
    handymanEmail,
    customerDetails,
    handymanDetails,
    quoteAmount,
  } = req.body;

  try {
    // Email to the customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: "Your BER Certificate Booking with BERCERT4U is Confirmed!",
      text: `Dear ${customerDetails.name},

Thank you for choosing BERCERT4U! Your booking has been successfully confirmed. 

Here are the details of your BER certification appointment:

Assessor Details:
Name: ${handymanDetails.name}
Contact: ${handymanDetails.email}

Booking Details:
Quote Amount: €${quoteAmount}

Customer Details:
Name: ${customerDetails.name}
Contact: ${customerDetails.phone}

Payment Details:
You have paid a booking fee of €20. The remaining balance (€${quoteAmount - 20}) is to be paid directly to the BER Assessor upon completion of the service.

For any questions or further assistance, please reach out to us at domesticfixesie@gmail.com.

We look forward to serving you!

Warm regards,  
The BERCERT4U Team`,
    });

    // Email to the handyman
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: handymanEmail,
      subject: "New BER Certificate Request Assigned to You!",
      text: `Dear ${handymanDetails.name},

We are pleased to inform you that a new BER certificate request has been assigned to you. Here are the details of the booking:

Customer Details:
Name: ${customerDetails.name}
Contact: ${customerDetails.phone}
County: ${customerDetails.county}

Booking Details:
Total Quote Amount: €${quoteAmount}
Balance Due to You: €${quoteAmount - 20} (after deduction of the €20 booking fee)

Important Note:
The customer has paid a booking fee of €20, which has been deducted from the total quote. The remaining balance (€${quoteAmount - 20}) will be payable directly by the customer upon successful completion of the service.

Please review the details and prepare for the scheduled appointment. If you have any questions or require assistance, feel free to reach out to us at domesticfixesie@gmail.com.

Thank you for being a valued partner of BERCERT4U. We appreciate your expertise and professionalism in delivering excellent service.

Best regards,  
The BERCERT4U Team`,
    });

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res.status(500).json({ error: "Failed to send emails." });
  }
});


// API to send signup emails
app.post("/send-signup-emails", async (req, res) => {
  const { userEmail, userType, userDetails } = req.body;

  try {
    const subject =
      userType === "customer"
        ? "Welcome to BERCERT4U – Your Account is Ready 🎉"
        : "BERCERT4U Assessor Account Created – Welcome Aboard ✅";
    const text =
      userType === "customer"
        ? `Dear ${userDetails.name},\n\nThank you for signing up with BERCERT4U! Your account has been successfully created, and you can now book a BER assessment with certified professionals.\n\n 
🔹 What’s Next?
✅ Log in to your account: <a href="https://bercert4u.ie/customer_login.html" target="_blank">Customer Login</a>
✅ Book a BER Assessment: <a href="https://bercert4u.ie/customer_form.html" target="_blank"> Customer Form</a>
✅ Need Help? Contact us at domesticfixesie@gmail.com

We’re here to help you make your home energy-efficient! 🚀

Best regards,
BERCERT4U Team
https://bercert4u.ie`;
        : `Dear ${userDetails.name},\n\nWelcome to BERCERT4U! Your account has been successfully created, and you can now start receiving assessment requests from customers.
🔹 Next Steps:
✔️ Log in to your Assessor Portal: Assessor Login
✔️ Update Your Profile & Availability
✔️ Connect with Customers & Schedule Assessments

For any assistance, feel free to reach out to us at domesticfixesie@gmail.com.

We’re excited to have you on board! 🚀

Best regards,
BERCERT4U Team
https://bercert4u.ie`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      text: text,
    });

    res.status(200).json({ message: "Signup email sent successfully!" });
  } catch (error) {
    console.error("Error sending signup email:", error);
    res.status(500).json({ error: "Failed to send signup email." });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

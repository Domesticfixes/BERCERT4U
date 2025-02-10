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

// API to send request submission email
app.post("/send-request-email", async (req, res) => {
  const { customerEmail, customerDetails, requestDetails, isSignedUp } = req.body;

  if (!customerEmail || !customerDetails || !requestDetails) {
    return res.status(400).json({ error: "Missing required fields in the request body." });
  }

  try {
    // Email content
    const subject = "Thank You for Submitting Your Request - BERCERT4U";
    const html = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <p>Dear ${customerDetails.name},</p>
          <p>Thank you for submitting your BER certificate request with <strong>BERCERT4U</strong>!</p>
          <p><strong>Request Details:</strong></p>
          <ul>
            <li><strong>Property Type:</strong> ${requestDetails.propertyType}</li>
            <li><strong>Property Size:</strong> ${requestDetails.propertySize} sq.ft</li>
            <li><strong>Bedrooms:</strong> ${requestDetails.bedrooms}</li>
            <li><strong>Preferred Date:</strong> ${requestDetails.preferredDate}</li>
            <li><strong>County:</strong> ${requestDetails.county}</li>
          </ul>
          <p>Our certified BER assessors will review your request and provide quotes shortly.</p>
          
          ${
            isSignedUp
              ? `<p>You can log in to your account to view and accept quotes: <a href="https://bercert4u.ie/customer_login.html" target="_blank" style="color: #007BFF;">Log In</a></p>`
              : `<p><strong>Not signed up yet?</strong> You can't view your profile or see quotes unless you sign up! <a href="https://bercert4u.ie/customer_signup.html" target="_blank" style="color: #007BFF;">Sign Up Now</a> to access all features.</p>`
          }
          
          <p>If you have any questions, feel free to contact us at <a href="mailto:domesticfixesie@gmail.com">domesticfixesie@gmail.com</a>.</p>
          <p>Thank you for choosing <strong>BERCERT4U</strong> to make your home energy efficient!</p>
          <p>Best regards,<br><strong>BERCERT4U Team</strong><br><a href="https://bercert4u.ie" target="_blank">https://bercert4u.ie</a></p>
        </body>
      </html>
    `;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: subject,
      html: html,
    });

    res.status(200).json({ message: "Request submission email sent successfully!" });
  } catch (error) {
    console.error("Error sending request submission email:", error.message);
    res.status(500).json({ error: "Failed to send request submission email." });
  }
});


// API to send signup emails
app.post("/send-signup-emails", async (req, res) => {
  const { userEmail, userType, userDetails } = req.body;

  try {
    // Email Subject
    const subject =
      userType === "customer"
        ? "Welcome to BERCERT4U – Your Account is Ready 🎉"
        : "BERCERT4U Assessor Account Created – Welcome Aboard ✅";

    // Email HTML Content
    const html =
      userType === "customer"
        ? `<!DOCTYPE html>
           <html>
             <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
               <p>Dear ${userDetails.name},</p>
               <p>Thank you for signing up with <strong>BERCERT4U</strong>! Your account has been successfully created, and you can now book a BER assessment with certified professionals.</p>
               <p><strong>What’s Next?</strong></p>
               <ul>
                 <li>✅ <a href="https://bercert4u.ie/customer_login.html" target="_blank">Log in to your account</a></li>
                 <li>✅ <a href="https://bercert4u.ie/customer_form.html" target="_blank">Book a BER Assessment</a></li>
                 <li>✅ Need Help? Contact us at <a href="mailto:domesticfixesie@gmail.com">domesticfixesie@gmail.com</a></li>
               </ul>
               <p>We’re here to help you make your home energy-efficient! 🚀</p>
               <p>Best regards,<br><strong>BERCERT4U Team</strong><br><a href="https://bercert4u.ie" target="_blank">https://bercert4u.ie</a></p>
             </body>
           </html>`
        : `<!DOCTYPE html>
           <html>
             <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
               <p>Dear ${userDetails.name},</p>
               <p>Welcome to <strong>BERCERT4U</strong>! Your account has been successfully created, and you can now start receiving assessment requests from customers.</p>
               <p><strong>Next Steps:</strong></p>
               <ul>
                 <li>✔️ <a href="https://bercert4u.ie/ber_login.html" target="_blank">Log in to your Assessor Portal</a></li>
                 <li>✔️ Provide quotes for customer requests</li>
                 <li>✔️ Connect with Customers & Schedule Assessments</li>
               </ul>
               <p>For any assistance, feel free to reach out to us at <a href="mailto:domesticfixesie@gmail.com">domesticfixesie@gmail.com</a>.</p>
               <p>We’re excited to have you on board! 🚀</p>
               <p>Best regards,<br><strong>BERCERT4U Team</strong><br><a href="https://bercert4u.ie" target="_blank">https://bercert4u.ie</a></p>
             </body>
           </html>`;

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: subject,
      html: html, // Use HTML content
    });

    res.status(200).json({ message: "Signup email sent successfully!" });
  } catch (error) {
    console.error("Error sending signup email:", error);
    res.status(500).json({ error: "Failed to send signup email." });
  }
});

// API to send "New Quote Available" email
app.post("/send-new-quote-email", async (req, res) => {
  const { customerEmail, customerDetails, handymanDetails, quoteAmount } = req.body;

  if (!customerEmail || !customerDetails || !handymanDetails || !quoteAmount) {
    return res.status(400).json({ error: "Missing required fields in the request body." });
  }

  try {
    // Log details for debugging
    console.log("Customer Email:", customerEmail);
    console.log("Customer Details:", customerDetails);
    console.log("Handyman Details:", handymanDetails);
    console.log("Quote Amount:", quoteAmount);

    // Email to the customer
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: "A New Quote is Available for Your BER Certification",
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <p>Dear ${customerDetails.name},</p>
            <p>We’re pleased to inform you that a BER assessor has provided a quote for your certification request.</p>
            <p><strong>Quote Details:</strong></p>
            <ul>
              <li><strong>Assessor Name:</strong> ${handymanDetails.name}</li>
              <li><strong>Quote Amount:</strong> €${quoteAmount}</li>
            </ul>
            <p>To review the details and accept the quote:</p>
            <p><a href="https://bercert4u.ie/customer_login.html" target="_blank" style="color: #007BFF;">Click Here to View and Confirm the Quote</a></p>
            <p>If you have any questions or need assistance, please don’t hesitate to contact us at <a href="mailto:domesticfixesie@gmail.com">domesticfixesie@gmail.com</a>.</p>
            <p>Thank you for choosing <strong>BERCERT4U</strong> to support your home energy efficiency journey!</p>
            <p>Best regards,<br><strong>The BERCERT4U Team</strong><br><a href="https://bercert4u.ie" target="_blank">https://bercert4u.ie</a></p>
          </body>
        </html>
      `,
    });

    res.status(200).json({ message: "New quote email sent successfully!" });
  } catch (error) {
    console.error("Error sending new quote email:", error.message);
    res.status(500).json({ error: "Failed to send new quote email." });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

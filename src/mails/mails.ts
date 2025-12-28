import nodemailer from "nodemailer";
import pug from "pug";
import path from "path";

// Create a transporter for Gmail SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to render the Pug template
const renderPugTemplate = (
  templateName: string,
  data: Record<string, any> = {}
) => {
  const filePath = path.join(__dirname, "../views", `${templateName}.pug`);
  return pug.renderFile(filePath, data);
};

// Function to send the verification email
const sendVerificationEmail = async (to: string, code: string) => {
  try {
    // Render the Pug template
    const html = renderPugTemplate("verification", { code });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Verify Your Account",
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error: any) {
    console.error("Error sending email:", error.message);
  }
};

// Function to send the activation email
const sendConfirmationEmail = async (to: string, code: string) => {
  try {
    // Render the Pug template
    const html = renderPugTemplate("confirmation", { code });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Verify Your Account",
      html,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent successfully");
  } catch (error: any) {
    console.error("Error sending email:", error.message);
  }
};

// Function to send the change confirmation email
const sendChangeConfirmationEmail = async (
  to: string,
  type: "password" | "pin" | "email",
  options: { newEmail?: string } = {}
) => {
  try {
    const html = renderPugTemplate("change_confirmation", {
      type,
      newEmail: options.newEmail,
      date: new Date().toLocaleString(),
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: "Account Change Confirmation",
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Change confirmation email sent", info);
  } catch (error: any) {
    console.error("Error sending change confirmation email:", error.message);
  }
};

export {
  sendVerificationEmail,
  sendConfirmationEmail,
  sendChangeConfirmationEmail,
};

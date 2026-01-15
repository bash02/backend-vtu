import { Resend } from "resend";
import pug from "pug";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY!);

// Function to render the Pug template
const renderPugTemplate = (
  templateName: string,
  data: Record<string, any> = {}
) => {
  const filePath = path.join(__dirname, "../views", `${templateName}.pug`);
  return pug.renderFile(filePath, data);
};

// Function to send verification email
const sendVerificationEmail = async (to: string, code: string) => {
  try {
    const html = renderPugTemplate("verification", { code });

    await resend.emails.send({
      from: process.env.RESEND_API_EMAIL!,
      to,
      subject: "Verify Your Account",
      html,
    });
    console.log(`Verification email sent to ${to}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// Function to send confirmation email
const sendConfirmationEmail = async (to: string, code: string) => {
  try {
    const html = renderPugTemplate("confirmation", { code });

    await resend.emails.send({
      from: process.env.RESEND_API_EMAIL!,
      to,
      subject: "Verify Your Account",
      html,
    });
    console.log(`Confirmation email sent to ${to}`);
  } catch (error) {
    console.error("Error sending confirmation email:", error);
  }
};

// Function to send change confirmation email
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

    await resend.emails.send({
      from: process.env.RESEND_API_EMAIL!,
      to,
      subject: "Account Change Confirmation",
      html,
    });
    console.log(`Change confirmation email sent to ${to}`);
  } catch (error) {
    console.error("Error sending change confirmation email:", error);
  }
};

export {
  sendVerificationEmail,
  sendConfirmationEmail,
  sendChangeConfirmationEmail,
};

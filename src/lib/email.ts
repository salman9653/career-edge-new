import "server-only";
import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: "Career Edge <onboarding@resend.dev>",
        to,
        subject,
        html,
      });

      if (error) {
        console.error("Resend error details:", error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (err) {
      console.error("Resend exception encountered:", err);
      return { success: false, error: err };
    }
  } else {
    console.warn("\n==========================================");
    console.warn("⚠️  MOCK EMAIL TRIGGERED (RESEND_API_KEY is not configured)");
    console.warn(`📧 TO: ${to}`);
    console.warn(`📝 SUBJECT: ${subject}`);
    console.warn("==========================================");
    console.warn("HTML CONTENT:");
    console.warn(html);
    console.warn("==========================================\n");
    return { success: true, mock: true };
  }
}

import emailjs from "@emailjs/browser";

// EmailJS public configuration — these are safe to store in code
// Users must replace these with their own EmailJS credentials
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

const TEMPLATE_IDS = {
  booking_request: "booking_request",
  booking_accepted: "booking_accepted",
  booking_declined: "booking_declined",
};

interface EmailParams {
  to_email: string;
  to_name: string;
  from_name: string;
  subject?: string;
  date?: string;
  duration?: string;
  notes?: string;
}

const sendEmail = async (templateId: string, params: EmailParams): Promise<void> => {
  try {
    if (EMAILJS_SERVICE_ID === "YOUR_SERVICE_ID") {
      console.warn("EmailJS not configured — skipping email notification. Update EMAILJS_SERVICE_ID, EMAILJS_PUBLIC_KEY, and template IDs in src/services/email.service.ts");
      return;
    }
    await emailjs.send(EMAILJS_SERVICE_ID, templateId, params as unknown as Record<string, unknown>, EMAILJS_PUBLIC_KEY);
    console.log(`Email sent: ${templateId}`);
  } catch (error) {
    console.error(`Failed to send email (${templateId}):`, error);
  }
};

export const sendBookingRequestEmail = (params: {
  mentorEmail: string;
  mentorName: string;
  studentName: string;
  date: string;
  duration: string;
  subject?: string;
  notes?: string;
}) =>
  sendEmail(TEMPLATE_IDS.booking_request, {
    to_email: params.mentorEmail,
    to_name: params.mentorName,
    from_name: params.studentName,
    subject: params.subject || "General tutoring",
    date: params.date,
    duration: params.duration,
    notes: params.notes,
  });

export const sendBookingAcceptedEmail = (params: {
  studentEmail: string;
  studentName: string;
  mentorName: string;
  date: string;
  duration: string;
  subject?: string;
}) =>
  sendEmail(TEMPLATE_IDS.booking_accepted, {
    to_email: params.studentEmail,
    to_name: params.studentName,
    from_name: params.mentorName,
    subject: params.subject || "General tutoring",
    date: params.date,
    duration: params.duration,
  });

export const sendBookingDeclinedEmail = (params: {
  studentEmail: string;
  studentName: string;
  mentorName: string;
  date: string;
  subject?: string;
}) =>
  sendEmail(TEMPLATE_IDS.booking_declined, {
    to_email: params.studentEmail,
    to_name: params.studentName,
    from_name: params.mentorName,
    subject: params.subject || "General tutoring",
    date: params.date,
  });

import nodemailer from 'nodemailer';

export async function POST(req) {
  const { feedback, rating } = await req.json();

  const transporter = nodemailer.createTransport({
    service: 'Outlook365',
    auth: {
    user: process.env.OUTLOOK_USER,
    pass: process.env.OUTLOOK_PASS,
  },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'tech_mentor_ai@outlook.com',
    subject: 'New Feedback Received',
    text: `Rating: ${rating} stars\n\nFeedback: ${feedback}`, 
  };

  try {
    await transporter.sendMail(mailOptions);
    return new Response(JSON.stringify({ message: 'Feedback sent successfully' }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Error sending feedback' }), { status: 500 });
  }
}

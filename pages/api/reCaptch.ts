import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const RECAPTCHA_SECRET_KEY = process.env.CAPTCH_SECRET_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, message, recaptchaToken } = req.body;

  if (!recaptchaToken) {
    return res.status(400).json({ message: 'reCAPTCHA token is missing' });
  }

  try {
    // Verify reCAPTCHA token
    const recaptchaResponse = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    );

    const { success } = recaptchaResponse.data;

    if (!success) {
      return res.status(400).json({ message: 'reCAPTCHA verification failed' });
    }

    // Handle the contact form submission (e.g., send an email)
    // ...

    return res.status(200).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Auto-response email template
const autoResponseTemplate = {
    subject: 'Thank You for Your Message - Yohannes Goitom',
    text: `Thank you for reaching out!

I appreciate you taking the time to contact me. I have received your message and will review it carefully.

You can expect to hear back from me within 1-2 business days. If your matter is urgent, please feel free to reach out to me directly at ${process.env.EMAIL_USER}.

Best regards,
Yohannes Goitom
Creative Director & Brand Designer`
};

// Handle contact form submissions
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;

    try {
        // Send notification email to you
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Portfolio Contact: ${name}`,
            text: `
Name: ${name}
Email: ${email}
Message: ${message}
            `
        });

        // Send auto-response to the sender
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: autoResponseTemplate.subject,
            text: autoResponseTemplate.text
        });

        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

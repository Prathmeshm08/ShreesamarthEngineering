const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const writeToExcel = require('./utils/excelWriter');

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = http.createServer((req, res) => {
  if (req.method === 'OPTIONS') {
    // Handle CORS preflight
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (req.url === '/contact' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', async () => {
      try {
        const { name, email, phone, message } = JSON.parse(body);

        const formData = {
          Name: name,
          Email: email,
          Phone: phone,
          Message: message,
          Date: new Date().toLocaleString(),
        };

        writeToExcel(formData); // Save to Excel

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: `"SSE Contact Form" <${process.env.EMAIL_USER}>`,
          to: process.env.TO_EMAIL,
          subject: 'New Contact Form Submission',
          text: `
Name: ${name}
Email: ${email}
Phone: ${phone}
Message: ${message}
          `,
        });

        res.writeHead(200, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ success: true, message: 'Form submitted' }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        });
        res.end(JSON.stringify({ success: false, message: 'Server error' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Environment variables for email and SMS services
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// In-memory storage for OTPs (replace with a database in production)
const otpStore = {};

// Generate a random 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Send OTP via Email
async function sendEmailOTP(email, otp) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false, // Ignore self-signed certificate errors
        },
    });

    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Your OTP for Sign-Up',
        text: `Your OTP is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
}

// Send OTP via SMS
async function sendSMSOTP(mobile, otp) {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: TWILIO_PHONE_NUMBER,
        to: mobile,
    });
}

// Netlify Function Handler
exports.handler = async (event, context) => {
    console.log('Received event:', event); // Log the incoming event

    const { action, email, mobile, otp } = JSON.parse(event.body);
    console.log('Parsed data:', { action, email, mobile, otp }); // Log parsed data

    try {
        if (action === 'generate') {
            // Generate OTP
            const generatedOTP = generateOTP();
            otpStore[email] = generatedOTP; // Store OTP for verification

            // Send OTP via Email and SMS
            await sendEmailOTP(email, generatedOTP);
            await sendSMSOTP(mobile, generatedOTP);

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'OTP sent successfully' }),
            };
        } else if (action === 'verify') {
            // Verify OTP
            if (otpStore[email] === otp) {
                delete otpStore[email]; // Clear OTP after verification
                return {
                    statusCode: 200,
                    body: JSON.stringify({ message: 'OTP verified successfully' }),
                };
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Invalid OTP' }),
                };
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid action' }),
            };
        }
    } catch (error) {
        console.error('Error:', error); // Log the error
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message }),
        };
    }
};
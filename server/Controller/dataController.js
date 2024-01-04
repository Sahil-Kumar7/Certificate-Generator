
const xlsx = require('xlsx');
const User = require('../Model/dataModel.js');
const api2pdf = require('api2pdf');
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const dotenv = require('dotenv');
dotenv.config();

const emailSender = process.env.EMAIL_SENDER;
const emailSenderPassword = process.env.EMAIL_SENDER_PASSWORD;
const api2pdfApiKey = process.env.API2PDF_API_KEY;

const a2pClient = new api2pdf(api2pdfApiKey);

const uploadFile = async (req, res) => {
    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // const client = await connectToDb(mongoURI);

        const userDataWithTrees = jsonData.map(user => ({
            ...user,
            noOfTrees: user.amount / 100,
        }));

        const result = await User.insertMany(userDataWithTrees);
        for (const user of userDataWithTrees) {
            await generateCertificate(user);
        }

        res.status(200).send('Data successfully uploaded to MongoDB');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error ' + error);
    }
};

const generateCertificate = async (user) => {
    try {
        console.log('Generating certificate for:', user.name);
        const pdfFileName = `certificate_${user.name.replace(/\s+/g, '_')}.pdf`;

        // Render HTML content using EJS
        const htmlContent = await ejs.renderFile('certificate.ejs', { user });

        // Convert HTML to PDF
        const pdfOptions = { inline: false, filename: pdfFileName };
        const result = await a2pClient.wkHtmlToPdf(htmlContent, pdfOptions);
        const pdfUrl = result.FileUrl;

        // Update user object with PDF URL
        user.pdfUrl = pdfUrl;

        // Create Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailSender,
                pass: emailSenderPassword,
            },
        });

        // Email options
        const mailOptions = {
            from: emailSender,
            to: user.email,
            subject: '🌳 Your Tree-tastic Certification Has Arrived! 🌿',
            text: getEmailMessage(user.name, user.amount, user.noOfTrees),
            attachments: [{
                filename: pdfFileName,
                path: pdfUrl,
                contentType: 'application/pdf',
            }],
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
        console.log('Certificate generated successfully:', pdfFileName);
    } catch (error) {
        console.error('Error generating certificate and sending email:', error);
    }
};

// Helper function to generate email message
const getEmailMessage = (userName, donationAmount, numberOfTrees) => {
    return `Dear ${userName}, 🌟\n\nCongratulations and thank you for being a sustainability champion! 🌍 Your incredible generosity is a beacon of hope for our planet. 🌞\n\nWe are excited to present your exclusive Green Guardian Certification! 🎉 Your remarkable donation of Rs.${donationAmount} to plant ${numberOfTrees} trees is a testament to your commitment to a greener world. 🌱\n\nYour dedication is making a real difference in the fight against climate change. 🌳 Attached to this email is your personalized certificate in PDF format. Open it to witness the positive impact of your contribution. 📜💚\n\nContinue to inspire change and nurture our environment. Together, we are creating a sustainable future! 🌿\n\nWith gratitude,\nThe Earth Guardians 🌎`;
};



module.exports = {uploadFile,generateCertificate};
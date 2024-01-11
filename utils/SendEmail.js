
const { createTransport } = require("nodemailer")

const SendEmail = async ({ to, subject, text = "", html = "", cc = ['patelnihar1976@gmail.com'], bcc = ['patelnihar39@gmail.com'] }) => {

    const transporter = createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    await transporter.sendMail({
        from: {
            name: 'Swiftfolios',
            address: process.env.EMAIL_FROM
        },
        to,
        cc,
        bcc,
        subject,
        text,
        html,
    });
};
module.exports = { SendEmail }

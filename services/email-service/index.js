const nodemailer = require('nodemailer');

class EmailService {
	constructor() {
		try {
			this.init();
		} catch (e) {
			console.log(e);
		}
	}

	async init() {
		// let testAccount = await nodemailer.createTestAccount();

		// create reusable transporter object using the default SMTP transport
		const transporter = nodemailer.createTransport({
			host: 'mail.privateemail.com',
			port: 465,
			secure: true, // true for 465, false for other ports
			auth: {
				user: 'hello@niamka.com', // generated ethereal user
				pass: 'taras41446', // generated ethereal password
			},
		});

		this.transporter = transporter;
	}

	async send({ html, email, subject }) {
		let info = await this.transporter.sendMail({
			from: 'Niamka team <hello@niamka.com>', // sender address
			to: email,
			subject: subject, // Subject line
			html: html,
		});

		return info;
	}
}

const emailService = new EmailService();

module.exports = emailService;

const nodemailer = require("nodemailer");
const config = require("config");

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      host: config.get("smtp_host"),
      port: config.get("smtp_port"),
      secure: false,
      auth: {
        user: config.get("smtp_user"),
        pass: config.get("smtp_password"),
      },
    });
  }
  async sendActivationMail(toEmail, link) {
    await this.transporter.sendMail({
      from: config.get("smtp_user"),
      to: toEmail,
      subject: "migrant  accountini faolashtirish ",
      text: " ",
      html: `
               <div>
               <h1> Account faolashtirildi  uchun quiyidagi linkin bosing </h1>
                </div>
                <a href=${link}>Faolashtirish </a>
               `,
    });
  }
}
module.exports = new MailService();

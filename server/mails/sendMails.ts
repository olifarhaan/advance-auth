import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAILER_EMAIL as string,
    pass: process.env.MAILER_PASSWORD as string,
  },
});

interface ISendEmail {
  toAddress: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

export const sendMail = async ({
  toAddress,
  subject,
  template,
  data,
}: ISendEmail) => {
  console.log({
    user: process.env.MAILER_EMAIL as string,
    pass: process.env.MAILER_PASSWORD as string,
  });
  const templatePath = path.join(__dirname, template);
  const html = await ejs.renderFile(templatePath, data);

  const mailOptions = {
    from: {
      name: "Shiksha Sarovar",
      address: "olifarhaan@gmail.com",
    }, // sender address
    to: toAddress, // list of receivers
    subject: subject, // Subject line
    html, // html body
  };

  try {
    transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.log(error);
  }
};

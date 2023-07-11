const sgMail = require("@sendgrid/mail");
const { SENDGRID_API_KEY } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

const sendVerifyEmail = async (data) => {
  const email = { ...data, from: "fr.banka@gmail.com" };

  await sgMail.send(email);

  return true;
};
module.exports = sendVerifyEmail;

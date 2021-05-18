require('dotenv').config()
const { SMTPClient } = require('emailjs');

const mailClient = new SMTPClient({
  user: process.env.SMTPUSER,
  password: process.env.SMTPPASSWORD,
  host: process.env.SMTPHOST,
  ssl: true,
});

/**
 * send mail
 * @param { string } email
 * @param { string } object
 * @param { Array } attachment
 */
const mailSender = ( email, object, attachment ) => {

  const message = {
    from: process.env.MAILFROM,
    to: email,
    subject: object,
    attachment,
  };

  mailClient.send(message, (err, message) => {
    console.log(err || message);
  });
}


module.exports = mailSender;




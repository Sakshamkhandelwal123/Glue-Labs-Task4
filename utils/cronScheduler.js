var cron = require("node-cron");
require("dotenv").config();

const logger = require("./logger");
const transporter = require("./sendMail").transporter;

const mailOptions = {
  from: process.env.SENDER_EMAIL, // sender address
  to: process.env.RECEIVER_EMAIL_DEFAULT, // reciever address
  subject: "Tech List",
  html: "<p>WELCOME TO BLOG APPLICATION. VISIT OUR SITE TO KNOW MORE.</p>", // plain text body
};

module.exports = () => {
  cron.schedule("* * * * 0", function () {
    transporter.sendMail(mailOptions, function (err, info) {
      if (err) {
        logger.error(err);
      }
      else {
        logger.info(JSON.stringify(info, null, 3));
      }
    });
  });
};

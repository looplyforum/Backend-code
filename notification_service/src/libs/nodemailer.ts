const nodemailer = require("nodemailer");

export const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port :587,
    auth: {

        // change with real credentials 
        user: "rebecca.pfannerstill@ethereal.email",
        pass: "Njf9KdQzytvxjEhA98",
    },
});



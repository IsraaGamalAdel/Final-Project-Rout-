import nodemailer from 'nodemailer';


export const subjectTypes = {
    confirmEmail: "Confirm-Email",
    forgotPassword: "Forgot-Password",
    updateEmail: "Update-Email"
};


// Send Email Code
export const verifyEmailTemplate = ({code , email } = {}) =>{
    return ` <!DOCTYPE html>
    <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <style type="text/css">
                body {
                    background-color: #9b4caf7f; 
                    margin: 0px;
                    font-family: Arial, sans-serif;
                }
                .input-field {
                    width: 100%;
                    padding: 10px;
                    margin: 10px 0;
                    border: 1px solid #9b4caf;
                    border-radius: 4px;
                }
                .submit-button {
                    background-color: #fff;
                    color: #9b4caf;
                    padding: 10px 20px;
                    border: 2px solid #ddd;
                    border-color: #9b4caf;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                }
                .submit-button:hover {
                    color: #fff;
                    background-color: #9b4caf;
                }
            </style>
        </head>
        <body style="margin: 0px;">
            <div class="container">
            <table border="0" width="50%" 
                style="margin: auto; margin-top: 100px; padding: 30px; border: 1px solid #9b4caf; border-radius: 10px; background-color: rgba(255, 255, 255, 0.789); box-shadow: -5px 2px 54px -9px rgba(0, 0, 0, 1);"
            >
                <tr>
                    <td>
                        <table border="0" width="100%" >
                            <tr>
                                <td>
                                    <h1 style=" width: 100%; text-align: center;"> Send Code To Email</h1>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td>
                        <table border="0" width="100%">
                            <tr>
                                <td style="padding: 20px 0;">
                                    <h2 style="text-align: center;"> Welcome </h2>
                                    <p style="text-align: center;"> Please login to your account with your details</p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <h2 style="width: 100px; text-align: center; margin:auto; padding:10px; background-color: #9b4caf; 
                                            color: #fff; text-decoration: none; border-radius: 5px;"
                                    >
                                        ${code}
                                    </h2>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <form action="http://localhost:5173/login">
                                        <div style="text-align: center;">
                                            <p>Email: <span class="credentials">${email}</span></p>
                                        </div>
                                        
                                        <div style="text-align: center; margin-top: 20px;">
                                            <input type="submit" value="Login" class="submit-button"/>
                                        </div>
                                    </form>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
            </div>
        </body>
    </html>
    `
};

// Send Email Job
export const emailJobAccepted = ({ job, applicationUser }) => {
    return `
    <!DOCTYPE html>
    <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <style type="text/css">
                body { background-color: #9b4caf7f; font-family: Arial, sans-serif; }
                .container { margin: auto; padding: 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style=" background-color: #9b4caf; color: #fff; ">Hello ${applicationUser.firstName} ${applicationUser.lastName}</h2>
                <p style= " font-size: 16px;">We are pleased to inform you that your application for the position of <b>${job.jobTitle}</b> has been accepted.</p>
                <p style= " font-size: 16px;">We will contact you for the next steps.</p>
                <p style= " font-size: 16px;">Best regards,<br>HR Team</p>
            </div>
        </body>
    </html>`;
};

export const emailJobRejected = ({ job, applicationUser }) => {
    return `
    <!DOCTYPE html>
    <html lang="ar">
        <head>
            <meta charset="UTF-8">
            <style type="text/css">
                body { background-color: #ff4c4c7f; font-family: Arial, sans-serif; }
                .container { margin: auto; padding: 30px; text-align: center; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2 style=" background-color: #ff4c4c; color: #fff; ">Dear ${applicationUser.firstName} ${applicationUser.lastName}</h2>
                <p style= " font-size: 16px;">We appreciate your interest in the <b>${job.jobTitle}</b> position. Unfortunately, after careful consideration, we have decided to move forward with other candidates.</p>
                <p style= " font-size: 16px;">We wish you the best in your career journey.</p>
                <p style= " font-size: 16px;">Regards,<br>HR Team</p>
            </div>
        </body>
    </html>`;
};

// Send Email Data nodemailer
export const sendEmail = async ({to=[] , cc=[] , bcc=[] , subject = "", text="" , html="" , attachments=[]}={}) => {

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SEND_EMAIL,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: `"Test Send Email" < ${process.env.SEND_EMAIL} > `, // sender address
        to,  // list of receivers
        cc,   //cc (many receivers)
        bcc,   //bcc (many receivers , not admin  او يبقى مفصولة )
        subject, // Subject line
        text, // plain text body
        html, // html body
        attachments
    });
};



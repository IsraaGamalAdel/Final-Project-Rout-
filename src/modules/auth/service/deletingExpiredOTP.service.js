import cron from 'node-cron';
import * as dbService from '../../../DB/db.service.js';
import { userModel } from '../../../DB/model/User.model.js';


const deleteExpiredOTPs = async () => {
    
    // console.log('CRON Job started at:', new Date());

    const now = new Date();
    const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);

    const result = await dbService.updateMany({
        model: userModel,
        filter: {
            $or: [
                { otpExpiresAt: { $lte: sixHoursAgo } },
                { forgotPasswordOTP: { $exists: true } },
                { emailOTP: { $exists: true } }, 
                { otpAttempts: { $gte: 0, $exists: true } }
            ]
        },
        data: {
            $unset: {
                deleted: 1,
                otpExpiresAt: 1,
                emailOTP: 1,
                forgotPasswordOTP: 1,
                otpAttempts: 1
            }
        }
    });

    // console.log('Update Result:', result);`
    // console.log('Expired OTP codes have been deleted.');
};

// cron.schedule('*/1 * * * *', deleteExpiredOTPs);

cron.schedule('0 */6 * * *', deleteExpiredOTPs);

export default deleteExpiredOTPs;
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({path:(path.resolve('./config/.env.dev'))});

import express from 'express';
import bootstrap from './src/app.controller.js';
import chalk from 'chalk';
import deleteExpiredOTPs from './src/modules/auth/service/deletingExpiredOTP.service.js';

const app = express();
const port = process.env.PORT || 10000;

bootstrap(app , express);

deleteExpiredOTPs();

app.listen(port, () => {
    console.log(chalk.bgBlue(`Example app listening on PORT ${port}!`))
});

app.on('error', (err) => {
    console.error(`Error app listening on PORT : ${err}`);
});
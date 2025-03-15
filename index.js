import path from 'path';
import * as dotenv from 'dotenv';

// dotenv.config({path:(path.resolve('./config/.env.dev'))});
// dotenv.config({path:(path.resolve('./config/.env.prod'))});


import express from 'express';
import bootstrap from './src/app.controller.js';
import chalk from 'chalk';
import deleteExpiredOTPs from './src/modules/auth/service/deletingExpiredOTP.service.js';
import { runIo } from './src/modules/chat/chat.socket.controller.js';


const app = express();
const port = process.env.PORT || 10000;

bootstrap(app , express);

deleteExpiredOTPs();

const httpServer = app.listen(port, () => {
    console.log(chalk.bgBlue(`Example app listening on PORT ${port}!`))
});

// Socket.io
runIo(httpServer);

app.on('error', (err) => {
    console.error(`Error app listening on PORT : ${err}`);
});
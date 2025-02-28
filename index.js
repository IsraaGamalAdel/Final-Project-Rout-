import { Server } from 'socket.io';
import path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({path:(path.resolve('./config/.env.dev'))});

import express from 'express';
import bootstrap from './src/app.controller.js';
import chalk from 'chalk';
import deleteExpiredOTPs from './src/modules/auth/service/deletingExpiredOTP.service.js';
import { authenticationSocket } from './src/middleware/auth.socket.middleware.js';
import { socketConnection } from './src/DB/model/User.model.js';


const app = express();
const port = process.env.PORT || 10000;

bootstrap(app , express);

deleteExpiredOTPs();

const httpServer = app.listen(port, () => {
    console.log(chalk.bgBlue(`Example app listening on PORT ${port}!`))
});

const io = new Server(httpServer, {
    cors: {
        origin: '*',
    }
});

const registerSocketEvents = async (socket) => {

    const {date} = await authenticationSocket({ socket });

    if(!date.valid){
        return  socket.emit("socketErrorResponse", date);
    }

    socketConnection.set(date.user._id.toString(), socket.id);
    console.log(socketConnection);
    

    return "Done";
}


const logOutSocket = async (socket) => {

    return socket.on("disconnect", async () => {
        console.log("Socket Disconnected");
        
        const {date} = await authenticationSocket({ socket });

        if(!date.valid){
            return  socket.emit("socketErrorResponse", date);
        }

        socketConnection.delete(date.user._id.toString(), socket.id);
        console.log(socketConnection);
        

        return "Done";
    })
}


io.on('connection',  async (socket) => {
    console.log(socket.handshake.auth);
    await registerSocketEvents( socket );

    await logOutSocket( socket );
});

app.on('error', (err) => {
    console.error(`Error app listening on PORT : ${err}`);
});
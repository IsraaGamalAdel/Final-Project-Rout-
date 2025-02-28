import { Server } from 'socket.io';
import { logOutSocket, registerSocketEvents } from './service/chat.auth.service.js';
import { sendMessage } from './service/messages.service.js';



export const runIo = async (httpServer) => {

    const io = new Server(httpServer, {
        cors: {
            origin: '*',
        }
    });

    
    return io.on('connection',  async (socket) => {
        console.log('A user connected:', socket.id);
        console.log('Auth Token:', socket.handshake.auth);
        await registerSocketEvents( socket );
        await sendMessage( socket );
        await logOutSocket( socket );
    });
};
import path from 'node:path';
import connectDB from './DB/connection.js';
import { globalErrorHandling } from './utils/response/error.response.js';
import authController from'./modules/auth/auth.controller.js';
import usersController from './modules/users/user.controller.js';
import adminController from './modules/admin/admin.controller.js';
import companyController from './modules/company/company.controller.js';
import applicationController from './modules/application/application.controller.js';
import cors from 'cors'; // upload Deployment 
import helmet from 'helmet';
import morgan from 'morgan';
import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from './modules/modules.schema.js';



// API
const url = '/api/v1'

const bootstrap = async (app , express) => {
    app.use(express.json());
    app.use(morgan('dev')); // development
    app.use(helmet());
    app.use(cors());
    // app.use('/uploads' , express.static(path.resolve('./src/uploads')));

    app.get('/' , (req , res ,next) => {
        return res.status(200).json({
            message : "hello world"
        })
    });

    app.use(`${url}/graphql` , createHandler({schema}));
    app.use(`${url}/auth` , authController);
    app.use(`${url}/users` , usersController);
    app.use(`${url}/admin` , adminController);
    app.use(`${url}/company` , companyController);
    app.use(`${url}/application` , applicationController);

    app.use(globalErrorHandling);

    app.all('*' , (req , res , next) => {
        return res.status(404).json({
            message : "In-valid routing"
        });
    });

    connectDB();
};


export default bootstrap;
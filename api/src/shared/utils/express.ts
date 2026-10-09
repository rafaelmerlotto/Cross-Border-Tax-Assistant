import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { user } from "../../modules/users/user.controller";
import { consultation } from "../../modules/consultation/consultation.controller";
import { globalLimiter } from '../../shared/middleware/rateLimiters';
import healthRouter from '../../handlers/health';


const server: express.Express = express();

server.set('trust proxy', 1);
server.use(globalLimiter);
server.use(cors());
server.use(bodyParser.json());
server.use(express.json());

server.use("/api", user);
server.use("/api/consultation", consultation);
server.use('/api', healthRouter);

export { server };
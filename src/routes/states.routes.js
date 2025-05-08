import express from express;
import {getStates} from "../controllers/states.controller.js";

const router = express.Router();

export default (app) => {
    router.get("/", getStates);

    app.use("api/states", router); 
};
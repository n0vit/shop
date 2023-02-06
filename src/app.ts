import express, {NextFunction, Request, Response} from "express";
import  cors from "cors"
import  UserRouter from "./routes/user";
import ProductRouter from "./routes/product";
import {config} from "./config/default";
import cookieParser from "cookie-parser";
import {parse} from "express-form-data";
import path from "path";
import mongoose from "mongoose";

mongoose.set({"strictQuery":false})
    .connect("mongodb://127.0.0.1:27017/test_ts", {})
    .catch((error) => {
        console.log(error.toString())
    });


const db = mongoose.connections[0];
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const  app = express();
app.use(cookieParser(config.sessionKey));
app.use(express.json())
app.use(parse({uploadDir:path.resolve(__dirname +"/static")}))
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.resolve(__dirname + "/static")))
app.use(cors({credentials:true,
    origin: ['http://localhost:3000'],  methods: ['GET','POST','DELETE','UPDATE','PUT']

}));

async function  simulate_high_loaded_server  (req: Request,res: Response, next:NextFunction){
    await new Promise(r => setTimeout(r,3000))
    next()
}


app.use(simulate_high_loaded_server)
app.use("/product/" , ProductRouter)
app.use("/user/", UserRouter)

app.get("/",(req: Request,res:Response)=>{
    return res.send( "It's work").sendStatus(200)
} )


app.listen(config.serverPort,()=> console.log(("Run http://localhost:" + config.serverPort.toString())))

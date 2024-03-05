require("dotenv").config()
import { app } from "./app";
import connectDB from "./utils/db";

const PORT= process.env.PORT;

const start= async()=>{
    try {
        await connectDB();
        app.listen(PORT, ()=>{
            console.log("Server started at port:", PORT);
        })
    } catch (error: any) {
        console.log(error.message);
    }
}
start()
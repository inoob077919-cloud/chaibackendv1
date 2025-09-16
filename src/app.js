import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";


const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})); //app .use .use means middlewares

app.use(express.json({
    limit: "16kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
})); // for parsing application/x-www-form-urlencoded
app.use(express.static("public"));
app.use(cookieParser());

// app.on("error", (error) => {
//     console.log(`Error : `, error);
//     throw error;
// });




// export { app }
export default app;
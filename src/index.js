import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import connectDB from './db/index.js';
import express from "express";
const app = express();
import morgan from "morgan";
// if (process.env.NODE_ENV === 'development') {
app.use(morgan('dev')); //use for Method / URL / Statuscode / TIME / Size //GET /api/v1/tours/5 404 5.297 ms - 40
// }
connectDB();

app.listen(process.env.PORT, () => {
    console.log(`Server is now ready to Run with port ${process.env.PORT}`);

});


/*
(async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
            .then(() => {
            })
            .catch((error) => {
                console.error("Error connecting to MongoDB:", error)
            });
    } catch (error) {
        console.error("Error Of MongoDB");
    }
});
const port = process.env.PORT;
// port = 3000;
app.listen(port, () => {
    console.log(`App running on port ${port}`);
});
*/
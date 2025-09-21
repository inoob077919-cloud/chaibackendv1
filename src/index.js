import dotenv from "dotenv";
dotenv.config();
import connectDB from "./db/index.js";
import app from "./app.js";
const port = process.env.PORT || 8000;



connectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`Server is running at port: ${port}`);
        })
    })
    .catch((error) => {
        console.log(`Database connection failed !`);

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
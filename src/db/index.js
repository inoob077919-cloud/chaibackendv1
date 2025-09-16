import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI)
            .then(() => {
                console.log(`Connection Successfully! HOST`);

            })
    } catch (error) {
        console.error("Error in Connection db file", error);

    }

}
export default connectDB;
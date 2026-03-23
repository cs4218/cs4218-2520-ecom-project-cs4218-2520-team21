import dotenv from "dotenv";
import connectDB from "./config/db.js";
import startExpressApp from "./expressApp.js";

// configure env
dotenv.config();
const app = startExpressApp(() => {
    connectDB();
})

const PORT = process.env.PORT || 6060;

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on ${process.env.DEV_MODE} mode on ${PORT}`.bgCyan.white);
    });
}

export default app;
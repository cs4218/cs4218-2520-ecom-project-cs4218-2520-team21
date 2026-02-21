import mongoose from "mongoose";
import colors from "colors";
import dns from "node:dns"; // 1. Import the DNS module

// 2. Set the default DNS servers to Google or Cloudflare
// This bypasses local network/ISP issues with SRV records
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL);
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
    } catch (error) {
        console.log(process.env.MONGO_URL)
        console.log(`Error in Mongodb ${error}`.bgRed.white);
    }
};

export default connectDB;
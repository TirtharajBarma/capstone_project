const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/cattle-breed-db');
const connectDB = async () => {
    const db = mongoose.connection.useDb('cattle-breed-db');
    const cols = await db.collection('predictions').find({}).limit(1).toArray();
    console.log(cols);
    process.exit(0);
}
connectDB();

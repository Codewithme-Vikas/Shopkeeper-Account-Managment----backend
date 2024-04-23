const mongoose = require("mongoose");
require("dotenv").config();



exports.dbConnect = () => {
    mongoose.connect( process.env.MONGO_DB_URL )
        .then(() => console.log("Database is successfully connected."))
        .catch((err) => {
            console.log("Database is not connected.");
            console.log(err);
            process.exit(1);
        });
};
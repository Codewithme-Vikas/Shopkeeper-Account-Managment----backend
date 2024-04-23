const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require('cors');
require("dotenv").config();

// intitalize express top level application
const app = express();

// PORT
const PORT = process.env.PORT;

// databse connection
const { dbConnect } = require("./config/database");
dbConnect();

// Middlewares
app.use( express.json() );

app.use( cookieParser() );  

app.use( cors( { origin: process.env.FRONTEND_URL, credentials : true } ) );

// Routes
const authRoute = require("./routes/auth");
const orderRoute = require("./routes/order");
const productRoute = require("./routes/product");
const customerRoute = require("./routes/customer");
const paymentRoute = require("./routes/payment");

const { auth , isAdmin } = require("./middlewares/auth");


app.use("/api/v1/order" , auth , isAdmin ,  orderRoute );
app.use("/api/v1/product" , auth , isAdmin,  productRoute );
app.use("/api/v1/customer" , auth , isAdmin,  customerRoute );
app.use("/api/v1/payment", auth , isAdmin, paymentRoute)
app.use("/api/v1/auth" , authRoute );







app.listen( PORT , ()=>{
    console.log(`Website is listening on the port ${PORT}`);
});
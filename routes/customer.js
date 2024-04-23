const express = require("express");

const router = express.Router();

// controllers
const { getAllCustomers , updateCustomer , getCustomer, createCustomer,deleteCustomer } = require("../controllers/Customer");


// **********************************Auth APIS************************************************


router.post("/createCustomer" , createCustomer );

router.get("/getCustomer/:customerId" , getCustomer );

router.get("/getAllCustomers" , getAllCustomers );

router.post("/update" , updateCustomer );

router.get('/delete/:customerId', deleteCustomer );


// -------------------------------------------------------------------------------------------





module.exports = router;
const express = require("express");

const router = express.Router();


// import controller
const { payment, customerCredit, getAllPayments } = require("../controllers/Payment");

// *********************************Payment APIs********************************************

router.post("/payment" , payment );

router.get("/cutomerCredit/:customerId" , customerCredit );

router.get("/getAllPayments", getAllPayments);



// -----------------------------------------------------------------------------------------



module.exports = router;
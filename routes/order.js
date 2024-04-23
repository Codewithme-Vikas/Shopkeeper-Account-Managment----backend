const express = require("express");

const router = express.Router();


// import controller
const { createOrder, getAllBuyOrders, updateOrder, getAllSellOrders, getCutomerAllOrders, getOrder, getAllOrders }  = require("../controllers/Order");
const { payment, customerCredit, getAllPayments } = require("../controllers/Payment");


// **********************************Order APIS************************************************

router.post("/create" , createOrder );

router.get("/getOrder/:id" , getOrder );

router.post('/update', updateOrder);

router.get("/getAllOrders" , getAllOrders );

router.get("/getAllBuyOrders" , getAllBuyOrders );

router.get("/getAllSellOrders" , getAllSellOrders );

router.post("/getCutomerAllOrdres" , getCutomerAllOrders );


// router.post("/delete" , deleteOrder );

// -----------------------------------------------------------------------------------------

// XXXXXXXXX****************************Payment APIs --> Move to payment route file******************************XXXXXXXXX

router.post("/payment" , payment );

router.post("/cutomerCredit" , customerCredit );

router.get("/getAllPayments", getAllPayments)


// -----------------------------------------------------------------------------------------



module.exports = router;
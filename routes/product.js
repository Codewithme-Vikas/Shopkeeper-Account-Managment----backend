const express = require("express");

const router = express.Router();

// import controller
const { createProduct , updateProduct, getAllProducts, deleteProduct, getProduct} = require("../controllers/Product");


// ********************************** Product APIS************************************************
router.post("/create" , createProduct );

router.put("/update" , updateProduct );

router.get("/getProduct/:productId" , getProduct );

router.get("/getAllProducts" , getAllProducts );

router.get("/delete/:id" , deleteProduct );

// -----------------------------------------------------------------------------------------------



module.exports = router;
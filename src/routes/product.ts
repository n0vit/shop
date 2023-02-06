import express from "express";
import controller from "../controllers/product";


const router = express.Router();

router.get("/one", controller.getProduct)
router.put("/add", controller.addProduct)
router.put("/edit", controller.editProduct)
router.get("/all", controller.getAllProducts)
router.delete("/delete", controller.deleteProduct)

export  default  router;

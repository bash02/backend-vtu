import { Router } from "express";
import { auth } from "../middleware/auth";
import * as saleController from "../controllers/sale.Controller";
import { admin } from "../middleware/admin";
import { validateSaleCreate, validateSalePatch } from "../middleware/saleValidation";


const router = Router();


// Admin: get all sales
router.get("/", saleController.getAllSales);

// Admin: get sale by id
router.get("/:id", saleController.getSaleById);

// Admin: create a sale with validation
router.post("/", validateSaleCreate, saleController.createSale
);

// Admin: delete sale
router.delete("/:id", saleController.deleteSale);
    
// Admin: patch sale
router.patch("/:id", validateSalePatch, saleController.updateSale
);

export default router;

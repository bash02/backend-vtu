import { Router } from "express";
import { auth } from "../middleware/auth";
import { admin } from "../middleware/admin";
import * as productController from "../controllers/product.Controller";

const router = Router();

// Public: List all products
router.get("/", productController.listProducts);

// Public: Get product by ID
router.get("/:id", productController.getProductById);

// Admin only: Create product
router.post("/", productController.createProduct
);

// Admin only: Update product
router.patch("/:id", productController.updateProduct
);

// Admin only: Delete product
router.delete("/:id", productController.deleteProduct
);

export default router;

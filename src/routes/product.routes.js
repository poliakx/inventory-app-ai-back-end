import { Router } from "express";
import { productsController } from "../controllers/products.controller.js";
import { validate } from "../middleware/validation/validate.middleware.js";
import { requireRole } from "../middleware/auth/require-role.js";
import { createProductSchema, updateProductSchema, validateIdSchema } from "../validationSchemas/product.schema.js";
import { paginationSchema } from "../validationSchemas/pagination.schema.js";
import { authMiddleware } from "../middleware/auth/authMiddleware.js";

const router = Router();

router.get(
  "/", 
  authMiddleware, 
  validate(paginationSchema, "query"), 
  productsController.getProducts
);
router.get(
  "/:id", 
  authMiddleware, 
  validate(validateIdSchema(), "params"),
  productsController.getProductById
);
router.post(
  "/", 
  authMiddleware,
  requireRole("admin"),
  validate(createProductSchema, "body"), 
  productsController.createProduct
);
router.put(
  "/:id", authMiddleware, 
  requireRole("admin"),
  validate(validateIdSchema(), "params"),
  validate(updateProductSchema, "body"),
  productsController.updateProduct
);
router.delete(
  "/:id", 
  authMiddleware, 
  requireRole("admin"), 
  validate(validateIdSchema(), "params"),
  productsController.deleteProduct
);

export default router;
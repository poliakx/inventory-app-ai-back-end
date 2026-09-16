import { z } from "zod";

export const createStockMovementSchema = z.object({
  productId: z
    .string({
      required_error: "Product ID is required",
      invalid_type_error: "Product ID must be a string",
    })
    .uuid("Product ID must be a valid UUID"),
  type: z.enum(["in", "out", "adjustment"], {
    required_error: "Movement type is required",
    invalid_type_error: "Movement type must be one of: in, out, adjustment",
  }),
  quantity: z.coerce
    .number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .positive("Quantity must be greater than 0"),
  note: z
    .string({
      invalid_type_error: "Note must be a string",
    })
    .trim()
    .max(500, "Note cannot exceed 500 characters")
    .optional(),
});

export const stockMovementParamsSchema = z.object({
  productId: z
    .string({
      required_error: "Product ID is required",
      invalid_type_error: "Product ID must be a string",
    })
    .uuid("Product ID must be a valid UUID"),
});

export const stockMovementHistoryQuerySchema = z.object({
  limit: z.coerce
    .number({
      invalid_type_error: "Limit must be a number",
    })
    .int("Limit must be an integer")
    .positive("Limit must be greater than 0")
    .max(100, "Limit cannot exceed 100")
    .default(20),
  offset: z.coerce
    .number({
      invalid_type_error: "Offset must be a number",
    })
    .int("Offset must be an integer")
    .min(0, "Offset cannot be negative")
    .default(0),
});

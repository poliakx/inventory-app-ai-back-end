import { z } from "zod";
import { unitEnum } from "../shared/units/unit.schema.js";


export const createProductSchema = z.object({
  name: z
    .string({
      required_error: "Product name is required",
      invalid_type_error: "Product name must be a string",
    })
    .min(1, "Product name cannot be empty")
    .max(255, "Product name is too long"),
  price: z.coerce.number({
      required_error: "Price is required",
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0"),
  quantity: z.coerce.number({
      required_error: "Quantity is required",
      invalid_type_error: "Quantity must be a number",
    })
    .nonnegative("Quantity cannot be negative"),
  unit: unitEnum.default("g"),
  categoryId: z
    .string({
      invalid_type_error: "Category ID must be a string",
    })
    .uuid("Category ID must be a valid UUID")
    .nullish(),
  avgWeightGrams: z
    .coerce.number()
    .positive().
    optional(),
  avgVolumeMl:  z
    .coerce.number()
    .positive().
    optional(),
});

export const validateIdSchema = (name = "id") => z.object({
  [name]: z.string({
    required_error: "ID is required",
    invalid_type_error: "ID must be a string",
  }).uuid("Invalid ID format"),
});

export const updateProductSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Product name must be a string",
    })
    .min(1, "Product name cannot be empty")
    .optional(),
  price: z.coerce
    .number({
      invalid_type_error: "Price must be a number",
    })
    .positive("Price must be greater than 0")
    .optional(),
  quantity: z.coerce
    .number({
      invalid_type_error: "Quantity must be a number",
    })
    .nonnegative("Quantity cannot be negative")
    .optional(),
  unit: unitEnum.optional(),
  categoryId: z
    .string({
      invalid_type_error: "Category ID must be a string",
    })
    .uuid("Category ID must be a valid UUID")
    .nullish(),
  avgWeightGrams: z
    .coerce.number()
    .positive().
    optional(),
  avgVolumeMl:  z
    .coerce.number()
    .positive().
    optional(),
});
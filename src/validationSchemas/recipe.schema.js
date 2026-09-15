import { z } from "zod";
import { unitEnum } from "../shared/units/unit.schema.js";

const lookingForDublikats = (val) => {
    const ids = val.map((ingredients) => ingredients.productId)
    return new Set(ids).size === val.length
  }

const ingredientSchema = z.object({
  productId: z
    .string({
      required_error: "Product ID is required",
      invalid_type_error: "Product ID must be a string",
    })
    .uuid("Product ID must be a valid UUID"),
  quantity: z
    .number({
      required_error: "Ingredient quantity is required",
      invalid_type_error: "Ingredient quantity must be a number",
    })
    .positive("Ingredient quantity must be greater than 0"),
});

export const createRecipeSchema = z.object({
  name: z
    .string({
      required_error: "Recipe name is required",
      invalid_type_error: "Recipe name must be a string",
    })
    .min(1, "Recipe name cannot be empty")
    .max(255, "Recipe name is too long"),
  instructions: z
    .string({ invalid_type_error: "Instructions must be a string" })
    .optional(),
  yieldWeight: z.coerce
    .number({ invalid_type_error: "Yield weight must be a number" })
    .positive("Yield weight must be greater than 0")
    .optional(),
  yieldUnit: unitEnum.optional().default("g"),
  portions: z.coerce
    .number({ invalid_type_error: "Portions must be a number" })
    .int("Portions must be an integer")
    .positive("Portions must be greater than 0")
    .optional(),
  salePrice: z.coerce
    .number({ invalid_type_error: "Sale price must be a number" })
    .positive("Sale price must be greater than 0")
    .optional(),
  portionWeight: z.coerce
    .number({ error: "Portion weight must be a number" })
    .positive("Portion weight must be greater than 0")
    .optional(),
  photoUrl: z
    .string({ invalid_type_error: "Photo URL must be a string" })
    .url("Photo URL must be a valid URL")
    .optional(),
  categoryId: z
    .string({ invalid_type_error: "Category ID must be a string" })
    .uuid("Category ID must be a valid UUID")
    .optional(),
  ingredients: z
    .array(ingredientSchema)
    .min(1, "A recipe needs at least one ingredient")
    .refine(lookingForDublikats),
});

export const updateRecipeSchema = z.object({
  name: z
    .string({ invalid_type_error: "Recipe name must be a string" })
    .min(1, "Recipe name cannot be empty")
    .max(255, "Recipe name is too long")
    .optional(),
  instructions: z
    .string({ invalid_type_error: "Instructions must be a string" })
    .optional(),
  yieldWeight: z.coerce
    .number({ invalid_type_error: "Yield weight must be a number" })
    .positive("Yield weight must be greater than 0")
    .optional(),
  yieldUnit: unitEnum.optional(),
  portions: z.coerce
    .number({ invalid_type_error: "Portions must be a number" })
    .int("Portions must be an integer")
    .positive("Portions must be greater than 0")
    .optional(),
  salePrice: z.coerce
    .number({ invalid_type_error: "Sale price must be a number" })
    .positive("Sale price must be greater than 0")
    .optional(),
  portionWeight: z.coerce
    .number({ error: "Portion weight must be a number" })
    .positive("Portion weight must be greater than 0")
    .optional(),
  photoUrl: z
    .string({ invalid_type_error: "Photo URL must be a string" })
    .url("Photo URL must be a valid URL")
    .optional(),
  categoryId: z
    .string({ invalid_type_error: "Category ID must be a string" })
    .uuid("Category ID must be a valid UUID")
    .optional(),
  ingredients: z.array(ingredientSchema).refine(lookingForDublikats).optional(),
});

export const recipeIdParamSchema = z.object({
  id: z
    .string({
      required_error: "Recipe ID is required",
      invalid_type_error: "Recipe ID must be a string",
    })
    .uuid("Invalid recipe ID format"),
});

export const recipeQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  categoryId: z
    .string({ invalid_type_error: "Category ID must be a string" })
    .uuid("Category ID must be a valid UUID")
    .optional(),
});

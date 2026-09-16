import { getExecutor } from "../db/executor.js";
import {
  qGetAll,
  qGetIngredientsByRecipeIds,
  qCountRecipes,
  qFindRecipeById,
  qCreateRecipe,
  qUpdateRecipe,
  qDeleteRecipe,
  qGetIngredientsByRecipeId,
  qDeleteIngredientsByRecipeId,
} from "../query/recipes.query.js";

export const recipesRepository = {
  async getAll(organization_id, limit = 20, offset = 0, categoryId = null, db = null) {
    const executor = getExecutor(db);
    const [result, countResult] = await Promise.all([
      executor.query(qGetAll, [organization_id, limit, offset, categoryId]),
      executor.query(qCountRecipes, [organization_id, categoryId]),
    ]);

    const rows = result.rows;
    const total = parseInt(countResult.rows[0].count);

    return { rows, total };
  },

  async findById(organization_id, id, db = null) {
    const executor = getExecutor(db);
    const { rows } = await executor.query(qFindRecipeById, [organization_id, id]);
    return rows[0] ?? null;
  },

  async create(
    { name, instructions, yieldWeight, yieldUnit, salePrice, portionWeight, photoUrl, category_id, organization_id },
    db = null
  ) {
    const executor = getExecutor(db);
    const { rows } = await executor.query(qCreateRecipe, [
      name,
      instructions ?? null,
      yieldWeight ?? null,
      yieldUnit ?? "g",
      salePrice ?? null,
      portionWeight ?? null,
      photoUrl ?? null,
      category_id ?? null,
      organization_id,
    ]);
    return rows[0];
  },

  async update(
    organization_id,
    id,
    { name, instructions, yieldWeight, yieldUnit, salePrice, portionWeight, photoUrl, category_id },
    db = null
  ) {
    const executor = getExecutor(db);
    const { rows } = await executor.query(qUpdateRecipe, [
      organization_id,
      id,
      name,
      instructions ?? null,
      yieldWeight ?? null,
      yieldUnit ?? null,
      salePrice ?? null,
      portionWeight ?? null,
      photoUrl ?? null,
      category_id ?? null,
    ]);
    return rows[0] ?? null;
  },

  async delete(organization_id, id, db = null) {
    const executor = getExecutor(db);
    const { rows } = await executor.query(qDeleteRecipe, [organization_id, id]);
    return rows[0] ?? null;
  },

  async getIngredients(recipeId, db = null) {
    const executor = getExecutor(db);
    const { rows } = await executor.query(qGetIngredientsByRecipeId, [recipeId]);
    return rows;
  },

  async getIngredientsByRecipeIds(recipeIds, db = null) {
    const executor = getExecutor(db);
    const { rows } = await executor.query(qGetIngredientsByRecipeIds, [recipeIds]);
    return rows;
  },

  async replaceIngredients(recipeId, ingredients, db = null) {
    const executor = getExecutor(db);
    await executor.query(qDeleteIngredientsByRecipeId, [recipeId]);

    const params = ingredients.flatMap((ingredient) => [
      recipeId,
      ingredient.productId,
      ingredient.quantity,
    ]);

    const valuesClause = ingredients
      .map((ingredient, index) => {
        const offset = index * 3;
        return `($${offset + 1}, $${offset + 2}, $${offset + 3})`;
      })
      .join(", ");

    const query = `
      INSERT INTO recipe_ingredients(recipe_id, product_id, quantity)
      VALUES ${valuesClause}
      RETURNING id, recipe_id AS "recipeId", product_id AS "productId", quantity
    `;

    const { rows } = await executor.query(query, params);
    return rows;
  },
};

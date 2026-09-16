import { NotFoundError, ValidationError } from "../errors/base.error.js";
import { recipesRepository } from "../repositories/recipes.repository.js";
import { getOrganizationId } from "../shared/auth/getOrganizationId.js";
import { transactionFunc } from "../db/transaction.js";
import { productsRepository } from "../repositories/products.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";

const computeFoodCost = (ingredients) => {
  return ingredients.reduce(
    (sum, ingredient) => sum + Number(ingredient.quantity) * Number(ingredient.productPrice),
    0
  );
};

const withFoodCost = (recipe, ingredients) => {
  const foodCost = computeFoodCost(ingredients);

  const costPerGram = recipe.yieldWeight ? foodCost / Number(recipe.yieldWeight) : null;
  const portionCost = costPerGram && recipe.portionWeight
    ? costPerGram * Number(recipe.portionWeight)
    : null;

  const foodCostPercentage = recipe.salePrice && portionCost !== null
    ? Number(((portionCost / Number(recipe.salePrice)) * 100).toFixed(2))
    : null;

  return {
    ...recipe,
    foodCost: Number(foodCost.toFixed(2)),
    portionCost: portionCost !== null ? Number(portionCost.toFixed(2)) : null,
    foodCostPercentage,
  };
};

export const recipesService = {
  getAll: async (user, { limit, page, categoryId }) => {
    const organization_id = getOrganizationId(user);
    const offset = (page - 1) * limit;

    const { rows, total } = await recipesRepository.getAll(
      organization_id,
      limit,
      offset,
      categoryId ?? null
    );

    const recipeIds = rows.map((recipe) => recipe.id);

    const ingredients = await recipesRepository.getIngredientsByRecipeIds(recipeIds);

    const map = new Map();

    ingredients.forEach((ingredient) => {
      if (!map.has(ingredient.recipeId)) {
        map.set(ingredient.recipeId, []);
      }
      map.get(ingredient.recipeId).push(ingredient);
    });

    const recipes = rows.map((recipe) => {
      const recipeIngredients = map.get(recipe.id) ?? [];
      return withFoodCost(recipe, recipeIngredients);
    });

    const hasMore = offset + limit < total;

    return {
      recipes,
      pagination: { total, page, limit, hasMore },
    };
  },

  getRecipeById: async (user, id) => {
    const organization_id = getOrganizationId(user);

    if (!id) {
      throw new ValidationError("Recipe id is required");
    }

    const recipe = await recipesRepository.findById(organization_id, id);
    if (!recipe) {
      throw new NotFoundError("Recipe");
    }

    const ingredients = await recipesRepository.getIngredients(id);

    return { ...withFoodCost(recipe, ingredients), ingredients };
  },

  createRecipe: async (user, recipeData) => {
    const organization_id = getOrganizationId(user);
    const { categoryId, ingredients, ...rest } = recipeData;
    const productsIds = ingredients.map((i) => i.productId)

    const foundProducts = await productsRepository.findByIds(organization_id, productsIds)

    if(productsIds.length !== foundProducts.length){
      throw new NotFoundError("Product")
    }

    if(categoryId){
      const category = await categoryRepository.findById(organization_id, categoryId)

      if(!category){
        throw new NotFoundError("Category")
      }
    }

    return transactionFunc(async (client) => {
      const recipe = await recipesRepository.create(
        { ...rest, category_id: categoryId ?? null, organization_id },
        client
      );
      await recipesRepository.replaceIngredients(
        recipe.id,
        ingredients,
        client
      );

      const freshIngredients = await recipesRepository.getIngredients(recipe.id, client);
      return { ...withFoodCost(recipe, freshIngredients), ingredients: freshIngredients };
    });
  },

  updateRecipe: async (user, id, recipeData) => {
    const organization_id = getOrganizationId(user);

    if (!id) {
      throw new ValidationError("Recipe id is required");
    }

    const { categoryId, ingredients, ...rest } = recipeData;

    if(ingredients){
      const productsIds = ingredients.map((i) => i.productId)

      const foundProducts = await productsRepository.findByIds(organization_id, productsIds)

      if(productsIds.length !== foundProducts.length) throw new NotFoundError("Product")
    
    }

     if(categoryId){
      const category = await categoryRepository.findById(organization_id, categoryId)

      if(!category){
        throw new NotFoundError("Category")
      }
    }
    return transactionFunc(async (client) => {
      const updated = await recipesRepository.update(
        organization_id,
        id,
        { ...rest, category_id: categoryId ?? null },
        client
      );

      if (!updated) {
        throw new NotFoundError("Recipe");
      }

      if (ingredients) {
        await recipesRepository.replaceIngredients(id, ingredients, client);
      }
      const freshIngredients = await recipesRepository.getIngredients(id, client);

      return { ...withFoodCost(updated, freshIngredients), ingredients: freshIngredients };
    });
  },

  deleteRecipe: async (user, id) => {
    const organization_id = getOrganizationId(user);

    if (!id) {
      throw new ValidationError("Recipe id is required");
    }

    const result = await recipesRepository.delete(organization_id, id);
    if (!result) {
      throw new NotFoundError("Recipe");
    }

    return true;
  },
};

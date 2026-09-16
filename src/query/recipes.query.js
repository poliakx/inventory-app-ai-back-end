export const RECIPES_TABLE = "recipes";
export const RECIPE_INGREDIENTS_TABLE = "recipe_ingredients";

export const RECIPES_COLUMNS = `
  id,
  name,
  instructions,
  yield_weight AS "yieldWeight",
  yield_unit AS "yieldUnit",
  sale_price AS "salePrice",
  portion_weight AS "portionWeight",
  photo_url AS "photoUrl",
  organization_id,
  category_id AS "categoryId",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export const qGetAll = `
  SELECT ${RECIPES_COLUMNS}
  FROM ${RECIPES_TABLE}
  WHERE organization_id = $1
    AND ($4::uuid IS NULL OR category_id = $4)
  ORDER BY created_at DESC
  LIMIT $2
  OFFSET $3
`;

export const qCountRecipes = `
  SELECT COUNT(*)
  FROM ${RECIPES_TABLE}
  WHERE organization_id = $1
    AND ($2::uuid IS NULL OR category_id = $2)
`;

export const qFindRecipeById = `
  SELECT ${RECIPES_COLUMNS}
  FROM ${RECIPES_TABLE}
  WHERE organization_id = $1
    AND id = $2
  LIMIT 1
`;

export const qCreateRecipe = `
  INSERT INTO ${RECIPES_TABLE} (
    name,
    instructions,
    yield_weight,
    yield_unit,
    sale_price,
    portion_weight,
    photo_url,
    category_id,
    organization_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  RETURNING ${RECIPES_COLUMNS}
`;

export const qUpdateRecipe = `
  UPDATE ${RECIPES_TABLE}
  SET
    name = COALESCE($3, name),
    instructions = COALESCE($4, instructions),
    yield_weight = COALESCE($5, yield_weight),
    yield_unit = COALESCE($6, yield_unit),
    sale_price = COALESCE($7, sale_price),
    portion_weight = COALESCE($8, portion_weight),
    photo_url = COALESCE($9, photo_url),
    category_id = COALESCE($10, category_id),
    updated_at = NOW()
  WHERE organization_id = $1
    AND id = $2
  RETURNING ${RECIPES_COLUMNS}
`;

export const qDeleteRecipe = `
  DELETE FROM ${RECIPES_TABLE}
  WHERE organization_id = $1
    AND id = $2
  RETURNING ${RECIPES_COLUMNS}
`;

export const RECIPE_INGREDIENT_COLUMNS = `
  ri.id,
  ri.recipe_id AS "recipeId",
  ri.product_id AS "productId",
  ri.quantity,
  p.name AS "productName",
  p.unit AS "productUnit",
  p.price AS "productPrice"
`;

export const qGetIngredientsByRecipeId = `
  SELECT ${RECIPE_INGREDIENT_COLUMNS}
  FROM ${RECIPE_INGREDIENTS_TABLE} ri
  JOIN products p ON p.id = ri.product_id
  WHERE ri.recipe_id = $1
  ORDER BY ri.created_at ASC
`;

export const qGetIngredientsByRecipeIds = `
  SELECT ${RECIPE_INGREDIENT_COLUMNS}
  FROM  ${RECIPE_INGREDIENTS_TABLE} ri
  JOIN products p ON p.id = ri.product_id
  WHERE ri.recipe_id = ANY($1::uuid[])
  ORDER BY ri.recipe_id DESC
`;

export const qDeleteIngredientsByRecipeId = `
  DELETE FROM ${RECIPE_INGREDIENTS_TABLE}
  WHERE recipe_id = $1
`;

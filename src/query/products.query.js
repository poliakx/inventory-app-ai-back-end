export const PRODUCTS_TABLE = "products";

export const PRODUCTS_COLUMNS = `
  id,
  name,
  price,
  quantity,
  unit,
  organization_id,
  category_id AS "categoryId",
  avg_weight_grams AS "avgWeightGrams",
  avg_volume_ml AS "avgVolumeMl",
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

export const qGetAll = `
  SELECT ${PRODUCTS_COLUMNS}
  FROM ${PRODUCTS_TABLE}
  WHERE organization_id = $1
  ORDER BY created_at DESC
  LIMIT $2
  OFFSET $3
`;

export const qFindProductById = `
  SELECT ${PRODUCTS_COLUMNS}
  FROM ${PRODUCTS_TABLE}
  WHERE organization_id = $1
    AND id = $2
  LIMIT 1
`;

export const qFindByIds = `
  SELECT id
  FROM ${PRODUCTS_TABLE}
  WHERE organization_id = $1
    AND id = ANY($2::uuid[])
`

export const qCreateProduct = `
  INSERT INTO ${PRODUCTS_TABLE} (
    name,
    price,
    quantity,
    unit,
    avg_weight_grams,
    avg_volume_ml,
    category_id,
    organization_id
  )
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
  RETURNING ${PRODUCTS_COLUMNS}
`;

export const qUpdateProduct = `
  UPDATE ${PRODUCTS_TABLE}
  SET
    name = COALESCE($3, name),
    price = COALESCE($4, price),
    quantity = COALESCE($5, quantity),
    unit = COALESCE($6, unit),
    avg_weight_grams = COALESCE($7, avg_weight_grams),
    avg_volume_ml = COALESCE($8, avg_volume_ml),
    category_id = $9,
    updated_at = NOW()
  WHERE organization_id = $1
    AND id = $2
  RETURNING ${PRODUCTS_COLUMNS}
`;

export const qUpdateProductWithoutCategory = `
  UPDATE ${PRODUCTS_TABLE}
  SET
    name = COALESCE($3, name),
    price = COALESCE($4, price),
    quantity = COALESCE($5, quantity),
    unit = COALESCE($6, unit),
    avg_weight_grams = COALESCE($7, avg_weight_grams),
    avg_volume_ml = COALESCE($8, avg_volume_ml),
    updated_at = NOW()
  WHERE organization_id = $1
    AND id = $2
  RETURNING ${PRODUCTS_COLUMNS}
`;

export const qIncreaseProductQuantity = `
  UPDATE ${PRODUCTS_TABLE}
  SET
    quantity = quantity + $3,
    updated_at = NOW()
  WHERE organization_id = $1
    AND id = $2
  RETURNING *
`;

export const qDecreaseProductQuantity = `
  UPDATE ${PRODUCTS_TABLE}
  SET
    quantity = quantity - $3,
    updated_at = NOW()
  WHERE organization_id = $1
    AND id = $2
    AND quantity >= $3
  RETURNING *
`;

export const qSetProductQuantity = `
  UPDATE ${PRODUCTS_TABLE}
  SET
    quantity = $3,
    updated_at = NOW()
  WHERE organization_id = $1
    AND id = $2
  RETURNING *
`;

export const qDeleteProduct = `
  DELETE FROM ${PRODUCTS_TABLE}
  WHERE organization_id = $1
    AND id = $2
  RETURNING ${PRODUCTS_COLUMNS}
`;

export const qCountProducts = `
  SELECT COUNT(*) 
  FROM ${PRODUCTS_TABLE}
  WHERE organization_id = $1
`
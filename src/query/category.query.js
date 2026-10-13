export const CATEGORY_TABLE = "categories";

export const CATEGORY_COLUMNS = `
	id,
	name,
	description,
	parent_id AS "parentId",
	created_at AS "createdAt",
	updated_at AS "updatedAt"
`;

export const qCreateCategory = `
INSERT INTO ${CATEGORY_TABLE} (
  name,
  organization_id
)
VALUES ($1, $2)
RETURNING ${CATEGORY_COLUMNS}
`

export const qGetAll = `
SELECT ${CATEGORY_COLUMNS}
FROM ${CATEGORY_TABLE}
WHERE organization_id = $1
ORDER BY created_at DESC
LIMIT $2
OFFSET $3
`;

export const qFindById = `
SELECT id
FROM ${CATEGORY_TABLE}
WHERE organization_id = $1
AND id = $2
`

export const qUpdateCategory = `
UPDATE ${CATEGORY_TABLE}
SET name = $1, updated_at = NOW()
WHERE id = $2 AND organization_id = $3
RETURNING ${CATEGORY_COLUMNS}
`;

export const qDeleteCategory = `
DELETE FROM ${CATEGORY_TABLE}
WHERE id = $1 AND organization_id = $2
RETURNING id
`;

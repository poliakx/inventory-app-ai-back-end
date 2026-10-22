export const REFRESH_TOKEN_TABLE = "refresh_tokens"

export const REFRESH_TOKEN_COLUMNS = `
id,
user_id,
token_hash,
expires_at,
revoked_at,
created_at
`;


export const qCreateRefreshToken = `
INSERT INTO ${REFRESH_TOKEN_TABLE} (id, user_id, token_hash, expires_at)
VALUES ($1, $2, $3, $4)
RETURNING ${REFRESH_TOKEN_COLUMNS}
`;

export const qFindByHash = `
SELECT ${REFRESH_TOKEN_COLUMNS}
FROM ${REFRESH_TOKEN_TABLE}
WHERE token_hash = $1
LIMIT 1
`;

export const qFindValidByHash = `
SELECT ${ REFRESH_TOKEN_COLUMNS }
FROM ${REFRESH_TOKEN_TABLE}
WHERE token_hash = $1
  AND revoked_at IS NULL
  AND expires_at > now()
LIMIT 1
FOR UPDATE
`;

export const qRevokeById = `
UPDATE ${REFRESH_TOKEN_TABLE}
SET revoked_at = now()
WHERE id = $1
  AND revoked_at IS NULL
RETURNING ${REFRESH_TOKEN_COLUMNS}
`;

export const qRevokeByHash = `
UPDATE ${REFRESH_TOKEN_TABLE}
SET revoked_at = now()
WHERE token_hash = $1
  AND revoked_at IS NULL
RETURNING ${REFRESH_TOKEN_COLUMNS}
`;


export const qRevokeAllForUser = `
UPDATE ${REFRESH_TOKEN_TABLE}
SET revoked_at = now()
WHERE user_id = $1
  AND revoked_at IS NULL
RETURNING ${REFRESH_TOKEN_COLUMNS}
`;

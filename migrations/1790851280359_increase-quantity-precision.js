/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.sql(`
    ALTER TABLE products ALTER COLUMN quantity TYPE NUMERIC(12,3);
    ALTER TABLE recipe_ingredients ALTER COLUMN quantity TYPE NUMERIC(12,3);
    ALTER TABLE stock_movements ALTER COLUMN quantity TYPE NUMERIC(12,3);
    ALTER TABLE stock_movements ALTER COLUMN quantity_before TYPE NUMERIC(12,3);
    ALTER TABLE stock_movements ALTER COLUMN quantity_after TYPE NUMERIC(12,3)
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE products ALTER COLUMN quantity TYPE NUMERIC(10,2) USING ROUND(quantity, 2);
    ALTER TABLE recipe_ingredients ALTER COLUMN quantity TYPE NUMERIC(10,2) USING ROUND(quantity, 2);
    ALTER TABLE stock_movements ALTER COLUMN quantity TYPE NUMERIC(10,2) USING ROUND(quantity, 2);
    ALTER TABLE stock_movements ALTER COLUMN quantity_before TYPE NUMERIC(10,2) USING ROUND(quantity_before, 2);
    ALTER TABLE stock_movements ALTER COLUMN quantity_after TYPE NUMERIC(10,2) USING ROUND(quantity_after, 2)
    `)
};

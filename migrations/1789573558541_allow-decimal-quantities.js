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
    ALTER TABLE products ALTER COLUMN quantity TYPE NUMERIC(10,2) USING quantity::numeric(10,2);
    ALTER TABLE stock_movements ALTER COLUMN quantity TYPE NUMERIC(10,2) USING quantity::numeric(10,2);
    ALTER TABLE stock_movements ALTER COLUMN quantity_before TYPE NUMERIC(10,2) USING quantity_before::numeric(10,2);
    ALTER TABLE stock_movements ALTER COLUMN quantity_after TYPE NUMERIC(10,2) USING quantity_after::numeric(10,2)
    `)
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.sql(`
    ALTER TABLE products ALTER COLUMN quantity TYPE INTEGER USING ROUND(quantity)::integer;
    ALTER TABLE stock_movements ALTER COLUMN quantity TYPE INTEGER USING ROUND(quantity)::integer;
    ALTER TABLE stock_movements ALTER COLUMN quantity_before TYPE INTEGER USING ROUND(quantity_before)::integer;
    ALTER TABLE stock_movements ALTER COLUMN quantity_after TYPE INTEGER USING ROUND(quantity_after)::integer
    `)
};

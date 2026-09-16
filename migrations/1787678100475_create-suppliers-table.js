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
  pgm.createTable('suppliers', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func("uuid_generate_v4()")
    },
   organization_id: {
      type: 'uuid',
      notNull: true,
      references: 'organizations(id)',
      onDelete: 'cascade'
   },
   name: {
      type: 'text',
      notNull: true 
   },
   contact_email: {
      type: 'text'
   },
   phone_number: {
      type: 'text'
   },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("now()"),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func("now()"),
    },
  })
  pgm.createIndex('suppliers', ['organization_id'])
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
   pgm.dropTable('suppliers');
};

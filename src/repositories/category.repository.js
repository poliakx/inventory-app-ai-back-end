import { getExecutor } from "../db/executor.js";
import { qCreateCategory, qGetAll, qUpdateCategory, qDeleteCategory, qFindById } from "../query/category.query.js";

export const categoryRepository = {
  async create (data, db=null){
    const executor = getExecutor(db);
    const {name, organization_id} = data

    const { rows } = await executor.query(qCreateCategory, [name, organization_id])

    return rows[0]
  },

  async findById(organizationId, id, db = null){
    const executor = getExecutor(db);
    const { rows } = await executor.query(qFindById, [organizationId, id])
    return rows[0] ?? null
  },

  async update (id, data, organization_id, db=null){
    const executor = getExecutor(db);
    const { name, } = data;

    const { rows } = await executor.query(qUpdateCategory, [name, id, organization_id]);

    return rows[0] ?? null;
  },

  async delete (id, organization_id, db=null){
    const executor = getExecutor(db);

    const { rows } = await executor.query(qDeleteCategory, [id, organization_id]);

    return rows[0] ?? null;
  },

  async getAll (organization_id, limit = 20, offset = 0, db=null){
    const executor = getExecutor(db);

    const { rows } = await executor.query(qGetAll, [organization_id, limit, offset]);

    return rows;
  }
}
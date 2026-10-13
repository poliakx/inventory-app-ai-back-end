
import { NotFoundError, ValidationError } from "../errors/base.error.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { getOrganizationId } from "../shared/auth/getOrganizationId.js";

export const categoryService = {
  async create(data, user) {
    const { name } = data;
    const organization_id = getOrganizationId(user);

    if (!name || !name.trim()) {
      throw new ValidationError("Category name is required");
    }
    const normalizedName = name.trim();

    return await categoryRepository.create({ name: normalizedName, organization_id });
  },

  async update(id, data, user) {
    const organization_id = getOrganizationId(user);
    const { name } = data;

    const normalizedName = name.trim();

    if (!normalizedName) {
      throw new ValidationError("Category name is required");
    }

    const result = await categoryRepository.update(id, { name: normalizedName}, organization_id);

    if (!result) {
      throw new NotFoundError("Category");
    }

    return result;
  },

  async delete(id, user) {
    const organization_id = getOrganizationId(user);
    const result = await categoryRepository.delete(id, organization_id);

    if (!result) {
      throw new NotFoundError("Category");
    }

    return result;
  },

  async getAll(user, { limit, offset }) {
    const organization_id = getOrganizationId(user);
    return await categoryRepository.getAll(organization_id, limit, offset);
  },
};
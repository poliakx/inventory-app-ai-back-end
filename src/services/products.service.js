import { NotFoundError, ValidationError } from "../errors/base.error.js";
import { productsRepository } from "../repositories/products.repository.js";
import { categoryRepository } from "../repositories/category.repository.js";
import { getOrganizationId } from "../shared/auth/getOrganizationId.js";
import { CACHE_KEYS } from "../infrastructure/redis/cache.keys.js";
import { getCache, setCache, delCache } from "../infrastructure/redis/cache.helper.js";

const TTL_SECONDS = 60;

export const productsService = {
  getAll: async (user, { limit, page }) => {
    const organization_id = getOrganizationId(user);

    const offset = ( page - 1 ) * limit

    const key = CACHE_KEYS.PRODUCTS.ALL(organization_id, limit, page);

    const cached = await getCache(key);
    if (cached) return cached;

    const { rows, total } = await productsRepository.getAll(organization_id, limit, offset);

    const hasMore = offset + limit < total;

    const result = {
      products: rows,
      pagination: {
        total,
        page,
        limit,
        hasMore
      }
    }

    await setCache(key, result, TTL_SECONDS);
    return result;
  },

  getProductById: async (user, id) => {
    const organization_id = getOrganizationId(user);

    if (!id) {
      throw new ValidationError("Product id is required");
    }

    const key = CACHE_KEYS.PRODUCTS.BY_ID(organization_id, id);

    const cached = await getCache(key);
    if (cached) return cached;

    const result = await productsRepository.findById(organization_id, id);

    if (!result) {
      throw new NotFoundError("Product");
    }

    await setCache(key, result, TTL_SECONDS);
    return result;
  },

  createProduct: async (user, { categoryId, name, price, quantity, unit, avgWeightGrams, avgVolumeMl }) => {
    const organization_id = getOrganizationId(user);

     if(categoryId){
          const category = await categoryRepository.findById(organization_id, categoryId)
    
          if(!category){
            throw new NotFoundError("Category")
          }
        }

    const result = await productsRepository.create({
      organization_id,
      category_id: categoryId ?? null,
      name,
      price,
      quantity,
      unit, 
      avg_weight_grams: avgWeightGrams, 
      avg_volume_ml: avgVolumeMl
    });

    await delCache(CACHE_KEYS.PRODUCTS.ALL(organization_id));
    return result;
  },

  updateProduct: async (user, id, productData) => {
    const organization_id = getOrganizationId(user);

    if (!id) {
      throw new ValidationError("Product id is required");
    }

    if (!productData || Object.keys(productData).length === 0) {
      throw new ValidationError("No fields provided for update");
    }

    const {
      avgWeightGrams, 
      avgVolumeMl, 
      categoryId,
       ...rest 
      } = productData;

    if (categoryId === undefined){
      const result = await productsRepository.updateWithoutCategory(
        organization_id,
        id,
        {
        ...rest, 
        avg_weight_grams: avgWeightGrams, 
        avg_volume_ml: avgVolumeMl 
    })
    if (!result) {
      throw new NotFoundError("Product");
    }

    await Promise.all([
      delCache(CACHE_KEYS.PRODUCTS.ALL(organization_id)),
      delCache(CACHE_KEYS.PRODUCTS.BY_ID(organization_id, id)),
    ]);
    return result

      } else if(categoryId){
          const category = await categoryRepository.findById(organization_id, categoryId)
    
          if(!category){
            throw new NotFoundError("Category")
          }
        }
    const result = await productsRepository.update(
      organization_id,
      id,
      {
      ...rest, 
      category_id: categoryId ?? null,
      avg_weight_grams: avgWeightGrams, 
      avg_volume_ml: avgVolumeMl 
    }
    );

    if (!result) {
      throw new NotFoundError("Product");
    }

    await Promise.all([
      delCache(CACHE_KEYS.PRODUCTS.ALL(organization_id)),
      delCache(CACHE_KEYS.PRODUCTS.BY_ID(organization_id, id)),
    ]);

    return result;
  },

  deleteProduct: async (user, id) => {
    const organization_id = getOrganizationId(user);
    if (!id) {
      throw new ValidationError("Product ID is required");
    }
    const result = await productsRepository.delete(organization_id, id);

    if (!result) {
      throw new NotFoundError("Product");
    }

    await Promise.all([
      delCache(CACHE_KEYS.PRODUCTS.ALL(organization_id)),
      delCache(CACHE_KEYS.PRODUCTS.BY_ID(organization_id, id)),
    ]);

    return true;
  },
};
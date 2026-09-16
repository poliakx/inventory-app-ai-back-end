/* eslint-env jest */
import { api } from "../../setup/testClient.js";
import { createAdmin, createStaff } from "../../helpers/auth.helper.js";
import { newProduct } from "../../fixtures/product.fixture.js";
import { newStockMovement } from "../../fixtures/stock-movement.fixture.js";
import { createProduct } from "../../helpers/product.helper.js";

describe("products API (integration)", () => {
  it("GET /api/products/:id — org B cannot access org A product → 404", async () =>{
    const tokenA = await createAdmin();

    const product = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(newProduct);

    const tokenB = await createAdmin();
    const productId = product.body.data.id;

    const res = await api
      .get(`/api/products/${ productId }`)
      .set("Authorization", `Bearer ${tokenB}`)

    expect(res.statusCode).toBe(404)
  });

  it("POST/api/products — org B cannot open list of products org A → 200", async () => {
    const tokenA = await createAdmin();

    await api
      .post("/api/products")
      .set("Authorization", `Bearer ${tokenA}`)
      .send(newProduct);

    const tokenB = await createAdmin();

    const res = await api
      .get("/api/products")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.products).toEqual([]);
  });

  it("POST /api/products — admin creates product → 201", async () => {
     const token = await createAdmin();

    const res = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe(newProduct.name);
    expect(Number(res.body.data.price)).toBe(newProduct.price);
    expect(Number(res.body.data.quantity)).toBe(newProduct.quantity);
  });

  it("GET /api/products — returns paginated list → 200", async () => {
    const token = await createAdmin();

    const res = await api
      .get("/api/products")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers["content-type"]).toMatch(/json/);
    expect(Array.isArray(res.body.data.products)).toBe(true);
    expect(res.body.data.pagination).toBeDefined();
    expect(res.body.data.pagination.total).toBeDefined();
  });

  it("GET /api/products/:id — returns product by id → 200", async () => {
    const token = await createAdmin();

    const created = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);

    const createdId = created.body.data.id;

    const res = await api
      .get(`/api/products/${createdId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.id).toBe(createdId);
    expect(res.body.data.name).toBe(newProduct.name);
  });

  it("PUT /api/products/:id — admin updates product → 200", async () => {
    const token = await createAdmin();
    const updateData = { price: "10.00", quantity: 1, name: "UpdateTest", unit: "kg",  };

    const created = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);

    const createdId = created.body.data.id;

    const res = await api
      .put(`/api/products/${createdId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.name).toBe(updateData.name);
    expect(Number(res.body.data.price)).toBe(10);
    expect(Number(res.body.data.quantity)).toBe(updateData.quantity);
  });

   it("PUT /api/products/:id — admin updates product without categoryId→ 200", async () => {
    const token = await createAdmin();
    const updateData = { price: "10.00", quantity: 1, name: "UpdateTest", unit: "kg", categoryId: undefined};

    const created = await createProduct(token)

    const createdId = created.body.data.id;
    const categoryId = created.body.data.categoryId

    const res = await api
      .put(`/api/products/${createdId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.categoryId).toBe(categoryId)
  });

  it("PUT /api/products/:id — admin updates product without input value → 400", async () => {
    const token = await createAdmin();
    const updateData = { price: "", quantity: "", name: "", unit: "",  };

    const created = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);

    const createdId = created.body.data.id;

    const res = await api
      .put(`/api/products/${createdId}`)
      .set("Authorization", `Bearer ${token}`)
      .send(updateData);

    expect(res.statusCode).toBe(400);
  });

  it("DELETE /api/products/:id — admin deletes product → 204", async () => {
    const token = await createAdmin();

    const created = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);

    const createdId = created.body.data.id;

    const res = await api
      .delete(`/api/products/${createdId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(204);
    expect(res.body).toEqual({});
  });

  it("DELETE /api/products/:id — product used in a stock movement → 409 with friendly message", async () => {
    const token = await createAdmin();

    const created = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);
    const productId = created.body.data.id;

    await api
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${token}`)
      .send({ ...newStockMovement, productId });

    const res = await api
      .delete(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toMatch(/stock movements/i);
  });

  it("GET/api/products - getting products without token -> 401", async () => {
    const res = await api
      .get("/api/products")

    expect(res.statusCode).toBe(401)
  });

  it("POST/api/products - missed argument -> 400", async () => {
    const token = await createAdmin();

    const res = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({name: "test product"})

    expect(res.statusCode).toBe(400)
  });

  it("POST/api/products - negative price -> 400", async () => {
    const token = await createAdmin();

    const res = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "test product",
        price: -1,
        quantity: 10
        });

    expect(res.statusCode).toBe(400)
  });

  it("POST/api/products - staff tries to create product -> 403", async () => {
    const token = await createStaff();

    const res = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send(newProduct);

    expect(res.statusCode).toBe(403)
  });
})
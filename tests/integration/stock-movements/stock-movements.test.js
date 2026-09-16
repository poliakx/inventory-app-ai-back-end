import { api } from "../../setup/testClient.js";
import { newStockMovement } from "../../fixtures/stock-movement.fixture.js";
import { createAdmin } from "../../helpers/auth.helper.js";
import { newProduct } from "../../fixtures/product.fixture.js";

describe("Stock movements flow test", () => {
  it("POST/api/stock/movement -- admin make movement -> 201", async() =>{
    const admin = await createAdmin(); 

    const product = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${ admin }`)
      .send(newProduct);

    const productId = product.body.data.id

    const res = await api
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${admin}`)
      .send({...newStockMovement, productId})

      expect(res.statusCode).toBe(201)

    const newProductData = await api
      .get(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${admin}`);


    expect(Number(newProductData.body.data.quantity)).toEqual(newProduct.quantity + newStockMovement.quantity)
  });

  it("POST/api/stock/movement -- out movement exceeds stock -> 422", async() =>{
    const admin = await createAdmin();

    const product = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${admin}`)
      .send(newProduct);

    const productId = product.body.data.id;

    const res = await api
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${admin}`)
      .send({ type: "out", quantity: newProduct.quantity + 1, productId });

    expect(res.statusCode).toBe(422);
  });

  it("GET/api/stock/movements/:productId/history - product history movements -> 200", async () => {
    const admin = await createAdmin();

    const product = await api
      .post("/api/products")
      .set("Authorization", `Bearer ${admin}`)
      .send(newProduct);

    const productId = product.body.data.id;

    await api
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${admin}`)
      .send({ type: "out", quantity: newProduct.quantity, productId });

    const res = await api
      .get(`/api/stock/movements/${productId}/history`)
      .set("Authorization", `Bearer ${admin}`)

    expect(res.statusCode).toBe(200)
  });

  it("POST/api/stock/movements - invalid productId (not UUID) -> 400", async () => {
    const admin = await createAdmin();

    const res = await api
      .post("/api/stock/movements")
      .set("Authorization", `Bearer ${admin}`)
      .send({ ...newStockMovement, productId: "not-a-uuid" })

    expect(res.statusCode).toBe(400)
  });
});
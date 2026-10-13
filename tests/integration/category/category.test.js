import { api } from "../../setup/testClient.js";
import { newCategory } from "../../fixtures/category.fixture.js";
import { createAdmin } from "../../helpers/auth.helper.js";

describe("categories API (integration)", () => {
  it("POST/api/category — admin creates product → 201", async () => {
    const admin = await createAdmin();

    const res = await api
      .post("/api/categories")
      .set("Authorization", `Bearer ${admin}`)
      .send(newCategory)

      expect(res.statusCode).toBe(201)
  });

  it("GEt/api/categories — admin take list of categories → 200", async () => {
     const admin = await createAdmin();

     await api
      .post("/api/categories")
      .set("Authorization", `Bearer ${admin}`)
      .send(newCategory)

    const res = await api
      .get("/api/categories")
      .set("Authorization", `Bearer ${admin}`)

    expect(res.statusCode).toBe(200)
  });

  it("PUT/api/categories/:id — admin change the name of category → 200", async () => {
    const admin = await createAdmin();

    const newName = {
      name: "New category name"
    }

    const category = await  api
      .post("/api/categories")
      .set("Authorization", `Bearer ${admin}`)
      .send(newCategory);

    const id = category.body.data.id;

    const res = await api
      .patch(`/api/categories/${id}`)
      .set("Authorization", `Bearer ${admin}`)
      .send(newName);

    expect(res.statusCode).toBe(200)
  });

  it("DELETE/api/categories/:id — admin deletes category → 204", async () => {
     const admin = await createAdmin();

     const category = await  api
      .post("/api/categories")
      .set("Authorization", `Bearer ${admin}`)
      .send(newCategory);

    const id = category.body.data.id;

    const res = await api
      .delete(`/api/categories/${id}`)
      .set("Authorization", `Bearer ${admin}`)

    expect(res.statusCode).toBe(204)
  });

  it("GET/api/categories - getting categories without token -> 401", async () => {
    const res = await api
      .get("/api/categories")

    expect(res.statusCode).toBe(401)
  });

  it("PATCH/api/categories/:id - invalid UUID param -> 400", async () => {
    const admin = await createAdmin();

    const res = await api
      .patch("/api/categories/not-a-uuid")
      .set("Authorization", `Bearer ${admin}`)
      .send({ name: "New name" })

    expect(res.statusCode).toBe(400)
  });

  it("POST/api/categories - two organization can create the same name of category -> 201", async () => {
    const orgA = await createAdmin()
    const orgB = await createAdmin()

    const resA = await api
      .post("/api/categories")
      .set("Authorization", `Bearer ${orgA}`)
      .send(newCategory)

    const resB = await api
      .post("/api/categories")
      .set("Authorization", `Bearer ${orgB}`)
      .send(newCategory)   

      expect(resA.statusCode).toBe(201)
      expect(resB.statusCode).toBe(201)
      expect(resA.body.data.name).toBe(newCategory.name)
      expect(resB.body.data.name).toBe(newCategory.name)
  })
});
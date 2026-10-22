import { api } from "../../setup/testClient.js";
import { newUser } from "../../fixtures/user.fixture.js";
import { newProduct } from "../../fixtures/product.fixture.js";
import { query } from "../../../src/db/query.js";

describe("Auth /api/auth/user", ()=>{
  it("Should return 401 if token is missing", async () => {
    const res = await api.get("/api/auth/user");
    expect(res.statusCode).toBe(401);
  });

  it("GET /auth/user with valid token 200 + correct user payload", async () =>{

     await api.post("/api/auth/register").send(newUser);

    const loginRes = await api.post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password
    });

    const token = loginRes.body.data.accessToken;
    expect(loginRes.body.data.accessToken).toBeDefined();
    

    const res = await api.get("/api/auth/user").set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    
  });

  it("Should return new refresh token", async()=>{

    await api.post("/api/auth/register").send(newUser);

    const loginRes = await api.post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password,
    });
    const cookies = loginRes.headers["set-cookie"];

    const res = await api.post("/api/auth/refresh").set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("Should revoke all user tokens with refresh by old token 401", async() => {
    await api.post("/api/auth/register").send(newUser);

    const loginRes = await api.post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password,
    });

    const cookiesA = loginRes.headers["set-cookie"];
    const refreshToken = await api.post("/api/auth/refresh").set("Cookie", cookiesA);
    const cookiesB = refreshToken.header["set-cookie"]

    const resA = await api.post("/api/auth/refresh").set("Cookie", cookiesA);
    expect(resA.statusCode).toBe(401)
    const resB = await api.post("/api/auth/refresh").set("Cookie", cookiesB);
    expect(resB.statusCode).toBe(401)
  })

  it("Should check that from two same refresh request just one work", async() => {
     await api.post("/api/auth/register").send(newUser);

    const loginRes = await api.post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password,
    });

      const cookies = loginRes.headers["set-cookie"];
      const [r1, r2] = await Promise.all([
       api.post("/api/auth/refresh").set("Cookie", cookies),
       api.post("/api/auth/refresh").set("Cookie", cookies)
    ])
    const statuses = [r1.statusCode, r2.statusCode].sort()

    expect(statuses).toEqual([200, 401])
    
    
  })

  it("Should block non-admin user (403)", async()=>{

    await api.post("/api/auth/register").send(newUser);

    const resLogin = await api.post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password
    });
    expect(resLogin.statusCode).toBe(200);


    const token = resLogin.body.data.accessToken
    expect(token).toBeDefined();

    const product = await api.post("/api/products").set("Authorization", `Bearer ${token}`).send(newProduct);
    expect(product.statusCode).toBe(201);

    const productID = product.body.data.id;
    expect(productID).toBeDefined();

    await query(`
      UPDATE users SET role = $1 WHERE email = $2`,
      ["staff", newUser.email]
      );

      const resLoginStaff = await api.post("/api/auth/login").send({
      email: newUser.email,
      password: newUser.password
    });

    const staffToken = resLoginStaff.body.data.accessToken

    const res = await api.delete(`/api/products/${productID}`).set("Authorization", `Bearer ${staffToken}`)

    expect(res.statusCode).toBe(403)
  });
})
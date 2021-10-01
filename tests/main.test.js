const request = require("supertest");
const app = require("../server/express");
const config = require("../server/config/config");
const { User } = require('../server/modules/user/user.model');
const { Image } = require('../server/modules/image/image.model');
const { Deployment } = require('../server/modules/deployment/deployment.model');
const mongoose = require('mongoose');

const user = {
  credentials: {
    password: "aaaaaa",
    email: `a@a.a`,
  }
}

describe("Test the root path", () => {

  beforeAll(async () => {
    app.set('port', process.env.PORT || '3000');
    mongoose.Promise = global.Promise
    mongoose.connect(config.mongoUris[0],
      {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })

    mongoose.connection.on('error', () => {
      throw new Error(`unable to connect to database: ${config.mongoUri}`)
    })
    config.mongooseInit(mongoose, config.mongoUri)

    // await config.mongooseInit(
    //   mongoose,
    // )

    // if (true) {
    await User.deleteMany();
    // await Image.deleteMany();
    // await Deployment.deleteMany();
    // }
  });

  afterAll((done) => {
    mongoose.disconnect();
    // server.close(done);
  });

  test("It should response the GET method", async () => {
    const response = await request(app).get("/api/user/loopback");
    expect(response.statusCode).toBe(200);
  });

  test("signup", async () => {
    const response = await request(app)
      .post("/api/user")
      .send(user.credentials);

    expect(response.statusCode).toBe(201);
  });

  test("signin", async () => {
    const response = await request(app)
      .post("/api/auth/signin")
      .send(user.credentials);

    expect(response.statusCode).toBe(200);
    user.token = response.body.token
    user.payload = response.body.payload
  });

  test("faile without Bearer token", async () => {
    const response = await request(app)
      .get("/api/user")
    // .set('Authorization', 'Bearer ' + user.token)

    expect(response.statusCode).toBe(401);

  });

  test("pass with bearer token", async () => {
    const response = await request(app)
      .get("/api/user/secured-loopback")
      .set('Authorization', 'Bearer ' + user.token)

    expect(response.statusCode).toBe(200);
  });

  test("create new image", async () => {
    const response = await request(app)
      .post("/api/image")
      .set('Authorization', 'Bearer ' + user.token)
      .send({
        name: "a7",
        repository: "myRepo",
        version: "1.1.2",
        metadata: {
          a: 1,
          b: 1
        }
      })

    expect(response.statusCode).toBe(200);
  });

  test("update exsiting image", async () => {
    const response = await request(app)
      .post("/api/image")
      .set('Authorization', 'Bearer ' + user.token)
      .send({
        name: "a7",
        repository: "myRepo",
        version: "1.1.3",
        metadata: {
          a: 1,
          b: 1
        }
      })

    expect(response.statusCode).toBe(200);
  });

  test("list images", async () => {
    const response = await request(app)
      .get("/api/image")
      .set('Authorization', 'Bearer ' + user.token)
      .query({
        pageIndex: 0,
        pageSize: 2,
        orderBy: '_id',
        orderDirection: 1,
      })

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body[0]._id).toBeTruthy();
    user.imageId = response.body[0]._id
  });

  test("deploy images", async () => {
    const response = await request(app)
      .post("/api/deployment/" + user.imageId)
      .set('Authorization', 'Bearer ' + user.token)

    expect(response.statusCode).toBe(200);
    expect(response.body.count).toBeGreaterThan(0);
    user.deployment = response.body.result._id

  });


  test("list deployments", async () => {
    const response = await request(app)
      .get("/api/deployment")
      .set('Authorization', 'Bearer ' + user.token)
      .query({
        pageIndex: 0,
        pageSize: 2,
        orderBy: '_id',
        orderDirection: 1,
      })

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
  });

  test("count deployments", async () => {
    const response = await request(app)
      .get("/api/deployment/count")
      .set('Authorization', 'Bearer ' + user.token)

    expect(response.statusCode).toBe(200);
  });

  test("get combinations", async () => {
    const response = await request(app)
      .get("/api/deployment/combi")
      .set('Authorization', 'Bearer ' + user.token)
      .query({ size: 3 })

    console.log(response.body);
    expect(response.statusCode).toBe(200);
    expect(response.body.result.length).toBeGreaterThan(0);
  });

});

const request = require("supertest");
const app = require("../server/express");
const config = require("../server/config/config");
const { User } = require('../server/modules/user/user.model');
const { Keyword } = require('../server/modules/keyword/keyword.model');
const { Community } = require('../server/modules/community/community.model');
const { Post } = require('../server/modules/post/post.model');
// const { Image } = require('../server/modules/image/image.model');
// const { Deployment } = require('../server/modules/deployment/deployment.model');
const mongoose = require('mongoose');

const user = {
  credentials: {
    password: "aaaaaa",
    email: `a@a.a`,
  }
}
let communityTitle;


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

    await User.deleteMany();
    await Keyword.deleteMany();
    await Community.deleteMany();
    await Post.deleteMany();

  });

  afterAll((done) => {
    mongoose.disconnect();
    // server.close(done);
  });

  test("signup", async () => {
    const response = await request(app)
      .post("/api/user")
      .send(user.credentials);

    expect(response.statusCode).toBe(201);
    user._id = response.body._id
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
      .get("/api/auth/secured-api-example")
      .set('Authorization', 'Bearer ' + user.token)

    expect(response.statusCode).toBe(200);
  });

  test("add keywords", async () => {
    const response = await request(app)
      .post("/api/keyword")
      .set('Authorization', 'Bearer ' + user.token)
      .send([
        'word1',
        'word2',
      ])

    expect(response.statusCode).toBe(201);

  });

  test("list keywords", async () => {
    const response = await request(app)
      .get("/api/auth/secured-api-example")
      .set('Authorization', 'Bearer ' + user.token)

    expect(response.statusCode).toBe(200);
    // expect(response.body.keywords).toBe(200);
    // ['word1', 'word2', 'word3']
    // expect(new Set(["pink wool", "diorite"])).toEqual(new Set(["diorite", "pink wool"]));

  });

  test("add community", async () => {
    communityTitle = randomSuffix("public-group-") //community  title must be unique 
    const response = await request(app)
      .post("/api/community")
      .set('Authorization', 'Bearer ' + user.token)
      .send({
        title: communityTitle
      })

    expect(response.statusCode).toBe(201);
  });

  test("list communities", async () => {
    const response = await request(app)
      .get("/api/community")
      .set('Authorization', 'Bearer ' + user.token)

    printIfError(response)
    expect(response.statusCode).toBe(200);
  });

  test("deny post without membership", async () => {
    const url = `/api/post/${communityTitle}`;

    const response = await request(app)
      .post(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send()

    expect(response.statusCode).toBe(400);
  });

  test("request community membership ", async () => {
    const url = `/api/community/member-request/${communityTitle}`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send()

    printIfError('PATCH', url, response)
    expect(response.statusCode).toBe(200);
  });

  test("deny 2nd request community membership", async () => {
    const url = `/api/community/member-request/${communityTitle}`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send()

    // printIfError('PATCH', url, response)
    expect(response.statusCode).toBe(400);
  });

  test("approve community membership ", async () => {
    const url = `/api/community/member-approve/${communityTitle}`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send({ pendingMember: user._id })

    printIfError(response)
    expect(response.statusCode).toBe(200);
  });

  test("deny 2nd approve community membership ", async () => {
    const url = `/api/community/member-approve/${communityTitle}`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send({ pendingMember: user._id })

    printIfError(response)
    expect(response.statusCode).toBe(400);
  });

  test("add post", async () => {
    const url = `/api/post/${communityTitle}`;

    const response = await request(app)
      .post(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send({
        post: {
          title: randomSuffix("my post title-"), // title must be unique  
          community: communityTitle,
          body: "my post body text includes word1 word2 word3.",
        }
      })

    printIfError(response)
    expect(response.statusCode).toBe(201);
  });

  test("list post", async () => {
    const url = `/api/post/${communityTitle}`

    const response = await request(app)
      .get(url)
      .set('Authorization', 'Bearer ' + user.token)

    expect(response.statusCode).toBe(200);
    // console.log('tester-->', response.body)
  });


});

function printIfError(response, method = '', url = '') {
  if (response.statusCode >= 400) {
    console.log(
      method,
      url,
      response.statusCode,
      response.req.method,
      response.req.path,
      response.body
    )
  }
}

function randomSuffix(prefix) {
  return '' + prefix + Math.floor(Math.random() * 10000)
}
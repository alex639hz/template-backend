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
/** user object example:
{
  credentials: { password: 'aaaaaa', email: 'a@a.a' },
  _id: '615a9d1f98f842f6572d8625',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTVhOWQxZjk4Zjg0MmY2NTcyZDg2MjUiLCJpYXQiOjE2MzMzMjg0MTV9.ke-0u6sL8fJXzzSTkKRWGI1xiBlDT5ijv82tHZYPK30',
  country: 'IL'
}
 */

const communityTitle = randomSuffix("public-group-");
const posts = generatePost(communityTitle)

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
    user.country = response.body.country
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
    const response = await request(app)
      .post("/api/community")
      .set('Authorization', 'Bearer ' + user.token)
      .send({
        title: communityTitle
      })

    expect(response.statusCode).toBe(201);
  });

  test("list communities", async () => {
    const url = "/api/community";

    const response = await request(app)
      .get(url)
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

    printIfError(response)
    expect(response.statusCode).toBe(200);
  });

  test("deny 2nd request community membership", async () => {
    const url = `/api/community/member-request/${communityTitle}`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send()

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

    expect(response.statusCode).toBe(400);
  });



  posts.map((post) => { //generate posts collection
    test("generate posts collection", async () => {
      const url = `/api/post/${communityTitle}`;

      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + user.token)
        .send({ post })

      printIfError(response)
      expect(response.statusCode).toBe(201);
    })
  })


  // });

  // test("add IL post 2/3", async () => {
  //   const url = `/api/post/${communityTitle}`;
  //   const response = await request(app)
  //     .post(url)
  //     .set('Authorization', 'Bearer ' + user.token)
  //     .send({
  //       post: {
  //         title: randomSuffix("my post title-"), // title must be unique  
  //         community: communityTitle,
  //         country: user.country,
  //         score: scoreCalculator(50, 100, 100, 200),
  //         body: "my post body text includes word1 word2 word3.",
  //       }
  //     })

  //   printIfError(response)
  //   expect(response.statusCode).toBe(201);
  // });

  // test("add IL post 3/3", async () => {
  //   const url = `/api/post/${communityTitle}`;

  //   // console.log(user)

  //   const response = await request(app)
  //     .post(url)
  //     .set('Authorization', 'Bearer ' + user.token)
  //     .send({
  //       post: {
  //         title: randomSuffix("my post title-"), // title must be unique  
  //         community: communityTitle,
  //         country: user.country,
  //         score: scoreCalculator(50, 100, 100, 200),
  //         body: "my post body text includes word1 word2 word3.",
  //       }
  //     })

  //   printIfError(response)
  //   expect(response.statusCode).toBe(201);
  // });

  // for (let i = 0; i < 3; i++) {
  //   test("add US post 1/3", async () => {
  //     const url = `/api/post/${communityTitle}`;
  //     const response = await request(app)
  //       .post(url)
  //       .set('Authorization', 'Bearer ' + user.token)
  //       .send({
  //         post: {
  //           title: randomSuffix("my post title-"), // title must be unique  
  //           community: communityTitle,
  //           country: 'US',
  //           body: "my post body text includes word1 word2 word3.",
  //         }
  //       })

  //     printIfError(response)
  //     expect(response.statusCode).toBe(201);
  //   });
  // }

  test("list post", async () => {
    const url = `/api/post/${communityTitle}`

    const response = await request(app)
      .get(url)
      .set('Authorization', 'Bearer ' + user.token)

    console.log(response.body)
    expect(response.statusCode).toBe(200);
    // console.log('tester-->', response.body)
  });

});

function printIfError(response) {
  if (response.statusCode >= 400) {
    console.log(
      `${response.req.method}`,
      `${response.req.path}`,
      response.statusCode,
      response.body,
    )
  }
}

function randomSuffix(prefix) {
  return '' + prefix + Math.floor(Math.random() * 10000)
}

function scoreCalculator(likesCounter, maxLikesCounter, postLength, maxPostLength) {
  return (likesCounter / maxLikesCounter) * 80 + (postLength / maxPostLength) * 20
}

function generatePost(communityTitle) {
  return [
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'IL',
      score: scoreCalculator(50, 100, 100, 200),
      body: "my post body text includes word1 word2 word3.",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'IL',
      score: scoreCalculator(50, 100, 100, 200),
      body: "my post body text includes word1 word2 .",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'IL',
      score: scoreCalculator(50, 100, 100, 200),
      body: "my post body text includes word1 .",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'US',
      score: scoreCalculator(50, 100, 100, 200),
      body: "my post body text includes word1 word2 word3.",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'US',
      score: scoreCalculator(50, 100, 100, 200),
      body: "my post body text includes word1 .",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'US',
      score: scoreCalculator(50, 100, 100, 200),
      body: "my post body text includes word1 word2 .",
    }
  ]

}


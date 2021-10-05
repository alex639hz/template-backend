const request = require("supertest");
const app = require("../server/express");
const config = require("../server/config/config");
const { User } = require('../server/modules/user/user.model');
const { Keyword } = require('../server/modules/keyword/keyword.model');
const { Community } = require('../server/modules/community/community.model');
const { Post } = require('../server/modules/post/post.model');
const mongoose = require('mongoose');

/** user object example:
{
  credentials: { password: 'aaaaaa', email: 'a@a.a' },
  _id: '615a9d1f98f842f6572d8625',
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MTVhOWQxZjk4Zjg0MmY2NTcyZDg2MjUiLCJpYXQiOjE2MzMzMjg0MTV9.ke-0u6sL8fJXzzSTkKRWGI1xiBlDT5ijv82tHZYPK30',
  country: 'IL'
}
 */
const user = {
  credentials: {
    password: "aaaaaa",
    email: `a@a.a`,
    role: 'moderator'
  }
}


let communityTitle = "A"
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
    const url = "/api/auth/secured-api-example"
    const response = await request(app)
      .get(url)
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

    printIfError(response)
    expect(response.statusCode).toBe(201);

  });

  test("list keywords", async () => {
    const response = await request(app)
      .get("/api/keyword")
      .set('Authorization', 'Bearer ' + user.token)

    printIfError(response)
    expect(response.statusCode).toBe(200);

  });

  test("add community A", async () => {
    const url = "/api/community";
    const response = await request(app)
      .post(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send({
        title: communityTitle
      })

    printIfError(response)
    expect(response.statusCode).toBe(201);
  });

  test("add community B", async () => {
    const url = "/api/community";
    const response = await request(app)
      .post(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send({ title: 'B' })

    printIfError(response)
    expect(response.statusCode).toBe(201);
  });

  test("add community C", async () => {
    const url = "/api/community";
    const response = await request(app)
      .post(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send({ title: 'C' })

    printIfError(response)
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


  test("request community A membership", async () => {
    const url = `/api/community/member-request/${communityTitle}`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send()

    printIfError(response)
    expect(response.statusCode).toBe(200);
  });

  test("request community B membership", async () => {
    const url = `/api/community/member-request/B`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send()

    printIfError(response)
    expect(response.statusCode).toBe(200);
  });

  test("request community C membership", async () => {
    const url = `/api/community/member-request/C`;

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

  test("approve community A membership", async () => {
    const url = `/api/community/member-approve/${communityTitle}`;

    const response = await request(app)
      .patch(url)
      .set('Authorization', 'Bearer ' + user.token)
      .send({ pendingMember: user._id })

    printIfError(response)
    expect(response.statusCode).toBe(200);
  });

  test("approve community B membership ", async () => {
    const url = `/api/community/member-approve/B`;

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

  //generate posts collection
  posts.map((post) => {
    test("generate a post", async () => {
      const url = `/api/post/${communityTitle}`;

      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + user.token)
        .send({ post })

      printIfError(response)
      expect(response.statusCode).toBe(201);
    })

    test("approve a post", async () => {
      const url = `/api/post/${communityTitle}`;

      const response = await request(app)
        .post(url)
        .set('Authorization', 'Bearer ' + user.token)
        .send({ post })

      printIfError(response)
      expect(response.statusCode).toBe(201);
    })

  })



  test("Get Feed", async () => {
    const url = `/api/post`

    const response = await request(app)
      .get(url)
      .set('Authorization', 'Bearer ' + user.token)

    console.log(response.body)

    expect(response.statusCode).toBe(200);
  });


});

function printIfError(response) {
  if (response.statusCode >= 400) {
    console.log(
      // response.req.method,
      // response.req.path,
      response.statusCode,
      response.body,
    )
  }
}

function randomSuffix(prefix) {
  return '' + prefix + Math.floor(Math.random() * 10000)
}

function scoreCalculator(likesCounter, maxLikesCounter, postLength, maxPostLength) {
  return (likesCounter / maxLikesCounter) * 80 + (1 - postLength / maxPostLength) * 20
}

function generatePost(communityTitle) {
  return [
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'IL',
      score: scoreCalculator(100, 100, 100, 200),
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
      community: 'other',
      country: 'IL',
      score: scoreCalculator(100, 100, 100, 200),
      body: "my post body text includes word1 .",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: 'C',
      country: 'IL',
      score: scoreCalculator(100, 100, 10, 200),
      body: "my post body text includes word1 .",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: communityTitle,
      country: 'US',
      score: scoreCalculator(50, 100, 50, 200),
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
      community: 'B',
      country: 'US',
      score: scoreCalculator(50, 100, 150, 200),
      body: "my post body text includes word1 word2 .",
    },
    {
      title: randomSuffix("my post title-"), // title must be unique  
      community: 'C',
      country: 'US',
      score: scoreCalculator(50, 100, 150, 200),
      body: "my post body text includes word1 word2 .",
    }
  ]

}

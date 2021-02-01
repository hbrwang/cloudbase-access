import { Router } from "../src/index";

const methods = ["GET", "POST", "DELETE", "PUT", "PATCH"];

methods.forEach((method) => {
  test(`${method} restful test`, async function () {
    const event = {
      body: {},
      path: "/restful",
      httpMethod: method,
    };
    const router = new Router(event, {}, undefined, "test/controllers");

    const result = (await router.do()).result;
    expect(result.statusCode).toBe(200);
    expect((result.body as Record<string, unknown>).method).toBe(method);
  });
});

test(`method not allowed restful test`, async function () {
  const event = {
    body: {},
    path: "/restful",
    httpMethod: "POST1",
  };
  const router = new Router(event, {}, undefined, "test/controllers");

  const result = (await router.do()).result;
  expect(result.statusCode).toBe(405);
});

test(`restful query test`, async function () {
  let event = {
    body: {},
    path: "/restful/45",
    httpMethod: "GET",
  };
  let router = new Router(event, {}, undefined, "test/controllers");

  let result = (await router.do()).result;
  expect(result.statusCode).toBe(200);
  expect((result.body as Record<string, unknown>).id).toBe("45");

  event = {
    body: {},
    path: "/restful/11/animals",
    httpMethod: "GET",
  };
  router = new Router(event, {}, undefined, "test/controllers");

  result = (await router.do()).result;
  expect(result.statusCode).toBe(200);
  expect((result.body as Record<string, unknown>).id).toBe("11");
});
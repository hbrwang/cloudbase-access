import { HttpResult, Middleware, Router } from "../src/index";
import { MiddlewareType } from "../src/Middleware";

test("middleware test err", async function () {
  const stepResult: Record<string, number> = {
    step: 0,
  };

  const event = {
    body: {},
    path: "/actions/notExist",
  };
  const router = new Router(event, {}, undefined, "test");

  router.configure(new BeforeStartMdw(stepResult));
  router.configure(new BeforeActionMdw(stepResult));
  router.configure(new BeforeSuccessEndMdw(stepResult));
  router.configure(new BeforeErrEndMdw(stepResult));

  const result = (await router.do()).result;
  expect(result.statusCode).toBe(404);
  expect(stepResult.step).toBe(1);
});

class BeforeStartMdw extends Middleware {
  constructor(private stepResult: Record<string, number>) {
    super(MiddlewareType.BeforeStart);
  }

  async do(): Promise<HttpResult | null> {
    this.stepResult.step += 1;
    return null;
  }
}

class BeforeActionMdw extends Middleware {
  constructor(private stepResult: Record<string, number>) {
    super(MiddlewareType.BeforeAction);
  }

  async do(): Promise<HttpResult | null> {
    this.stepResult.step += 10;
    return null;
  }
}

class BeforeSuccessEndMdw extends Middleware {
  constructor(private stepResult: Record<string, number>) {
    super(MiddlewareType.BeforeSuccessEnd);
  }

  async do(): Promise<HttpResult | null> {
    this.stepResult.step += 100;
    return null;
  }
}

class BeforeErrEndMdw extends Middleware {
  constructor(private stepResult: Record<string, number>) {
    super(MiddlewareType.BeforeErrEnd);
  }

  async do(): Promise<HttpResult | null> {
    this.stepResult.step += 1000;
    return null;
  }
}

import { Action } from "../../../src";

export default class extends Action {
  constructor() {
    super(["admin"]);
  }

  async invoke(): Promise<void> {
    const { account, password } = this.httpContext.request.headers;

    this.ok({
      msg: "admin auth",
      account,
      password,
    });
  }
}

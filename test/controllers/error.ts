import { Action, ErrorMessage, Response, ResponseError } from "../../src";
import StatusCode from "../../src/Response/StatusCode";

export default class extends Action {
  async invoke(): Promise<void> {
    throw new ResponseError(
      new Response(StatusCode.badRequest, <ErrorMessage>{ message: "br" })
    );
  }
  constructor() {
    super();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).res = new Response(StatusCode.ok);
  }
}

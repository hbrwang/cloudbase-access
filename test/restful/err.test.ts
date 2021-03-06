import { HttpMethod, Startup } from "../../src/index";
import "../UseTest";
import "../../src/Router";

test(`action name error`, async function () {
  const event = {
    body: {},
    path: "/err",
    httpMethod: HttpMethod.post,
  };
  const startup = new Startup(event, {}).useTest().useRouter();
  await startup.invoke();
  const result = await startup.invoke();
  expect(result.statusCode).toBe(404);
});

import { Startup } from "@hal-wang/cloudbase-access";

export const main = async (
  event: Record<string, unknown>,
  context: Record<string, unknown>
): Promise<unknown> => {
  const startup = new Startup(event, context);
  startup.use(async (ctx, next) => {
    ctx.res.headers.demo = "ts";
    await next();
  });
  startup.useRouter();
  return await startup.invoke();
};

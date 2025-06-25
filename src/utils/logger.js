import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: "debug",
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
      },
    },
  }),
});

export default logger;

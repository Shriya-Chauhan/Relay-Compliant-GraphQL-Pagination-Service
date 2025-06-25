import { expressMiddleware } from "@as-integrations/express5";
import express from "express";
import http from "http";
import cors from "cors";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { typeDefs } from "./graphql/schema/typeDefs.js";
import { resolvers } from "./graphql/resolvers/resolvers.js";
import logger from "./utils/logger.js";

const app = express();
const httpServer = http.createServer(app);

//  Apollo Server with drain plugin
const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  formatError: (error) => {
    logger.error(`[GraphQL Error]: ${error.message}`, {
      path: error.path,
      locations: error.locations,
      stack: error.extensions?.exception?.stacktrace,
    });
    return error;
  },
});

await server.start();

app.use(
  "/graphql",
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({
      token: req.headers.token,
      // We can add other things here, like user info from token, DB, etc.
    }),
  })
);

// Start the server
httpServer.listen({ port: 5000 }, () => {
  console.log("🚀 Server ready at http://localhost:5000/graphql");
});

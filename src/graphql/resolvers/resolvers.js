import { decodeCursor, encodeCursor } from "../../utils/cursor.js";
import { PrismaClient } from "../../../generated/prisma/index.js";
import logger from "../../utils/logger.js";

const prisma = new PrismaClient();

export const resolvers = {
  Query: {
    developers: async (_, args) => {
      const {
        developerFilter,
        sortBy = "NAME",
        sortOrder = "ASC",
        first,
        after,
        last,
        before,
      } = args;

      logger.info("Incoming request: developers query");
      logger.debug({ args }, "Query arguments");

      const filters = {};

      // Handle filters
      if (developerFilter?.location?.state) {
        filters.state = developerFilter.location.state;
      }
      if (developerFilter?.location?.city?.area) {
        filters.cityArea = developerFilter.location.city.area;
      }
      if (developerFilter?.location?.city?.pin) {
        filters.cityPin = developerFilter.location.city.pin;
      }
      if (developerFilter?.department) {
        filters.department = developerFilter.department;
      }
      if (developerFilter?.designation) {
        filters.designation = developerFilter.designation;
      }

      logger.debug({ filters }, "Applied filters");

      // Map sortBy enum to DB field
      const sortField =
        {
          NAME: "name",
          DESIGNATION: "designation",
        }[sortBy] || "name";

      const orderDirection = sortOrder === "DESC" ? "desc" : "asc";
      logger.debug({ sortField, orderDirection }, "Sorting configuration");

      // Count total matching records
      const totalCount = await prisma.developer.count({ where: filters });
      logger.info({ totalCount }, "Total matching developers");

      //Determining the actual requested count
      const requestedCount = first || last || 20;

      // Base pagination args
      let paginationArgs = {
        where: filters,
        orderBy: [{ [sortField]: orderDirection }, { id: orderDirection }],
        include: {
          project: true,
        },
        take: requestedCount + 1, // Always take one extra
      };

      // Cursor Logic — Forward Pagination
      if (after && first) {
        const { sortValue, id } = decodeCursor(after);
        paginationArgs.where = {
          AND: [
            filters,
            {
              OR: [
                {
                  [sortField]: {
                    [orderDirection === "asc" ? "gt" : "lt"]: sortValue,
                  },
                },
                {
                  [sortField]: sortValue,
                  id: { [orderDirection === "asc" ? "gt" : "lt"]: id },
                },
              ],
            },
          ],
        };
      }

      // Cursor Logic — Backward Pagination
      if (before && last) {
        const { sortValue, id } = decodeCursor(before);
        const reverseOrder = orderDirection === "asc" ? "desc" : "asc";

        paginationArgs.orderBy = [
          { [sortField]: reverseOrder },
          { id: reverseOrder },
        ];
        // Use requestedCount + 1 for consistency
        paginationArgs.take = requestedCount + 1;

        paginationArgs.where = {
          AND: [
            filters,
            {
              OR: [
                {
                  [sortField]: {
                    [reverseOrder === "asc" ? "gt" : "lt"]: sortValue,
                  },
                },
                {
                  [sortField]: sortValue,
                  id: { [reverseOrder === "asc" ? "gt" : "lt"]: id },
                },
              ],
            },
          ],
        };
      }

      let nodes = await prisma.developer.findMany(paginationArgs);
      logger.info({ count: nodes.length }, "Developers fetched");

      // Reverse results for backward pagination
      if (before && last) {
        nodes.reverse();
      }

      // Determining if there are more results
      const hasMoreResults = nodes.length > requestedCount;

      // Proper pagination logic
      let hasNext = false;
      let hasPrev = false;

      if (first) {
        // Forward pagination
        hasNext = hasMoreResults; //Are there more items after current page?
        hasPrev = !!after; // Are there items before current page?
      } else if (last) {
        // Backward pagination
        hasNext = !!before; // Are there items after current page?
        hasPrev = hasMoreResults; //Are there more items before current page?
      }

      // Remove the extra item if we got it
      const actualNodes = hasMoreResults
        ? nodes.slice(0, requestedCount)
        : nodes;

      // Create edges
      const edges = actualNodes.map((dev) => ({
        cursor: encodeCursor({
          sortValue: dev[sortField],
          id: dev.id,
        }),
        node: dev,
      }));

      const startCursor = edges.length > 0 ? edges[0].cursor : "";
      const endCursor = edges.length > 0 ? edges[edges.length - 1].cursor : "";

      logger.debug(
        {
          hasNext,
          hasPrev,
          startCursor,
          endCursor,
          actualCount: actualNodes.length,
          totalFetched: nodes.length,
          hasMoreResults,
          paginationDirection: first ? "forward" : "backward",
        },
        "Page info"
      );

      return {
        totalCount,
        pageInfo: {
          hasNext,
          hasPrev,
          startCursor,
          endCursor,
        },
        edges,
      };
    },
  },
};

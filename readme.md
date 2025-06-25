## 📌 Project Overview

This project is a Relay-Compliant GraphQL Pagination Service for Developer Search. It enables clients to query and paginate through a list of software developers filtered by location, department, and designation.

>rough work Repo-  https://github.com/Shriya-Chauhan/relayPagination-rough

## What’s Implemented

This GraphQL pagination service currently supports:

- **Filtering** based on developer attributes like:

  - `state`, `department`, `designation`
  - Nested fields like `location.city.pin` and `location.city.area`

- **Relay-compliant cursor-based pagination** with support for:

  - Forward pagination (`first`, `after`)
  - Backward pagination (`last`, `before`)
  - Each API response includes `pageInfo` for easy navigation, and `edges` with individual nodes and their respective cursors.

- **Sorting** developers by fields like `name` or `designation`
- **Cursor encoding** using developer IDs for opaque navigation
- Efficient queries using Prisma ORM
- Modular project structure
- Dummy data seeding with 100+ developer records
- Sample GraphQL queries included


## 📁 Project Structure

```bash
relay-pagination-devs/
├── generated/ # Auto-generated Prisma client (excluded from version control)
├── node_modules/
├── prisma/
│ ├── migrations/
│ ├── dev.db # Local SQLite database
│ ├── schema.prisma # Prisma schema
│ └── seed.js # Script to seed the database with mock developer data
├── src/
│ ├── graphql/
│ │ ├── resolvers/
│ │ │ └── resolvers.js
│ │ └── schema/
│ │   └── typeDefs.js
│ ├── utils/ # Utility functions (cursor, logger, etc.)
│ └── index.js # Entry point for the GraphQL server
├── .env
├── .gitignore
├── package.json
├── package-lock.json

```

---

## How to Run Locally

Follow these steps to set up and run the project on your local machine:

#### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/relay-pagination-devs.git
cd relay-pagination-devs

```

#### 2. **Install Dependencies**

Make sure you have **Node.js** installed. Then run:

```bash
npm install

```

#### 3. **Set Up Environment Variables**

Create a `.env` file in the root directory and add your database connection string:

```env
DATABASE_URL="file:./dev.db"

```

> ✅ If you're using a different database like PostgreSQL, update the `DATABASE_URL` accordingly.

#### 4. **Run Prisma Migrations & Seed the DB**

```bash
npx prisma migrate dev --name init
npm run seed

```
To visualize data on Prisma Studio:
```bash
npx prisma studio

```

#### 5. **Start the Server**

```bash
npm start

```

The GraphQL server will be available at:

```
http://localhost:5000/graphql

```

You can now open the [Apollo Sandbox](https://studio.apollographql.com/sandbox) or use [GraphQL Playground](https://github.com/graphql/graphql-playground) to test queries.

---

## Implementation Details

### Pagination Logic

This project uses **Relay-style cursor-based pagination**, which is more efficient and scalable than offset-based pagination for large datasets.

**Key Concepts:**

- `first` & `after`: Used for **forward pagination**.  
  Fetch the next _n_ items **after** a specific cursor.
- `last` & `before`: Used for **backward pagination**.  
  Fetch the previous _n_ items **before** a specific cursor.
- `edges`: Contains the actual paginated records along with their **cursor** (a unique identifier for that record).
- `pageInfo`: Contains metadata:

  - `hasNext`: Indicates if there are more pages after this one.
  - `hasPrev`: Indicates if there are pages before this one.
  - `startCursor` and `endCursor`: Mark the range of the current page for pagination navigation.

- A **cursor** is generated for each record using its sort value and unique identifier. This cursor is opaque and encoded, helping ensure stateless pagination.

- To maintain consistency, especially when multiple records share the same sort value (like name or designation), a secondary sort using the `id` field is used as a tie-breaker.
- For backward pagination, results are fetched in reverse order and then reversed on the client to restore natural order, since the database doesn’t inherently support backward pagination.

This approach ensures **stable, efficient, and cursor-safe pagination** compliant with the Relay specification.

**Example Use Cases:**

- `first: 10`: Get the first 10 developers.
- `first: 10, after: "<cursor>"`: Get the next 10 developers after the given cursor.
- `last: 5, before: "<cursor>"`: Get the previous 5 developers before the given cursor.

### Filtering Logic

The API supports flexible filtering based on the following developer attributes:

- **Location:** state, city area, and city pin
- **Department**
- **Designation**

Filters can be applied individually or in combination. The filtering system is designed to be modular, allowing clients to narrow down results based on hierarchical location data (like state → city → pin/area) along with role-specific filters.

### Sorting Logic

Users can sort the developer list based on:

- **Name**
- **Designation**

Each of these can be sorted in **ascending** or **descending** order.

To ensure predictable sorting, especially when multiple developers share the same value in the selected sort field, the API adds a secondary level of sorting using the developer's unique ID. This ensures that the order of results is consistent across paginated responses.

### Logging

- Logs capture events like incoming requests, pagination parameters, sorting strategy, and number of records returned.

---

### Tech Stack

| Technology        | Why It's Used                                              |
| ----------------- | ---------------------------------------------------------- |
| **Node.js**       | JavaScript runtime for building scalable backend services. |
| **Express 5**     | Lightweight framework to handle routing and middleware.    |
| **GraphQL**       | Allows clients to fetch only the data they need.           |
| **Apollo Server** | Makes it easy to integrate GraphQL with Express.           |
| **Prisma ORM**    | Helps write safe and efficient database queries.           |
| **SQLite**        | Simple file-based database, great for local development.   |

#### Developer Tools

| Tool                   | Why It's Used                                  |
| ---------------------- | ---------------------------------------------- |
| **Faker.js**           | Generates dummy data to populate the database. |
| **Pino + Pino-Pretty** | Logging for easier debugging.                  |
| **Nodemon**            | Auto-restarts the server when files change.    |
| **CORS**               | Allows API access from frontend clients.       |
| **Body-Parser**        | Parses incoming request bodies into JSON.      |

---

## Query Examples

1.  This query fetches the first 10 developers who are **Software Engineers** in the **IT department**, located in **Hamirpur (Pin: 177023), Himachal Pradesh**. It uses **Relay-style pagination** with a cursor to navigate through results efficiently.

```graphql
query GetAllSoftwareEnginnerDevelopersInHamirpur {
  developers(
    developerFilter: {
      location: {
        city: { pin: 177023, area: "Hamirpur" }
        state: "Himachal Pradesh"
      }
      department: IT
      designation: SOFTWARE_ENGINEER
    }
    first: 10
    after: "<cursor>"
  ) {
    totalCount
    pageInfo {
      hasNext
      hasPrev
      startCursor
      endCursor
    }
    edges {
      cursor
      node {
        designation
        name
        phoneNumber
        state
        department
        cityPin
        cityArea
        emailAddress
        project {
          name
        }
      }
    }
  }
}
```

2.  Query to get developers sorted by name (ascending):

```graphql
query GetDevsSortedByName {
  developers(sortBy: NAME, sortOrder: ASC, first: 5) {
    edges {
      node {
        name
        designation
        emailAddress
      }
    }
    pageInfo {
      hasNext
      endCursor
    }
  }
}
```

3.  Query to get developers sorted by designation (descending):

```graphql
query GetDevsSortedByDesignation {
  developers(sortBy: DESIGNATION, sortOrder: DESC, first: 5) {
    edges {
      node {
        name
        designation
      }
    }
    pageInfo {
      hasNext
      endCursor
    }
  }
}
```

4. Query to fetch the first 5 developers after a cursor:

```graphql
query GetNextPage {
  developers(first: 5, after: "<your-cursor-here>") {
    edges {
      node {
        name
        designation
      }
      cursor
    }
    pageInfo {
      hasNext
      endCursor
    }
  }
}
```

Replace `"<your-cursor-here>"` with the `endCursor` from the previous result to fetch the next page.

5. Query to fetch the last 5 developers before a cursor:

```graphql
query GetPreviousPage {
  developers(last: 5, before: "<your-cursor-here>") {
    edges {
      node {
        name
        designation
      }
      cursor
    }
    pageInfo {
      hasPrev
      startCursor
    }
  }
}
```

Replace `"<your-cursor-here>"` with the `startCursor` from the previous result to fetch the previous page.

---

### Limitations & Scope for Improvement

#### Filter Scope (Best Practices)

Filters are currently optimized for the most practical fields:

| Field         | Why It's Included              |
| ------------- | ------------------------------ |
| `designation` | Common in dropdowns            |
| `department`  | Useful for grouping developers |
| `state/city`  | Location-based filtering       |
| `name/email`  | Ideal for search/autocomplete  |

> ✅ In future versions, filters can be extended with more dynamic configurations as needed.

#### Case-Insensitive Filtering

- Prisma’s `mode: "insensitive"` does **not** work with **SQLite**, so filters like `name` and `email` are currently case-sensitive.
- For robust case-insensitive filtering, switching to **PostgreSQL** or **MySQL** is recommended.

#### Backward Pagination

- Prisma does **not** natively support backward cursor pagination.
- To enable `last + before` pagination, the API:
  1. Reverses the sort order
  2. Fetches `take` records using the inverted cursor
  3. Reverses the result back to correct order
- This works well for small to medium datasets but may need optimization for large-scale systems.

#### Caching

- `totalCount` is calculated on every request, which may become expensive.
- Redis-based caching is a good next step to improve performance.

> Future versions can introduce Redis or other caching layers to improve scalability and reduce load on the database.

---

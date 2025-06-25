export const typeDefs = `#graphql
  type Query {
    developers(
      developerFilter: DeveloperFilterInput
      sortBy: DeveloperSortField
      sortOrder: SortOrder = ASC
      first: Int
      after: String
      last: Int
      before: String
    ): DeveloperConnection!
  }
#Pagination Types
  type DeveloperConnection {
    totalCount: Int!
    pageInfo: PageInfo!
    edges: [DeveloperEdge!]!
  }

  type DeveloperEdge {
    cursor: String!
    node: Developer!
  }

  type PageInfo {
    hasNext: Boolean!
    hasPrev: Boolean!
    startCursor: String!
    endCursor: String!
  }
#Core Types
  type Developer {
    id: ID!
    name: String!
    phoneNumber: String!
    emailAddress: String!
    state: String!
    cityArea: String!
    cityPin: Int!
    department: Department!
    designation: Designation!
    project: Project!
  }

  type Project {
    id: ID!
    name: String!
    developers: [Developer!]!
  }

#Input Filters
  input DeveloperFilterInput {
    location: LocationFilterInput
    department: Department
    designation: Designation
  }

  input LocationFilterInput {
    city: CityFilterInput
    state: String
  }

  input CityFilterInput {
    pin: Int
    area: String
  }


#Enums
  enum Designation {
    SOFTWARE_ENGINEER
    DATA_ANALYST
    MANAGER
  }

  enum Department {
    IT
    HR
    MARKETING
    SALES
  }

  enum DeveloperSortField {
    NAME
    DESIGNATION
  }

  enum SortOrder {
    ASC
    DESC
  }
`;

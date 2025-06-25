import { PrismaClient } from "../generated/prisma/index.js";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

const departments = ["IT", "HR", "MARKETING", "SALES"];
const designations = ["SOFTWARE_ENGINEER", "DATA_ANALYST", "MANAGER"];
const cities = [
  { area: "Hamirpur", pin: 177023, state: "Himachal Pradesh" },
  { area: "Shimla", pin: 171001, state: "Himachal Pradesh" },
  { area: "Delhi", pin: 110001, state: "Delhi" },
  { area: "Bangalore", pin: 560001, state: "Karnataka" },
];

async function main() {
  // Optional: To clear previously seeded  data
  await prisma.developer.deleteMany({});
  await prisma.project.deleteMany({});

  // Creating 10 projects
  const projects = [];
  for (let i = 0; i < 10; i++) {
    const project = await prisma.project.create({
      data: {
        name: faker.company.name(),
      },
    });
    projects.push(project);
  }

  // Seeding 130 guaranteed matching developers
  for (let i = 0; i < 130; i++) {
    const project = faker.helpers.arrayElement(projects);
    const firstPhNoDigit = faker.helpers.arrayElement(["6", "7", "8", "9"]);
    const remainingPhNoDigits = faker.string.numeric(9);
    await prisma.developer.create({
      data: {
        name: faker.person.fullName(),
        phoneNumber: `+91 ${firstPhNoDigit}${remainingPhNoDigits}`,
        emailAddress: faker.internet.email(),
        state: "Himachal Pradesh",
        cityArea: "Hamirpur",
        cityPin: 177023,
        department: "IT",
        designation: "SOFTWARE_ENGINEER",
        projectId: project.id,
      },
    });
  }

  //  Seed 270 additional random developers
  for (let i = 0; i < 270; i++) {
    const city = faker.helpers.arrayElement(cities);
    const department = faker.helpers.arrayElement(departments);
    const designation = faker.helpers.arrayElement(designations);
    const project = faker.helpers.arrayElement(projects);
    const firstPhNoDigit = faker.helpers.arrayElement(["6", "7", "8", "9"]);
    const remainingPhNoDigits = faker.string.numeric(9);

    await prisma.developer.create({
      data: {
        name: faker.person.fullName(),
        phoneNumber: `+91 ${firstPhNoDigit}${remainingPhNoDigits}`,
        emailAddress: faker.internet.email(),
        state: city.state,
        cityArea: city.area,
        cityPin: city.pin,
        department,
        designation,
        projectId: project.id,
      },
    });
  }

  console.log(
    "🎉 Seed complete! 130 targeted + 270 random = 400 developers inserted."
  );
}

main()
  .catch((e) => {
    console.error("Seed Failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

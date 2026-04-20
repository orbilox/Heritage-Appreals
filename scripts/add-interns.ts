import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🚀 Adding Marketing team employees...\n");

  // ── 1. Get or create Marketing department ────────────────────────────────
  let dept = await db.department.findFirst({ where: { name: "Marketing" } });
  if (!dept) {
    dept = await db.department.create({ data: { name: "Marketing", description: "Marketing Department" } });
    console.log("✅ Created Marketing department");
  } else {
    console.log("ℹ️  Marketing department already exists");
  }

  // ── 2. Generate next employee codes ─────────────────────────────────────
  const count = await db.employee.count();
  let codeIdx = count + 1;
  const nextCode = () => `EMP${String(codeIdx++).padStart(4, "0")}`;

  // ── 3. Add Sanjeev Kumar (Marketing Manager) ─────────────────────────────
  let sanjeev = await db.employee.findFirst({ where: { email: "sanjeev.kumar@company.com" } });
  if (!sanjeev) {
    sanjeev = await db.employee.create({
      data: {
        employeeCode: nextCode(),
        firstName: "Sanjeev",
        lastName: "Kumar",
        email: "sanjeev.kumar@company.com",
        designation: "Marketing Manager",
        departmentId: dept.id,
        employmentType: "FULL_TIME",
        joiningDate: new Date(),
        status: "ACTIVE",
      },
    });
    console.log(`✅ Created employee: Sanjeev Kumar (${sanjeev.employeeCode})`);
  } else {
    console.log(`ℹ️  Sanjeev Kumar already exists (${sanjeev.employeeCode})`);
  }

  // Create Sanjeev's login (MANAGER role)
  const existingMgrUser = await db.user.findFirst({ where: { employeeId: sanjeev.id } });
  if (!existingMgrUser) {
    const hash = await bcrypt.hash("Welcome@123", 10);
    await db.user.create({
      data: { email: "sanjeev.kumar@company.com", password: hash, role: "MANAGER", employeeId: sanjeev.id },
    });
    console.log("   🔑 Login: sanjeev.kumar@company.com | Welcome@123 | Role: MANAGER");
  } else {
    console.log(`   ℹ️  Login already exists for Sanjeev Kumar`);
  }

  // ── 4. Intern definitions ─────────────────────────────────────────────────
  const interns = [
    { firstName: "Damanpreet", lastName: "Kaur",   email: "damanpreet.kaur@company.com" },
    { firstName: "Manish",     lastName: "Kumar",  email: "manish.kumar@company.com"    },
    { firstName: "Vishali",    lastName: "",        email: "vishali@company.com"          },
    { firstName: "Karan",      lastName: "Kaint",  email: "karan.kaint@company.com"     },
    { firstName: "Emp",        lastName: "8901",   email: "emp8901@company.com"          },
  ];

  console.log("\n👥 Adding interns under Sanjeev Kumar...\n");

  for (const intern of interns) {
    // Check if already exists
    let emp = await db.employee.findFirst({ where: { email: intern.email } });
    if (!emp) {
      emp = await db.employee.create({
        data: {
          employeeCode: nextCode(),
          firstName: intern.firstName,
          lastName: intern.lastName,
          email: intern.email,
          designation: "Marketing Intern",
          departmentId: dept.id,
          managerId: sanjeev.id,
          employmentType: "INTERN",
          joiningDate: new Date(),
          status: "ACTIVE",
        },
      });
      console.log(`✅ Created: ${intern.firstName} ${intern.lastName} (${emp.employeeCode})`);
    } else {
      console.log(`ℹ️  Already exists: ${intern.firstName} ${intern.lastName} (${emp.employeeCode})`);
    }

    // Create login
    const existingUser = await db.user.findFirst({ where: { employeeId: emp.id } });
    if (!existingUser) {
      const hash = await bcrypt.hash("Welcome@123", 10);
      await db.user.create({
        data: { email: intern.email, password: hash, role: "EMPLOYEE", employeeId: emp.id },
      });
      console.log(`   🔑 Login: ${intern.email} | Welcome@123 | Role: EMPLOYEE`);
    } else {
      console.log(`   ℹ️  Login already exists`);
    }
  }

  console.log("\n🎉 Done! Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Name                  | Email                          | Password     | Role");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Sanjeev Kumar         | sanjeev.kumar@company.com      | Welcome@123  | MANAGER");
  console.log("Damanpreet Kaur       | damanpreet.kaur@company.com    | Welcome@123  | EMPLOYEE");
  console.log("Manish Kumar          | manish.kumar@company.com       | Welcome@123  | EMPLOYEE");
  console.log("Vishali               | vishali@company.com            | Welcome@123  | EMPLOYEE");
  console.log("Karan Kaint           | karan.kaint@company.com        | Welcome@123  | EMPLOYEE");
  console.log("Emp 8901              | emp8901@company.com            | Welcome@123  | EMPLOYEE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => db.$disconnect());

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// One-time seeding endpoint — protected by secret token
const SECRET = "orbilox-seed-2026";

export async function POST(req: NextRequest) {
  const { secret } = await req.json().catch(() => ({}));
  if (secret !== SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const results: string[] = [];

  // 1. Marketing department
  let dept = await db.department.findFirst({ where: { name: "Marketing" } });
  if (!dept) {
    dept = await db.department.create({ data: { name: "Marketing", description: "Marketing Department" } });
    results.push("Created Marketing department");
  } else {
    results.push("Marketing department already exists");
  }

  // 2. Next employee code helper
  const count = await db.employee.count();
  let codeIdx = count + 1;
  const nextCode = () => `EMP${String(codeIdx++).padStart(4, "0")}`;

  // 3. Sanjeev Kumar — Marketing Manager
  let sanjeev = await db.employee.findFirst({ where: { email: "sanjeev.kumar@company.com" } });
  if (!sanjeev) {
    sanjeev = await db.employee.create({
      data: {
        employeeCode: nextCode(),
        firstName: "Sanjeev", lastName: "Kumar",
        email: "sanjeev.kumar@company.com",
        designation: "Marketing Manager",
        departmentId: dept.id,
        employmentType: "FULL_TIME",
        joiningDate: new Date(),
        status: "ACTIVE",
      },
    });
    results.push(`Created Sanjeev Kumar (${sanjeev.employeeCode})`);
  } else {
    results.push(`Sanjeev Kumar already exists (${sanjeev.employeeCode})`);
  }

  if (!await db.user.findFirst({ where: { employeeId: sanjeev.id } })) {
    const h = await bcrypt.hash("Welcome@123", 10);
    await db.user.create({ data: { email: "sanjeev.kumar@company.com", password: h, role: "MANAGER", employeeId: sanjeev.id } });
    results.push("Login created: sanjeev.kumar@company.com | MANAGER");
  } else {
    results.push("Login already exists for Sanjeev Kumar");
  }

  // 4. Interns
  const interns = [
    { firstName: "Damanpreet", lastName: "Kaur",  email: "damanpreet.kaur@company.com" },
    { firstName: "Manish",     lastName: "Kumar", email: "manish.kumar@company.com"    },
    { firstName: "Vishali",    lastName: "",       email: "vishali@company.com"          },
    { firstName: "Karan",      lastName: "Kaint", email: "karan.kaint@company.com"     },
    { firstName: "Emp",        lastName: "8901",  email: "emp8901@company.com"          },
  ];

  for (const i of interns) {
    let emp = await db.employee.findFirst({ where: { email: i.email } });
    if (!emp) {
      emp = await db.employee.create({
        data: {
          employeeCode: nextCode(),
          firstName: i.firstName, lastName: i.lastName,
          email: i.email,
          designation: "Marketing Intern",
          departmentId: dept.id,
          managerId: sanjeev.id,
          employmentType: "INTERN",
          joiningDate: new Date(),
          status: "ACTIVE",
        },
      });
      results.push(`Created ${i.firstName} ${i.lastName} (${emp.employeeCode})`);
    } else {
      results.push(`${i.firstName} ${i.lastName} already exists (${emp.employeeCode})`);
    }

    if (!await db.user.findFirst({ where: { employeeId: emp.id } })) {
      const h = await bcrypt.hash("Welcome@123", 10);
      await db.user.create({ data: { email: i.email, password: h, role: "EMPLOYEE", employeeId: emp.id } });
      results.push(`  Login: ${i.email} | EMPLOYEE`);
    } else {
      results.push(`  Login already exists for ${i.email}`);
    }
  }

  return NextResponse.json({ ok: true, results });
}

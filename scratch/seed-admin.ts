import { auth } from "../src/lib/auth"

async function seedAdmin() {
  console.log("--------------------------------------------------")
  console.log("Starting App Administrator Account Seeding...")
  console.log("--------------------------------------------------")

  const email = process.env.ADMIN_EMAIL || "salman9915189734@gmail.com"
  const password = process.env.ADMIN_PASSWORD || "SuperAdmin@123"
  const name = process.env.ADMIN_NAME || "System Admin"

  try {
    console.log(`Connecting to database and creating account for: ${email}...`)
    
    const user = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        // Custom field mapped in auth.ts
        accountType: "admin",
      },
    })

    console.log("--------------------------------------------------")
    console.log("SUCCESS: Admin account seeded successfully!")
    console.log("--------------------------------------------------")
    console.log("User details:")
    console.log(`- ID: ${user.user.id}`)
    console.log(`- Name: ${user.user.name}`)
    console.log(`- Email: ${user.user.email}`)
    console.log(`- Account Type: ${user.user.accountType}`)
    console.log("--------------------------------------------------")
    process.exit(0)
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    // If user already exists, it will throw an error
    if (err.message && err.message.includes("already exists")) {
      console.log("INFO: Admin account already exists in the database. Skipping creation.")
      process.exit(0)
    }
    console.error("ERROR: Seeding failed with error:", err)
    process.exit(1)
  }
}

seedAdmin()

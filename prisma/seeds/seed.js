const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

// Define all permissions for the NVOCC platform
const permissionsData = [
  // Dashboard permissions
  {
    name: "dashboard.view",
    displayName: "View Dashboard",
    module: "dashboard",
    category: "read",
  },

  // User management permissions
  {
    name: "users.view",
    displayName: "View Users",
    module: "users",
    category: "read",
  },
  {
    name: "users.create",
    displayName: "Create Users",
    module: "users",
    category: "write",
  },
  {
    name: "users.update",
    displayName: "Update Users",
    module: "users",
    category: "write",
  },
  {
    name: "users.delete",
    displayName: "Delete Users",
    module: "users",
    category: "admin",
  },

  // Role management permissions
  {
    name: "roles.view",
    displayName: "View Roles",
    module: "roles",
    category: "read",
  },
  {
    name: "roles.manage",
    displayName: "Manage Roles",
    module: "roles",
    category: "admin",
  },

  // Booking permissions
  {
    name: "bookings.view",
    displayName: "View Bookings",
    module: "bookings",
    category: "read",
  },
  {
    name: "bookings.create",
    displayName: "Create Bookings",
    module: "bookings",
    category: "write",
  },
  {
    name: "bookings.update",
    displayName: "Update Bookings",
    module: "bookings",
    category: "write",
  },
  {
    name: "bookings.cancel",
    displayName: "Cancel Bookings",
    module: "bookings",
    category: "write",
  },
  {
    name: "bookings.delete",
    displayName: "Delete Bookings",
    module: "bookings",
    category: "admin",
  },

  // Bill of Lading permissions
  {
    name: "bl.view",
    displayName: "View Bill of Lading",
    module: "bl",
    category: "read",
  },
  {
    name: "bl.create",
    displayName: "Create Bill of Lading",
    module: "bl",
    category: "write",
  },
  {
    name: "bl.update",
    displayName: "Update Bill of Lading",
    module: "bl",
    category: "write",
  },
  {
    name: "bl.release",
    displayName: "Release Bill of Lading",
    module: "bl",
    category: "admin",
  },

  // Vessel management permissions
  {
    name: "vessels.view",
    displayName: "View Vessels",
    module: "vessels",
    category: "read",
  },
  {
    name: "vessels.create",
    displayName: "Create Vessels",
    module: "vessels",
    category: "write",
  },
  {
    name: "vessels.update",
    displayName: "Update Vessels",
    module: "vessels",
    category: "write",
  },
  {
    name: "vessels.delete",
    displayName: "Delete Vessels",
    module: "vessels",
    category: "admin",
  },

  // Schedule permissions
  {
    name: "schedules.view",
    displayName: "View Schedules",
    module: "schedules",
    category: "read",
  },
  {
    name: "schedules.create",
    displayName: "Create Schedules",
    module: "schedules",
    category: "write",
  },
  {
    name: "schedules.update",
    displayName: "Update Schedules",
    module: "schedules",
    category: "write",
  },
  {
    name: "schedules.delete",
    displayName: "Delete Schedules",
    module: "schedules",
    category: "admin",
  },

  // Container management permissions
  {
    name: "containers.view",
    displayName: "View Containers",
    module: "containers",
    category: "read",
  },
  {
    name: "containers.create",
    displayName: "Create Containers",
    module: "containers",
    category: "write",
  },
  {
    name: "containers.update",
    displayName: "Update Containers",
    module: "containers",
    category: "write",
  },
  {
    name: "containers.track",
    displayName: "Track Containers",
    module: "containers",
    category: "read",
  },

  // Customer management permissions
  {
    name: "customers.view",
    displayName: "View Customers",
    module: "customers",
    category: "read",
  },
  {
    name: "customers.create",
    displayName: "Create Customers",
    module: "customers",
    category: "write",
  },
  {
    name: "customers.update",
    displayName: "Update Customers",
    module: "customers",
    category: "write",
  },
  {
    name: "customers.delete",
    displayName: "Delete Customers",
    module: "customers",
    category: "admin",
  },

  // Quote management permissions
  {
    name: "quotes.view",
    displayName: "View Quotes",
    module: "quotes",
    category: "read",
  },
  {
    name: "quotes.create",
    displayName: "Create Quotes",
    module: "quotes",
    category: "write",
  },
  {
    name: "quotes.update",
    displayName: "Update Quotes",
    module: "quotes",
    category: "write",
  },
  {
    name: "quotes.approve",
    displayName: "Approve Quotes",
    module: "quotes",
    category: "admin",
  },

  // Document management permissions
  {
    name: "documents.view",
    displayName: "View Documents",
    module: "documents",
    category: "read",
  },
  {
    name: "documents.upload",
    displayName: "Upload Documents",
    module: "documents",
    category: "write",
  },
  {
    name: "documents.download",
    displayName: "Download Documents",
    module: "documents",
    category: "read",
  },

  // Report permissions
  {
    name: "reports.view",
    displayName: "View Reports",
    module: "reports",
    category: "read",
  },
  {
    name: "reports.export",
    displayName: "Export Reports",
    module: "reports",
    category: "write",
  },
  {
    name: "reports.all",
    displayName: "Access All Reports",
    module: "reports",
    category: "admin",
  },

  // System administration permissions
  {
    name: "system.settings",
    displayName: "System Settings",
    module: "system",
    category: "admin",
  },
  {
    name: "system.logs",
    displayName: "View System Logs",
    module: "system",
    category: "admin",
  },
  {
    name: "system.backup",
    displayName: "System Backup",
    module: "system",
    category: "admin",
  },

  // Port operations permissions
  {
    name: "port.operations",
    displayName: "Port Operations",
    module: "port",
    category: "write",
  },
  {
    name: "port.management",
    displayName: "Port Management",
    module: "port",
    category: "admin",
  },

  // Depot operations permissions
  {
    name: "depot.operations",
    displayName: "Depot Operations",
    module: "depot",
    category: "write",
  },
  {
    name: "depot.inventory",
    displayName: "Depot Inventory",
    module: "depot",
    category: "read",
  },

  // HR permissions
  {
    name: "employees.view",
    displayName: "View Employees",
    module: "employees",
    category: "read",
  },
  {
    name: "employees.create",
    displayName: "Create Employees",
    module: "employees",
    category: "write",
  },
  {
    name: "employees.update",
    displayName: "Update Employees",
    module: "employees",
    category: "write",
  },
  {
    name: "employees.delete",
    displayName: "Delete Employees",
    module: "employees",
    category: "admin",
  },
  {
    name: "payroll.view",
    displayName: "View Payroll",
    module: "payroll",
    category: "read",
  },
];

// Define roles and their permission mappings
const rolesData = [
  {
    name: "ADMIN",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "dashboard.view",
      "users.view",
      "users.create",
      "users.update",
      "users.delete",
      "roles.view",
      "roles.manage",
      "bookings.view",
      "bookings.create",
      "bookings.update",
      "bookings.cancel",
      "bookings.delete",
      "bl.view",
      "bl.create",
      "bl.update",
      "bl.release",
      "vessels.view",
      "vessels.create",
      "vessels.update",
      "vessels.delete",
      "schedules.view",
      "schedules.create",
      "schedules.update",
      "schedules.delete",
      "containers.view",
      "containers.create",
      "containers.update",
      "containers.track",
      "customers.view",
      "customers.create",
      "customers.update",
      "customers.delete",
      "quotes.view",
      "quotes.create",
      "quotes.update",
      "quotes.approve",
      "documents.view",
      "documents.upload",
      "documents.download",
      "reports.view",
      "reports.export",
      "reports.all",
      "system.settings",
      "system.logs",
      "system.backup",
      "port.operations",
      "port.management",
      "depot.operations",
      "depot.inventory",
      "employees.view",
      "employees.create",
      "employees.update",
      "employees.delete",
      "payroll.view",
    ],
  },
  {
    name: "CUSTOMER",
    displayName: "Customer",
    description: "Customer portal access for booking and tracking",
    permissions: [
      "dashboard.view",
      "bookings.view",
      "bookings.create",
      "bookings.update",
      "bl.view",
      "containers.view",
      "containers.track",
      "quotes.view",
      "quotes.create",
      "documents.view",
      "documents.upload",
      "documents.download",
    ],
  },
  {
    name: "PORT",
    displayName: "Port User",
    description: "Port operations and vessel management",
    permissions: [
      "dashboard.view",
      "bookings.view",
      "vessels.view",
      "vessels.update",
      "schedules.view",
      "schedules.update",
      "containers.view",
      "containers.update",
      "containers.track",
      "port.operations",
      "documents.view",
      "documents.upload",
    ],
  },
  {
    name: "DEPOT",
    displayName: "Depot User",
    description: "Depot and container management",
    permissions: [
      "dashboard.view",
      "bookings.view",
      "containers.view",
      "containers.update",
      "containers.track",
      "depot.operations",
      "depot.inventory",
      "documents.view",
      "documents.upload",
    ],
  },
  {
    name: "SALES",
    displayName: "Sales Representative",
    description: "Sales activities and customer management",
    permissions: [
      "dashboard.view",
      "customers.view",
      "customers.create",
      "customers.update",
      "quotes.view",
      "quotes.create",
      "quotes.update",
      "bookings.view",
      "bookings.create",
      "reports.view",
      "reports.export",
      "documents.view",
      "documents.upload",
    ],
  },
  {
    name: "MASTER_PORT",
    displayName: "Master Port",
    description: "Master port operations with elevated permissions",
    permissions: [
      "dashboard.view",
      "bookings.view",
      "vessels.view",
      "vessels.create",
      "vessels.update",
      "vessels.delete",
      "schedules.view",
      "schedules.create",
      "schedules.update",
      "schedules.delete",
      "containers.view",
      "containers.update",
      "containers.track",
      "port.operations",
      "port.management",
      "documents.view",
      "documents.upload",
      "reports.view",
      "reports.export",
    ],
  },
  {
    name: "HR",
    displayName: "Human Resources",
    description: "Human resources and employee management",
    permissions: [
      "dashboard.view",
      "employees.view",
      "employees.create",
      "employees.update",
      "employees.delete",
      "payroll.view",
      "reports.view",
      "reports.export",
      "documents.view",
      "documents.upload",
    ],
  },
];

// Sample tenant data
const tenantsData = [
  {
    name: "First Tenant",
    app_abbr: "first_tenant",
    website_url: "https://demo.nvocc.com",
    email: "first@demo.com",
    prefix_booking: "DEMO",
    prefix_bl: "DM",
  },
  {
    name: "Second Tenant",
    app_abbr: "second_tenant",
    website_url: "https://demo.nvocc.com",
    email: "second@tenant.com",
    prefix_booking: "DEMO",
    prefix_bl: "DM",
  },
];

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === "development") {
      console.log("🧹 Clearing existing data...");
      await prisma.userSession.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.passwordReset.deleteMany();
      await prisma.activityLog.deleteMany();
      await prisma.user.deleteMany();
      await prisma.permission.deleteMany();
      await prisma.role.deleteMany();
      await prisma.tenant.deleteMany();
    }

    // Create tenants first
    console.log("🏢 Creating tenants...");
    const createdTenants = {};
    for (const tenantData of tenantsData) {
      const tenant = await prisma.tenant.create({
        data: tenantData,
      });
      createdTenants[tenant.app_abbr] = tenant;
      console.log(`✅ Created tenant: ${tenant.name}`);
    }

    // Create permissions
    console.log("� Creating permissions...");
    const createdPermissions = {};
    for (const permissionData of permissionsData) {
      const permission = await prisma.permission.create({
        data: permissionData,
      });
      createdPermissions[permission.name] = permission;
      console.log(`✅ Created permission: ${permission.displayName}`);
    }

    // Create roles with their permissions
    console.log("📋 Creating roles and assigning permissions...");
    const createdRoles = {};
    for (const roleData of rolesData) {
      const { permissions, ...roleDataWithoutPermissions } = roleData;

      // Get permission IDs for this role
      const rolePermissions = permissions
        .map((permName) => createdPermissions[permName])
        .filter((perm) => perm !== undefined);

      const role = await prisma.role.create({
        data: {
          ...roleDataWithoutPermissions,
          permissions: {
            connect: rolePermissions.map((perm) => ({ id: perm.id })),
          },
        },
      });

      createdRoles[role.name] = role;
      console.log(
        `✅ Created role: ${role.displayName} with ${rolePermissions.length} permissions`
      );
    }

    // Create default admin user
    console.log("👤 Creating default admin user...");
    const hashedPassword = await bcrypt.hash("Admin@123", 12);
    const firstTenant = createdTenants["first_tenant"];
    const secondTenant = createdTenants["second_tenant"];

    await prisma.user.create({
      data: {
        tenantId: firstTenant.id,
        email: "firsttenantadmin@nvocc.com",
        password: hashedPassword,
        firstName: "FirstTenant",
        lastName: "Administrator",
        status: "ACTIVE",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        roles: {
          connect: { id: createdRoles.ADMIN.id },
        },
      },
    });

    await prisma.user.create({
      data: {
        tenantId: secondTenant.id,
        email: "secondtenantadmin@nvocc.com",
        password: hashedPassword,
        firstName: "SecondTenant",
        lastName: "Administrator",
        status: "ACTIVE",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        roles: {
          connect: { id: createdRoles.ADMIN.id },
        },
      },
    });

    console.log("✅ Created default admin user with credentials:");
    console.log("   Email: admin@nvocc.com");
    console.log("   Password: Admin@123");

    // Create sample users for testing
    console.log("👥 Creating sample users...");

    const sampleUsers = [
      {
        email: "customer@test.com",
        password: "Customer@123",
        firstName: "John",
        lastName: "Customer",
        roles: ["CUSTOMER"],
      },
      {
        email: "sales@test.com",
        password: "Sales@123",
        firstName: "Jane",
        lastName: "Sales",
        roles: ["SALES"],
      },
      {
        email: "port@test.com",
        password: "Port@123",
        firstName: "Mike",
        lastName: "Port",
        roles: ["PORT"],
      },
      {
        email: "multiuser@test.com",
        password: "Multi@123",
        firstName: "Sarah",
        lastName: "MultiRole",
        roles: ["SALES", "CUSTOMER"],
      },
    ];

    for (const userData of sampleUsers) {
      const hashedUserPassword = await bcrypt.hash(userData.password, 12);

      const user = await prisma.user.create({
        data: {
          tenantId: firstTenant.id,
          email: userData.email,
          password: hashedUserPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          status: "ACTIVE",
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
          roles: {
            connect: userData.roles.map((roleName) => ({
              id: createdRoles[roleName].id,
            })),
          },
        },
      });

      console.log(
        `✅ Created user: ${userData.email} with roles: ${userData.roles.join(
          ", "
        )}`
      );
    }

    console.log("🎉 Database seeding completed successfully!");
    console.log("\nSample login credentials:");
    console.log("Admin: admin@nvocc.com / Admin@123");
    console.log("Customer: customer@test.com / Customer@123");
    console.log("Sales: sales@test.com / Sales@123");
    console.log("Port: port@test.com / Port@123");
    console.log("Multi-role: multiuser@test.com / Multi@123");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

const rolesData = [
  {
    name: "ADMIN",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "users.create",
      "users.read",
      "users.update",
      "users.delete",
      "roles.manage",
      "system.manage",
      "reports.all",
    ],
  },
  {
    name: "CUSTOMER",
    displayName: "Customer",
    description: "Customer portal access for booking and tracking",
    permissions: [
      "bookings.create",
      "bookings.read",
      "bookings.update",
      "tracking.read",
      "documents.read",
    ],
  },
  {
    name: "PORT",
    displayName: "Port User",
    description: "Port operations and vessel management",
    permissions: [
      "vessels.read",
      "vessels.update",
      "schedules.read",
      "schedules.update",
      "port.operations",
    ],
  },
  {
    name: "DEPOT",
    displayName: "Depot User",
    description: "Depot and container management",
    permissions: [
      "containers.read",
      "containers.update",
      "inventory.read",
      "inventory.update",
      "depot.operations",
    ],
  },
  {
    name: "SALES",
    displayName: "Sales Representative",
    description: "Sales activities and customer management",
    permissions: [
      "customers.create",
      "customers.read",
      "customers.update",
      "quotes.create",
      "quotes.read",
      "quotes.update",
      "sales.reports",
    ],
  },
  {
    name: "MASTER_PORT",
    displayName: "Master Port",
    description: "Master port operations with elevated permissions",
    permissions: [
      "vessels.create",
      "vessels.read",
      "vessels.update",
      "vessels.delete",
      "schedules.create",
      "schedules.read",
      "schedules.update",
      "schedules.delete",
      "port.operations",
      "port.management",
    ],
  },
  {
    name: "HR",
    displayName: "Human Resources",
    description: "Human resources and employee management",
    permissions: [
      "employees.create",
      "employees.read",
      "employees.update",
      "employees.delete",
      "payroll.read",
      "hr.reports",
    ],
  },
];

const menusData = [
  {
    name: "dashboard",
    displayName: "Dashboard",
    path: "/dashboard",
    icon: "dashboard",
    parentId: null,
    sortOrder: 1,
  },
  {
    name: "bookings",
    displayName: "Bookings",
    path: "/bookings",
    icon: "booking",
    parentId: null,
    sortOrder: 2,
  },
  {
    name: "bookings_list",
    displayName: "All Bookings",
    path: "/bookings/list",
    icon: "list",
    parentId: null, // Will be set after bookings is created
    sortOrder: 1,
  },
  {
    name: "bookings_create",
    displayName: "New Booking",
    path: "/bookings/create",
    icon: "add",
    parentId: null, // Will be set after bookings is created
    sortOrder: 2,
  },
  {
    name: "vessels",
    displayName: "Vessels",
    path: "/vessels",
    icon: "ship",
    parentId: null,
    sortOrder: 3,
  },
  {
    name: "vessels_list",
    displayName: "All Vessels",
    path: "/vessels/list",
    icon: "list",
    parentId: null, // Will be set after vessels is created
    sortOrder: 1,
  },
  {
    name: "vessels_schedules",
    displayName: "Schedules",
    path: "/vessels/schedules",
    icon: "schedule",
    parentId: null, // Will be set after vessels is created
    sortOrder: 2,
  },
  {
    name: "containers",
    displayName: "Containers",
    path: "/containers",
    icon: "container",
    parentId: null,
    sortOrder: 4,
  },
  {
    name: "containers_inventory",
    displayName: "Inventory",
    path: "/containers/inventory",
    icon: "inventory",
    parentId: null, // Will be set after containers is created
    sortOrder: 1,
  },
  {
    name: "customers",
    displayName: "Customers",
    path: "/customers",
    icon: "people",
    parentId: null,
    sortOrder: 5,
  },
  {
    name: "customers_list",
    displayName: "All Customers",
    path: "/customers/list",
    icon: "list",
    parentId: null, // Will be set after customers is created
    sortOrder: 1,
  },
  {
    name: "reports",
    displayName: "Reports",
    path: "/reports",
    icon: "report",
    parentId: null,
    sortOrder: 6,
  },
  {
    name: "administration",
    displayName: "Administration",
    path: "/admin",
    icon: "admin",
    parentId: null,
    sortOrder: 7,
  },
  {
    name: "admin_users",
    displayName: "User Management",
    path: "/admin/users",
    icon: "users",
    parentId: null, // Will be set after administration is created
    sortOrder: 1,
  },
  {
    name: "admin_roles",
    displayName: "Role Management",
    path: "/admin/roles",
    icon: "roles",
    parentId: null, // Will be set after administration is created
    sortOrder: 2,
  },
  {
    name: "hr",
    displayName: "Human Resources",
    path: "/hr",
    icon: "hr",
    parentId: null,
    sortOrder: 8,
  },
  {
    name: "hr_employees",
    displayName: "Employees",
    path: "/hr/employees",
    icon: "employee",
    parentId: null, // Will be set after hr is created
    sortOrder: 1,
  },
];

const roleMenuPermissions = {
  ADMIN: {
    // Admin has access to everything
    "*": { canView: true, canCreate: true, canEdit: true, canDelete: true },
  },
  CUSTOMER: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    bookings: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    bookings_list: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    bookings_create: {
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: false,
    },
  },
  PORT: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    vessels: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
    vessels_list: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    vessels_schedules: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
  },
  DEPOT: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    containers: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
    containers_inventory: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
  },
  SALES: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    bookings: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    bookings_list: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    bookings_create: {
      canView: true,
      canCreate: true,
      canEdit: false,
      canDelete: false,
    },
    customers: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    customers_list: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    reports: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
  MASTER_PORT: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    vessels: { canView: true, canCreate: true, canEdit: true, canDelete: true },
    vessels_list: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    vessels_schedules: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
  },
  HR: {
    dashboard: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
    hr: { canView: true, canCreate: false, canEdit: false, canDelete: false },
    hr_employees: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    reports: {
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  },
};

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data (in development only)
    if (process.env.NODE_ENV === "development") {
      console.log("🧹 Clearing existing data...");
      await prisma.roleMenu.deleteMany();
      await prisma.userRole.deleteMany();
      await prisma.userSession.deleteMany();
      await prisma.refreshToken.deleteMany();
      await prisma.passwordReset.deleteMany();
      await prisma.activityLog.deleteMany();
      await prisma.menu.deleteMany();
      await prisma.role.deleteMany();
      await prisma.user.deleteMany();
    }

    // Create roles
    console.log("📋 Creating roles...");
    const createdRoles = {};
    for (const roleData of rolesData) {
      const role = await prisma.role.create({
        data: roleData,
      });
      createdRoles[role.name] = role;
      console.log(`✅ Created role: ${role.displayName}`);
    }

    // Create menus (first create parent menus)
    console.log("🗂️ Creating menus...");
    const createdMenus = {};

    // Create parent menus first
    const parentMenus = menusData.filter(
      (menu) =>
        menu.parentId === null &&
        ![
          "bookings_list",
          "bookings_create",
          "vessels_list",
          "vessels_schedules",
          "containers_inventory",
          "customers_list",
          "admin_users",
          "admin_roles",
          "hr_employees",
        ].includes(menu.name)
    );

    for (const menuData of parentMenus) {
      const menu = await prisma.menu.create({
        data: menuData,
      });
      createdMenus[menu.name] = menu;
      console.log(`✅ Created parent menu: ${menu.displayName}`);
    }

    // Create child menus
    const childMenuMappings = {
      bookings_list: "bookings",
      bookings_create: "bookings",
      vessels_list: "vessels",
      vessels_schedules: "vessels",
      containers_inventory: "containers",
      customers_list: "customers",
      admin_users: "administration",
      admin_roles: "administration",
      hr_employees: "hr",
    };

    const childMenus = menusData.filter((menu) =>
      Object.keys(childMenuMappings).includes(menu.name)
    );

    for (const menuData of childMenus) {
      const parentMenuName = childMenuMappings[menuData.name];
      const parentMenu = createdMenus[parentMenuName];

      if (parentMenu) {
        const menu = await prisma.menu.create({
          data: {
            ...menuData,
            parentId: parentMenu.id,
          },
        });
        createdMenus[menu.name] = menu;
        console.log(
          `✅ Created child menu: ${menu.displayName} under ${parentMenu.displayName}`
        );
      }
    }

    // Create role-menu relationships
    console.log("🔗 Creating role-menu relationships...");
    for (const [roleName, menuPermissions] of Object.entries(
      roleMenuPermissions
    )) {
      const role = createdRoles[roleName];

      if (menuPermissions["*"]) {
        // Admin gets access to all menus
        for (const menu of Object.values(createdMenus)) {
          await prisma.roleMenu.create({
            data: {
              roleId: role.id,
              menuId: menu.id,
              ...menuPermissions["*"],
            },
          });
        }
        console.log(`✅ Granted ${roleName} access to all menus`);
      } else {
        // Other roles get specific menu access
        for (const [menuName, permissions] of Object.entries(menuPermissions)) {
          const menu = createdMenus[menuName];
          if (menu) {
            await prisma.roleMenu.create({
              data: {
                roleId: role.id,
                menuId: menu.id,
                ...permissions,
              },
            });
          }
        }
        console.log(`✅ Granted ${roleName} access to specific menus`);
      }
    }

    // Create default admin user
    console.log("👤 Creating default admin user...");
    const hashedPassword = await bcrypt.hash("Admin@123", 12);

    const adminUser = await prisma.user.create({
      data: {
        email: "admin@nvocc.com",
        password: hashedPassword,
        firstName: "System",
        lastName: "Administrator",
        status: "ACTIVE",
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      },
    });

    // Assign admin role to admin user
    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: createdRoles.ADMIN.id,
        assignedBy: adminUser.id, // Self-assigned
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
          email: userData.email,
          password: hashedUserPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          status: "ACTIVE",
          isEmailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });

      // Assign roles
      for (const roleName of userData.roles) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: createdRoles[roleName].id,
            assignedBy: adminUser.id,
          },
        });
      }

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

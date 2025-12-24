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

    const adminUser = await prisma.user.create({
      data: {
        tenantId: firstTenant.id,
        email: "admin@nvocc.com",
        password: hashedPassword,
        firstName: "System",
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

    // 💰 Creating currencies
    console.log("💰 Creating currencies...");
    const currenciesData = [
      { name: "US Dollar", code: "USD", symbol: "$", status: "ACTIVE" },
      { name: "Euro", code: "EUR", symbol: "€", status: "ACTIVE" },
      { name: "Indian Rupee", code: "INR", symbol: "₹", status: "ACTIVE" },
      { name: "British Pound", code: "GBP", symbol: "£", status: "ACTIVE" },
      { name: "Singapore Dollar", code: "SGD", symbol: "S$", status: "ACTIVE" },
      { name: "Chinese Yuan", code: "CNY", symbol: "¥", status: "ACTIVE" },
      { name: "UAE Dirham", code: "AED", symbol: "د.إ", status: "ACTIVE" },
      { name: "Japanese Yen", code: "JPY", symbol: "¥", status: "ACTIVE" },
      { name: "South Korean Won", code: "KRW", symbol: "₩", status: "ACTIVE" },
      {
        name: "Australian Dollar",
        code: "AUD",
        symbol: "A$",
        status: "ACTIVE",
      },
      { name: "Canadian Dollar", code: "CAD", symbol: "C$", status: "ACTIVE" },
      { name: "Brazilian Real", code: "BRL", symbol: "R$", status: "ACTIVE" },
    ];

    const createdCurrencies = {};
    for (const currencyData of currenciesData) {
      const currency = await prisma.currency.create({
        data: currencyData,
      });
      createdCurrencies[currencyData.code] = currency;
      console.log(`✅ Created currency: ${currency.name} (${currency.code})`);
    }

    // 🌍 Creating countries
    console.log("🌍 Creating countries...");
    const countriesData = [
      {
        name: "United States",
        codeChar2: "US",
        codeChar3: "USA",
        unRegion: "Americas",
        unSubregion: "Northern America",
        currencyId: createdCurrencies["USD"].id,
        status: "ACTIVE",
      },
      {
        name: "India",
        codeChar2: "IN",
        codeChar3: "IND",
        unRegion: "Asia",
        unSubregion: "Southern Asia",
        currencyId: createdCurrencies["INR"].id,
        status: "ACTIVE",
      },
      {
        name: "United Kingdom",
        codeChar2: "GB",
        codeChar3: "GBR",
        unRegion: "Europe",
        unSubregion: "Northern Europe",
        currencyId: createdCurrencies["GBP"].id,
        status: "ACTIVE",
      },
      {
        name: "Singapore",
        codeChar2: "SG",
        codeChar3: "SGP",
        unRegion: "Asia",
        unSubregion: "South-eastern Asia",
        currencyId: createdCurrencies["SGD"].id,
        status: "ACTIVE",
      },
      {
        name: "China",
        codeChar2: "CN",
        codeChar3: "CHN",
        unRegion: "Asia",
        unSubregion: "Eastern Asia",
        currencyId: createdCurrencies["CNY"].id,
        status: "ACTIVE",
      },
      {
        name: "United Arab Emirates",
        codeChar2: "AE",
        codeChar3: "ARE",
        unRegion: "Asia",
        unSubregion: "Western Asia",
        currencyId: createdCurrencies["AED"].id,
        status: "ACTIVE",
      },
      {
        name: "Germany",
        codeChar2: "DE",
        codeChar3: "DEU",
        unRegion: "Europe",
        unSubregion: "Western Europe",
        currencyId: createdCurrencies["EUR"].id,
        status: "ACTIVE",
      },
      {
        name: "Netherlands",
        codeChar2: "NL",
        codeChar3: "NLD",
        unRegion: "Europe",
        unSubregion: "Western Europe",
        currencyId: createdCurrencies["EUR"].id,
        status: "ACTIVE",
      },
      {
        name: "Japan",
        codeChar2: "JP",
        codeChar3: "JPN",
        unRegion: "Asia",
        unSubregion: "Eastern Asia",
        currencyId: createdCurrencies["JPY"].id,
        status: "ACTIVE",
      },
      {
        name: "South Korea",
        codeChar2: "KR",
        codeChar3: "KOR",
        unRegion: "Asia",
        unSubregion: "Eastern Asia",
        currencyId: createdCurrencies["KRW"].id,
        status: "ACTIVE",
      },
      {
        name: "Australia",
        codeChar2: "AU",
        codeChar3: "AUS",
        unRegion: "Oceania",
        unSubregion: "Australia and New Zealand",
        currencyId: createdCurrencies["AUD"].id,
        status: "ACTIVE",
      },
      {
        name: "Canada",
        codeChar2: "CA",
        codeChar3: "CAN",
        unRegion: "Americas",
        unSubregion: "Northern America",
        currencyId: createdCurrencies["CAD"].id,
        status: "ACTIVE",
      },
      {
        name: "Brazil",
        codeChar2: "BR",
        codeChar3: "BRA",
        unRegion: "Americas",
        unSubregion: "South America",
        currencyId: createdCurrencies["BRL"].id,
        status: "ACTIVE",
      },
    ];

    const createdCountries = {};
    for (const countryData of countriesData) {
      const country = await prisma.country.create({
        data: countryData,
      });
      createdCountries[countryData.codeChar2] = country;
      console.log(`✅ Created country: ${country.name}`);
    }

    // 🏛️ Creating states
    console.log("�️ Creating states...");
    const statesData = [
      // United States
      {
        name: "California",
        code: "CA",
        countryId: createdCountries["US"].id,
        status: "ACTIVE",
      },
      {
        name: "New York",
        code: "NY",
        countryId: createdCountries["US"].id,
        status: "ACTIVE",
      },
      // India
      {
        name: "Maharashtra",
        code: "MH",
        countryId: createdCountries["IN"].id,
        status: "ACTIVE",
      },
      {
        name: "Tamil Nadu",
        code: "TN",
        countryId: createdCountries["IN"].id,
        status: "ACTIVE",
      },
      {
        name: "West Bengal",
        code: "WB",
        countryId: createdCountries["IN"].id,
        status: "ACTIVE",
      },
      // United Kingdom
      {
        name: "England",
        code: "ENG",
        countryId: createdCountries["GB"].id,
        status: "ACTIVE",
      },
      {
        name: "Hampshire",
        code: "HAM",
        countryId: createdCountries["GB"].id,
        status: "ACTIVE",
      },
      // Singapore
      {
        name: "Central",
        code: "CENTRAL",
        countryId: createdCountries["SG"].id,
        status: "ACTIVE",
      },
      // China
      {
        name: "Shanghai",
        code: "SH",
        countryId: createdCountries["CN"].id,
        status: "ACTIVE",
      },
      {
        name: "Zhejiang",
        code: "ZJ",
        countryId: createdCountries["CN"].id,
        status: "ACTIVE",
      },
      {
        name: "Guangdong",
        code: "GD",
        countryId: createdCountries["CN"].id,
        status: "ACTIVE",
      },
      // UAE
      {
        name: "Dubai",
        code: "DU",
        countryId: createdCountries["AE"].id,
        status: "ACTIVE",
      },
      {
        name: "Abu Dhabi",
        code: "AD",
        countryId: createdCountries["AE"].id,
        status: "ACTIVE",
      },
      // Germany
      {
        name: "Hamburg",
        code: "HH",
        countryId: createdCountries["DE"].id,
        status: "ACTIVE",
      },
      // Netherlands
      {
        name: "South Holland",
        code: "ZH",
        countryId: createdCountries["NL"].id,
        status: "ACTIVE",
      },
      // Japan
      {
        name: "Tokyo",
        code: "13",
        countryId: createdCountries["JP"].id,
        status: "ACTIVE",
      },
      // South Korea
      {
        name: "Busan",
        code: "26",
        countryId: createdCountries["KR"].id,
        status: "ACTIVE",
      },
      // Australia
      {
        name: "New South Wales",
        code: "NSW",
        countryId: createdCountries["AU"].id,
        status: "ACTIVE",
      },
      // Canada
      {
        name: "British Columbia",
        code: "BC",
        countryId: createdCountries["CA"].id,
        status: "ACTIVE",
      },
    ];

    const createdStates = {};
    for (const stateData of statesData) {
      const state = await prisma.state.create({
        data: stateData,
      });
      createdStates[`${stateData.code}_${stateData.countryId}`] = state;
      console.log(`✅ Created state: ${state.name}`);
    }

    // �🏢 Creating ports
    console.log("🏢 Creating ports...");
    const portsData = [
      // United States Ports
      {
        name: "Los Angeles Port",
        portType: "SEA_PORT",
        countryId: createdCountries["US"].id,
        itaCode: "LAX",
        portCode: "USLAX",
        status: "ACTIVE",
        customsDetails: "US Customs - LA",
      },
      {
        name: "Long Beach Port",
        portType: "SEA_PORT",
        countryId: createdCountries["US"].id,
        itaCode: "LGB",
        portCode: "USLGB",
        status: "ACTIVE",
        customsDetails: "US Customs - LB",
      },
      {
        name: "New York Port",
        portType: "SEA_PORT",
        countryId: createdCountries["US"].id,
        itaCode: "NYC",
        portCode: "USNYC",
        status: "ACTIVE",
        customsDetails: "US Customs - NY",
      },
      // Indian Ports
      {
        name: "Mumbai Port",
        portType: "SEA_PORT",
        countryId: createdCountries["IN"].id,
        itaCode: "BOM",
        portCode: "INBOM",
        status: "ACTIVE",
        customsDetails: "Indian Customs - Mumbai",
      },
      {
        name: "Chennai Port",
        portType: "SEA_PORT",
        countryId: createdCountries["IN"].id,
        itaCode: "MAA",
        portCode: "INMAA",
        status: "ACTIVE",
        customsDetails: "Indian Customs - Chennai",
      },
      {
        name: "Kolkata Port",
        portType: "SEA_PORT",
        countryId: createdCountries["IN"].id,
        itaCode: "CCU",
        portCode: "INCCU",
        status: "ACTIVE",
        customsDetails: "Indian Customs - Kolkata",
      },
      // Singapore
      {
        name: "Singapore Port",
        portType: "SEA_PORT",
        countryId: createdCountries["SG"].id,
        itaCode: "SIN",
        portCode: "SGSIN",
        status: "ACTIVE",
        customsDetails: "Singapore Customs",
      },
      // Chinese Ports
      {
        name: "Shanghai Port",
        portType: "SEA_PORT",
        countryId: createdCountries["CN"].id,
        itaCode: "SHA",
        portCode: "CNSHA",
        status: "ACTIVE",
        customsDetails: "China Customs - Shanghai",
      },
      {
        name: "Ningbo Port",
        portType: "SEA_PORT",
        countryId: createdCountries["CN"].id,
        itaCode: "NGB",
        portCode: "CNNGB",
        status: "ACTIVE",
        customsDetails: "China Customs - Ningbo",
      },
      {
        name: "Shenzhen Port",
        portType: "SEA_PORT",
        countryId: createdCountries["CN"].id,
        itaCode: "SZX",
        portCode: "CNSZX",
        status: "ACTIVE",
        customsDetails: "China Customs - Shenzhen",
      },
      // UK Ports
      {
        name: "London Gateway",
        portType: "SEA_PORT",
        countryId: createdCountries["GB"].id,
        itaCode: "LGW",
        portCode: "GBLGW",
        status: "ACTIVE",
        customsDetails: "UK Customs - London",
      },
      {
        name: "Southampton Port",
        portType: "SEA_PORT",
        countryId: createdCountries["GB"].id,
        itaCode: "SOU",
        portCode: "GBSOU",
        status: "ACTIVE",
        customsDetails: "UK Customs - Southampton",
      },
      // UAE Ports
      {
        name: "Jebel Ali Port",
        portType: "SEA_PORT",
        countryId: createdCountries["AE"].id,
        itaCode: "JEA",
        portCode: "AEJEA",
        status: "ACTIVE",
        customsDetails: "UAE Customs - Dubai",
      },
      {
        name: "Abu Dhabi Port",
        portType: "SEA_PORT",
        countryId: createdCountries["AE"].id,
        itaCode: "AUH",
        portCode: "AEAUH",
        status: "ACTIVE",
        customsDetails: "UAE Customs - Abu Dhabi",
      },
      // European Ports
      {
        name: "Hamburg Port",
        portType: "SEA_PORT",
        countryId: createdCountries["DE"].id,
        itaCode: "HAM",
        portCode: "DEHAM",
        status: "ACTIVE",
        customsDetails: "German Customs - Hamburg",
      },
      {
        name: "Rotterdam Port",
        portType: "SEA_PORT",
        countryId: createdCountries["NL"].id,
        itaCode: "RTM",
        portCode: "NLRTM",
        status: "ACTIVE",
        customsDetails: "Dutch Customs - Rotterdam",
      },
      // Asian Ports
      {
        name: "Tokyo Port",
        portType: "SEA_PORT",
        countryId: createdCountries["JP"].id,
        itaCode: "TYO",
        portCode: "JPTYO",
        status: "ACTIVE",
        customsDetails: "Japan Customs - Tokyo",
      },
      {
        name: "Busan Port",
        portType: "SEA_PORT",
        countryId: createdCountries["KR"].id,
        itaCode: "PUS",
        portCode: "KRPUS",
        status: "ACTIVE",
        customsDetails: "Korean Customs - Busan",
      },
      // Australian Port
      {
        name: "Sydney Port",
        portType: "SEA_PORT",
        countryId: createdCountries["AU"].id,
        itaCode: "SYD",
        portCode: "AUSYD",
        status: "ACTIVE",
        customsDetails: "Australian Customs - Sydney",
      },
      // Canadian Port
      {
        name: "Vancouver Port",
        portType: "SEA_PORT",
        countryId: createdCountries["CA"].id,
        itaCode: "YVR",
        portCode: "CAYVR",
        status: "ACTIVE",
        customsDetails: "Canadian Customs - Vancouver",
      },
    ];

    const createdPorts = {};
    for (const portData of portsData) {
      const port = await prisma.port.create({
        data: {
          ...portData,
          createdById: adminUser.id,
        },
      });
      createdPorts[portData.portCode] = port;
      console.log(`✅ Created port: ${port.name}`);
    }

    // 🏭 Creating terminals
    console.log("🏭 Creating terminals...");
    const terminalsData = [
      // US Port Terminals
      {
        name: "LAX Terminal 1",
        portId: createdPorts["USLAX"].id,
        description: "Main container terminal at Los Angeles Port",
        status: "ACTIVE",
      },
      {
        name: "LAX Terminal 2",
        portId: createdPorts["USLAX"].id,
        description: "Secondary container terminal at Los Angeles Port",
        status: "ACTIVE",
      },
      {
        name: "Long Beach Terminal 1",
        portId: createdPorts["USLGB"].id,
        description: "Container terminal at Long Beach Port",
        status: "ACTIVE",
      },
      {
        name: "NYC Brooklyn Terminal",
        portId: createdPorts["USNYC"].id,
        description: "Brooklyn container terminal at New York Port",
        status: "ACTIVE",
      },
      {
        name: "NYC Staten Island Terminal",
        portId: createdPorts["USNYC"].id,
        description: "Staten Island container terminal",
        status: "ACTIVE",
      },
      // Indian Port Terminals
      {
        name: "Mumbai JNPT Terminal",
        portId: createdPorts["INBOM"].id,
        description: "Jawaharlal Nehru Port Terminal",
        status: "ACTIVE",
      },
      {
        name: "Mumbai Port Trust Terminal",
        portId: createdPorts["INBOM"].id,
        description: "Mumbai Port Trust container terminal",
        status: "ACTIVE",
      },
      {
        name: "Chennai Container Terminal",
        portId: createdPorts["INMAA"].id,
        description: "Main container terminal at Chennai Port",
        status: "ACTIVE",
      },
      {
        name: "Chennai International Terminal",
        portId: createdPorts["INMAA"].id,
        description: "International container terminal at Chennai",
        status: "ACTIVE",
      },
      {
        name: "Kolkata Netaji Subhas Terminal",
        portId: createdPorts["INCCU"].id,
        description: "Main container terminal at Kolkata Port",
        status: "ACTIVE",
      },
      // Singapore Terminal
      {
        name: "Singapore PSA Terminal",
        portId: createdPorts["SGSIN"].id,
        description: "PSA International Terminal",
        status: "ACTIVE",
      },
      {
        name: "Singapore Pasir Panjang Terminal",
        portId: createdPorts["SGSIN"].id,
        description: "Pasir Panjang container terminal",
        status: "ACTIVE",
      },
      // Chinese Port Terminals
      {
        name: "Shanghai Yangshan Terminal",
        portId: createdPorts["CNSHA"].id,
        description: "Yangshan Deep Water Port Terminal",
        status: "ACTIVE",
      },
      {
        name: "Shanghai Waigaoqiao Terminal",
        portId: createdPorts["CNSHA"].id,
        description: "Waigaoqiao container terminal",
        status: "ACTIVE",
      },
      {
        name: "Ningbo Meishan Terminal",
        portId: createdPorts["CNNGB"].id,
        description: "Meishan container terminal at Ningbo",
        status: "ACTIVE",
      },
      {
        name: "Shenzhen Yantian Terminal",
        portId: createdPorts["CNSZX"].id,
        description: "Yantian International Container Terminal",
        status: "ACTIVE",
      },
      {
        name: "Shenzhen Shekou Terminal",
        portId: createdPorts["CNSZX"].id,
        description: "Shekou container terminal",
        status: "ACTIVE",
      },
      // UK Port Terminals
      {
        name: "London Gateway Terminal 1",
        portId: createdPorts["GBLGW"].id,
        description: "Main terminal at London Gateway",
        status: "ACTIVE",
      },
      {
        name: "Southampton Container Terminal",
        portId: createdPorts["GBSOU"].id,
        description: "Main container terminal at Southampton",
        status: "ACTIVE",
      },
      // UAE Port Terminals
      {
        name: "Jebel Ali Terminal 1",
        portId: createdPorts["AEJEA"].id,
        description: "Terminal 1 at Jebel Ali Port",
        status: "ACTIVE",
      },
      {
        name: "Jebel Ali Terminal 2",
        portId: createdPorts["AEJEA"].id,
        description: "Terminal 2 at Jebel Ali Port",
        status: "ACTIVE",
      },
      {
        name: "Abu Dhabi Container Terminal",
        portId: createdPorts["AEAUH"].id,
        description: "Main container terminal at Abu Dhabi Port",
        status: "ACTIVE",
      },
      // European Port Terminals
      {
        name: "Hamburg Container Terminal",
        portId: createdPorts["DEHAM"].id,
        description: "Main container terminal at Hamburg Port",
        status: "ACTIVE",
      },
      {
        name: "Rotterdam ECT Terminal",
        portId: createdPorts["NLRTM"].id,
        description: "Europe Container Terminals at Rotterdam",
        status: "ACTIVE",
      },
      {
        name: "Rotterdam APM Terminal",
        portId: createdPorts["NLRTM"].id,
        description: "APM Terminals at Rotterdam",
        status: "ACTIVE",
      },
      // Asian Port Terminals
      {
        name: "Tokyo Container Terminal",
        portId: createdPorts["JPTYO"].id,
        description: "Main container terminal at Tokyo Port",
        status: "ACTIVE",
      },
      {
        name: "Busan New Port Terminal",
        portId: createdPorts["KRPUS"].id,
        description: "New Port container terminal at Busan",
        status: "ACTIVE",
      },
      {
        name: "Busan North Port Terminal",
        portId: createdPorts["KRPUS"].id,
        description: "North Port container terminal at Busan",
        status: "ACTIVE",
      },
      // Australian Port Terminal
      {
        name: "Sydney Container Terminal",
        portId: createdPorts["AUSYD"].id,
        description: "Main container terminal at Sydney Port",
        status: "ACTIVE",
      },
      // Canadian Port Terminal
      {
        name: "Vancouver Fraser Surrey Terminal",
        portId: createdPorts["CAYVR"].id,
        description: "Fraser Surrey container terminal",
        status: "ACTIVE",
      },
      {
        name: "Vancouver Centerm Terminal",
        portId: createdPorts["CAYVR"].id,
        description: "Centerm container terminal at Vancouver",
        status: "ACTIVE",
      },
    ];

    const createdTerminals = {};
    for (const terminalData of terminalsData) {
      const terminal = await prisma.terminal.create({
        data: {
          ...terminalData,
          createdById: adminUser.id,
        },
      });
      createdTerminals[terminal.name] = terminal;
      console.log(`✅ Created terminal: ${terminal.name}`);
    }

    // 🚢 Creating vessels
    console.log("🚢 Creating vessels...");
    const vesselsData = [
      { name: "MSC Oscar", type: "CONTAINER_SHIP", status: "ACTIVE" },
      { name: "OOCL Hong Kong", type: "CONTAINER_SHIP", status: "ACTIVE" },
      { name: "CMA CGM Marco Polo", type: "CONTAINER_SHIP", status: "ACTIVE" },
      { name: "Maersk Triple E", type: "CONTAINER_SHIP", status: "ACTIVE" },
      {
        name: "COSCO Shipping Universe",
        type: "CONTAINER_SHIP",
        status: "ACTIVE",
      },
    ];

    const createdVessels = {};
    for (const vesselData of vesselsData) {
      const vessel = await prisma.vessel.create({
        data: vesselData,
      });
      createdVessels[vessel.name] = vessel;
      console.log(`✅ Created vessel: ${vessel.name}`);
    }

    // 📦 Creating cargo types
    console.log("📦 Creating cargo types...");
    const cargoData = [
      { name: "General Cargo", cargoType: "GENERAL", status: "ACTIVE" },
      { name: "Hazardous Materials", cargoType: "HAZARDOUS", status: "ACTIVE" },
      {
        name: "Refrigerated Goods",
        cargoType: "REFRIGERATED",
        status: "ACTIVE",
      },
      { name: "Bulk Cargo", cargoType: "BULK", status: "ACTIVE" },
      { name: "Liquid Cargo", cargoType: "LIQUID", status: "ACTIVE" },
    ];

    const createdCargo = {};
    for (const cargoItem of cargoData) {
      const cargo = await prisma.cargo.create({
        data: cargoItem,
      });
      createdCargo[cargo.name] = cargo;
      console.log(`✅ Created cargo type: ${cargo.name}`);
    }

    // 🏷️ Creating commodities
    console.log("🏷️ Creating commodities...");
    const commoditiesData = [
      {
        name: "Electronics",
        cargoId: createdCargo["General Cargo"].id,
        description: "Electronic goods and components",
        code: "ELEC",
        status: "ACTIVE",
      },
      {
        name: "Textiles",
        cargoId: createdCargo["General Cargo"].id,
        description: "Clothing and fabric materials",
        code: "TEXT",
        status: "ACTIVE",
      },
      {
        name: "Chemicals",
        cargoId: createdCargo["Hazardous Materials"].id,
        description: "Chemical substances",
        code: "CHEM",
        status: "ACTIVE",
      },
      {
        name: "Frozen Foods",
        cargoId: createdCargo["Refrigerated Goods"].id,
        description: "Frozen food products",
        code: "FROZ",
        status: "ACTIVE",
      },
      {
        name: "Grain",
        cargoId: createdCargo["Bulk Cargo"].id,
        description: "Agricultural grain products",
        code: "GRNI",
        status: "ACTIVE",
      },
    ];

    for (const commodityData of commoditiesData) {
      const commodity = await prisma.commodity.create({
        data: commodityData,
      });
      console.log(`✅ Created commodity: ${commodity.name}`);
    }

    // 📦 Creating container types
    console.log("📦 Creating container types...");
    const containerTypesData = [
      {
        name: "20ft Dry Container",
        isoCode: "20DC",
        type: "DRY",
        status: "ACTIVE",
        notes: "Standard 20ft dry container",
      },
      {
        name: "40ft Dry Container",
        isoCode: "40DC",
        type: "DRY",
        status: "ACTIVE",
        notes: "Standard 40ft dry container",
      },
      {
        name: "40ft High Cube",
        isoCode: "40HC",
        type: "DRY",
        status: "ACTIVE",
        notes: "40ft high cube container",
      },
      {
        name: "20ft Reefer",
        isoCode: "20RF",
        type: "REEFER",
        status: "ACTIVE",
        notes: "20ft refrigerated container",
      },
      {
        name: "40ft Reefer",
        isoCode: "40RF",
        type: "REEFER",
        status: "ACTIVE",
        notes: "40ft refrigerated container",
      },
      {
        name: "20ft Tank",
        isoCode: "20TK",
        type: "TANK",
        status: "ACTIVE",
        notes: "20ft tank container",
      },
    ];

    const createdContainerTypes = {};
    for (const containerTypeData of containerTypesData) {
      const containerType = await prisma.containerType.create({
        data: containerTypeData,
      });
      createdContainerTypes[containerType.isoCode] = containerType;
      console.log(`✅ Created container type: ${containerType.name}`);
    }

    // � Creating agents
    console.log("🏢 Creating agents...");
    const agentsData = [
      {
        name: "Pacific Logistics",
        companyName: "Pacific Logistics LLC",
        ownOffice: true,
        email: "contact@pacificlogistics.com",
        portId: createdPorts["USLAX"].id,
        stateId: createdStates[`CA_${createdCountries["US"].id}`].id,
        countryId: createdCountries["US"].id,
        city: "Los Angeles",
        addressLine1: "123 Harbor Blvd",
        zipCode: "90731",
        mobNum: "+1-555-0123",
        telNum: "+1-555-0124",
        licenceNum: "US-LA-001",
        status: "ACTIVE",
      },
      {
        name: "Mumbai Freight Services",
        companyName: "Mumbai Freight Services Pvt Ltd",
        ownOffice: true,
        email: "info@mumbaifreight.com",
        portId: createdPorts["INBOM"].id,
        stateId: createdStates[`MH_${createdCountries["IN"].id}`].id,
        countryId: createdCountries["IN"].id,
        city: "Mumbai",
        addressLine1: "456 Port Road",
        zipCode: "400001",
        mobNum: "+91-98765-43210",
        telNum: "+91-22-12345678",
        licenceNum: "IN-MH-001",
        gstNum: "27ABCDE1234F1Z5",
        panNum: "ABCDE1234F",
        status: "ACTIVE",
      },
    ];

    const createdAgents = {};
    for (const agentData of agentsData) {
      const agent = await prisma.agent.create({
        data: agentData,
      });
      createdAgents[agent.name] = agent;
      console.log(`✅ Created agent: ${agent.name}`);
    }

    // 🏦 Creating bank accounts
    console.log("🏦 Creating bank accounts...");
    const bankAccountsData = [
      {
        agentId: createdAgents["Pacific Logistics"].id,
        accountName: "Pacific Logistics Operating Account",
        bankName: "Wells Fargo Bank",
        bankBranch: "Los Angeles Harbor Branch",
        currencyId: createdCurrencies["USD"].id,
        city: "Los Angeles",
        stateId: createdStates[`CA_${createdCountries["US"].id}`].id,
        countryId: createdCountries["US"].id,
        accountNum: "1234567890",
        swiftCode: "WFBIUS6S",
        status: "ACTIVE",
      },
      {
        agentId: createdAgents["Mumbai Freight Services"].id,
        accountName: "Mumbai Freight Services Current Account",
        bankName: "State Bank of India",
        bankBranch: "Fort Branch",
        currencyId: createdCurrencies["INR"].id,
        city: "Mumbai",
        stateId: createdStates[`MH_${createdCountries["IN"].id}`].id,
        countryId: createdCountries["IN"].id,
        accountNum: "9876543210",
        ifscCode: "SBIN0000001",
        status: "ACTIVE",
      },
    ];

    for (const bankAccountData of bankAccountsData) {
      const bankAccount = await prisma.bankAccount.create({
        data: bankAccountData,
      });
      console.log(`✅ Created bank account: ${bankAccount.accountName}`);
    }

    // ⚡ Creating charges
    console.log("⚡ Creating charges...");
    const chargesData = [
      {
        name: "ocean_freight",
        displayName: "Ocean Freight",
        sacHsnCode: "996511",
        flag: "mandatory",
        status: "ACTIVE",
      },
      {
        name: "documentation_fee",
        displayName: "Documentation Fee",
        sacHsnCode: "996519",
        flag: "optional",
        status: "ACTIVE",
      },
      {
        name: "container_seal",
        displayName: "Container Seal",
        sacHsnCode: "996519",
        flag: "mandatory",
        status: "ACTIVE",
      },
      {
        name: "terminal_handling",
        displayName: "Terminal Handling Charges",
        sacHsnCode: "996511",
        flag: "mandatory",
        status: "ACTIVE",
      },
      {
        name: "customs_clearance",
        displayName: "Customs Clearance",
        sacHsnCode: "996519",
        flag: "optional",
        status: "ACTIVE",
      },
    ];

    const createdCharges = {};
    for (const chargeData of chargesData) {
      const charge = await prisma.charge.create({
        data: chargeData,
      });
      createdCharges[charge.name] = charge;
      console.log(`✅ Created charge: ${charge.displayName}`);
    }

    // 💱 Creating currency exchange rates
    console.log("💱 Creating currency exchange rates...");
    const exchangeRatesData = [
      {
        fromCurrencyId: createdCurrencies["USD"].id,
        toCurrencyId: createdCurrencies["INR"].id,
        exchangeRate: 83.25,
        lowerRate: 82.5,
        upperRate: 84.0,
        validFromDt: new Date(),
        status: "ACTIVE",
      },
      {
        fromCurrencyId: createdCurrencies["USD"].id,
        toCurrencyId: createdCurrencies["EUR"].id,
        exchangeRate: 0.92,
        lowerRate: 0.9,
        upperRate: 0.94,
        validFromDt: new Date(),
        status: "ACTIVE",
      },
      {
        fromCurrencyId: createdCurrencies["USD"].id,
        toCurrencyId: createdCurrencies["SGD"].id,
        exchangeRate: 1.35,
        lowerRate: 1.33,
        upperRate: 1.37,
        validFromDt: new Date(),
        status: "ACTIVE",
      },
    ];

    for (const rateData of exchangeRatesData) {
      const rate = await prisma.currencyExchangeRate.create({
        data: rateData,
      });
      console.log(
        `✅ Created exchange rate: ${createdCurrencies["USD"].code} to ${
          rate.toCurrency ? "target currency" : "unknown"
        }`
      );
    }

    // 🏗️ Creating operators
    console.log("🏗️ Creating operators...");
    const operatorsData = [
      {
        name: "LA Port Operations",
        companyName: "LA Port Operations Inc",
        portId: createdPorts["USLAX"].id,
        email: "ops@laportops.com",
        city: "Los Angeles",
        stateId: createdStates[`CA_${createdCountries["US"].id}`].id,
        countryId: createdCountries["US"].id,
        addressLine1: "789 Terminal Way",
        mobNum: "+1-555-0200",
        status: "ACTIVE",
      },
      {
        name: "Mumbai Port Operator",
        companyName: "Mumbai Port Trust",
        portId: createdPorts["INBOM"].id,
        email: "operations@mumbaiport.gov.in",
        city: "Mumbai",
        stateId: createdStates[`MH_${createdCountries["IN"].id}`].id,
        countryId: createdCountries["IN"].id,
        addressLine1: "Port Trust Building",
        mobNum: "+91-98765-00001",
        status: "ACTIVE",
      },
    ];

    for (const operatorData of operatorsData) {
      const operator = await prisma.operator.create({
        data: operatorData,
      });
      console.log(`✅ Created operator: ${operator.name}`);
    }

    // 🏪 Creating depots
    console.log("🏪 Creating depots...");
    const depotsData = [
      {
        name: "LA Container Depot",
        company: "LA Container Services LLC",
        portId: createdPorts["USLAX"].id,
        city: "Los Angeles",
        stateId: createdStates[`CA_${createdCountries["US"].id}`].id,
        countryId: createdCountries["US"].id,
        addressLine1: "555 Container Ave",
        status: "ACTIVE",
      },
      {
        name: "Mumbai Container Depot",
        company: "Mumbai Container Services Pvt Ltd",
        portId: createdPorts["INBOM"].id,
        city: "Mumbai",
        stateId: createdStates[`MH_${createdCountries["IN"].id}`].id,
        countryId: createdCountries["IN"].id,
        addressLine1: "Container Yard Road",
        gstNum: "27DEPOT1234F1Z5",
        panNum: "DEPOT1234F",
        status: "ACTIVE",
      },
    ];

    for (const depotData of depotsData) {
      const depot = await prisma.depot.create({
        data: depotData,
      });
      console.log(`✅ Created depot: ${depot.name}`);
    }

    // 📊 Creating tariffs
    console.log("📊 Creating tariffs...");
    const tariffsData = [
      {
        eventType: "EXPORT",
        productType: "NON_HAZ",
        containerTypeId: createdContainerTypes["20DC"].id,
        chargeId: createdCharges["ocean_freight"].id,
        rate: 1500.0,
        pickAgentId: createdAgents["Pacific Logistics"].id,
        pickPortId: createdPorts["USLAX"].id,
        pickTerminalId: createdTerminals["LAX Terminal 1"].id,
        nextAgentId: createdAgents["Mumbai Freight Services"].id,
        nextPortId: createdPorts["INBOM"].id,
        nextTerminalId: createdTerminals["Mumbai JNPT Terminal"].id,
      },
      {
        eventType: "IMPORT",
        productType: "NON_HAZ",
        containerTypeId: createdContainerTypes["40DC"].id,
        chargeId: createdCharges["ocean_freight"].id,
        rate: 2000.0,
        pickAgentId: createdAgents["Mumbai Freight Services"].id,
        pickPortId: createdPorts["INBOM"].id,
        pickTerminalId: createdTerminals["Mumbai JNPT Terminal"].id,
        nextAgentId: createdAgents["Pacific Logistics"].id,
        nextPortId: createdPorts["USLAX"].id,
        nextTerminalId: createdTerminals["LAX Terminal 2"].id,
      },
      {
        eventType: "EXPORT",
        productType: "NON_HAZ",
        containerTypeId: createdContainerTypes["40HC"].id,
        chargeId: createdCharges["terminal_handling"].id,
        rate: 2500.0,
        pickPortId: createdPorts["SGSIN"].id,
        pickTerminalId: createdTerminals["Singapore PSA Terminal"].id,
        nextPortId: createdPorts["CNSHA"].id,
        nextTerminalId: createdTerminals["Shanghai Yangshan Terminal"].id,
      },
      {
        eventType: "EXPORT",
        productType: "HAZ",
        containerTypeId: createdContainerTypes["20RF"].id,
        chargeId: createdCharges["documentation_fee"].id,
        rate: 300.0,
        pickPortId: createdPorts["INMAA"].id,
        pickTerminalId: createdTerminals["Chennai Container Terminal"].id,
      },
      {
        eventType: "IMPORT",
        productType: "HAZ",
        containerTypeId: createdContainerTypes["40RF"].id,
        chargeId: createdCharges["customs_clearance"].id,
        rate: 1800.0,
        pickPortId: createdPorts["GBLGW"].id,
        pickTerminalId: createdTerminals["London Gateway Terminal 1"].id,
        nextPortId: createdPorts["USLAX"].id,
        nextTerminalId: createdTerminals["LAX Terminal 1"].id,
      },
    ];

    for (const tariffData of tariffsData) {
      const tariff = await prisma.tariff.create({
        data: tariffData,
      });
      console.log(
        `✅ Created tariff: ${tariff.eventType} - ${tariff.productType}`
      );
    }

    // 🗓️ Creating vessel schedules
    console.log("🗓️ Creating vessel schedules...");
    const vesselSchedulesData = [
      {
        vesselId: createdVessels["MSC Oscar"].id,
        voyage: "MSC001W",
        serviceName: "Pacific Express",
        gateOpen: new Date("2024-11-01T08:00:00Z"),
        cutOff: new Date("2024-11-05T18:00:00Z"),
        pickupLocation: "Los Angeles Port",
        pickupTerminalId: createdTerminals["LAX Terminal 1"].id,
        etaDt: new Date("2024-11-06T06:00:00Z"),
        etdDt: new Date("2024-11-06T18:00:00Z"),
        nextPortLocation: "Singapore Port",
        nextPortTerminalId: createdTerminals["Singapore PSA Terminal"].id,
        nextPortArrivalDt: new Date("2024-11-18T10:00:00Z"),
        pcNum: "PC001",
        pcDt: new Date("2024-11-05T12:00:00Z"),
        sobDt: new Date("2024-11-06T20:00:00Z"),
        ataDt: new Date("2024-11-06T05:45:00Z"),
        sobDescription: "Departed LA on schedule",
        ataDescription: "Arrived at LA Terminal 1",
        imNum: "IM001",
        imDt: new Date("2024-11-04T14:00:00Z"),
        imoCode: "9234567",
        callSign: "3EJK2",
        lineCode: "MSC",
        lineIgmNum: "IGM001",
        lineIgmDt: new Date("2024-11-04T16:00:00Z"),
        space20ft: 500,
        space40ft: 800,
        tba: "TBA001",
      },
      {
        vesselId: createdVessels["OOCL Hong Kong"].id,
        voyage: "OOCL002E",
        serviceName: "Asia Europe Loop",
        gateOpen: new Date("2024-11-03T08:00:00Z"),
        cutOff: new Date("2024-11-07T18:00:00Z"),
        pickupLocation: "Mumbai Port",
        pickupTerminalId: createdTerminals["Mumbai JNPT Terminal"].id,
        etaDt: new Date("2024-11-08T08:00:00Z"),
        etdDt: new Date("2024-11-08T20:00:00Z"),
        nextPortLocation: "London Gateway",
        nextPortTerminalId: createdTerminals["London Gateway Terminal 1"].id,
        nextPortArrivalDt: new Date("2024-11-25T14:00:00Z"),
        pcNum: "PC002",
        pcDt: new Date("2024-11-07T14:00:00Z"),
        sobDt: new Date("2024-11-08T22:00:00Z"),
        ataDt: new Date("2024-11-08T07:30:00Z"),
        sobDescription: "Departed Mumbai on time",
        ataDescription: "Arrived at JNPT Terminal",
        imNum: "IM002",
        imDt: new Date("2024-11-06T16:00:00Z"),
        imoCode: "9345678",
        callSign: "VRDB6",
        lineCode: "OOCL",
        lineIgmNum: "IGM002",
        lineIgmDt: new Date("2024-11-06T18:00:00Z"),
        space20ft: 600,
        space40ft: 900,
        tba: "TBA002",
      },
      {
        vesselId: createdVessels["CMA CGM Marco Polo"].id,
        voyage: "CMA003N",
        serviceName: "Mediterranean Express",
        gateOpen: new Date("2024-11-05T08:00:00Z"),
        cutOff: new Date("2024-11-09T18:00:00Z"),
        pickupLocation: "Shanghai Port",
        pickupTerminalId: createdTerminals["Shanghai Yangshan Terminal"].id,
        etaDt: new Date("2024-11-10T12:00:00Z"),
        etdDt: new Date("2024-11-11T06:00:00Z"),
        nextPortLocation: "Chennai Port",
        nextPortTerminalId: createdTerminals["Chennai Container Terminal"].id,
        nextPortArrivalDt: new Date("2024-11-20T16:00:00Z"),
        pcNum: "PC003",
        pcDt: new Date("2024-11-09T16:00:00Z"),
        sobDt: new Date("2024-11-11T08:00:00Z"),
        ataDt: new Date("2024-11-10T11:45:00Z"),
        sobDescription: "Departed Shanghai Yangshan",
        ataDescription: "Arrived at Yangshan Terminal",
        imNum: "IM003",
        imDt: new Date("2024-11-08T12:00:00Z"),
        imoCode: "9456789",
        callSign: "FMCY7",
        lineCode: "CMA",
        lineIgmNum: "IGM003",
        lineIgmDt: new Date("2024-11-08T14:00:00Z"),
        space20ft: 700,
        space40ft: 1000,
        tba: "TBA003",
      },
    ];

    for (const scheduleData of vesselSchedulesData) {
      const schedule = await prisma.vesselSchedule.create({
        data: scheduleData,
      });
      console.log(
        `✅ Created vessel schedule: ${schedule.voyage} - ${schedule.serviceName}`
      );
    }

    console.log("�🎉 Database seeding completed successfully!");
    console.log("\nSample login credentials:");
    console.log("Admin: admin@nvocc.com / Admin@123");
    console.log("Customer: customer@test.com / Customer@123");
    console.log("Sales: sales@test.com / Sales@123");
    console.log("Port: port@test.com / Port@123");
    console.log("Multi-role: multiuser@test.com / Multi@123");

    console.log("\nSample Data Created:");
    console.log(`- ${Object.keys(createdCurrencies).length} Currencies`);
    console.log(`- ${Object.keys(createdCountries).length} Countries`);
    console.log(`- ${Object.keys(createdStates).length} States`);
    console.log(`- ${Object.keys(createdPorts).length} Ports`);
    console.log(`- ${Object.keys(createdTerminals).length} Terminals`);
    console.log(`- ${Object.keys(createdVessels).length} Vessels`);
    console.log(`- ${Object.keys(createdCargo).length} Cargo Types`);
    console.log(
      `- ${Object.keys(createdContainerTypes).length} Container Types`
    );
    console.log(`- ${Object.keys(createdAgents).length} Agents`);
    console.log("- 5 Commodities");
    console.log("- 2 Bank Accounts");
    console.log("- 5 Tariffs");
    console.log("- 3 Vessel Schedules");
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

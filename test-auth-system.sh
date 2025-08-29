#!/bin/bash

# NVOCC Platform Authentication System Test Script
# This script demonstrates all authentication features

BASE_URL="http://localhost:5000/api"
echo "🚀 NVOCC Platform Authentication System Test"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
    else
        echo -e "${RED}❌ $1${NC}"
    fi
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Test 1: Health Check
echo "1. Testing System Health"
echo "========================"
response=$(curl -s -w "%{http_code}" $BASE_URL/../health)
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Health check passed" 0
    echo "$body" | jq .
else
    print_status "Health check failed (HTTP $http_code)" 1
    echo "$body"
fi
echo ""

# Test 2: Get Available Roles
echo "2. Testing Available Roles"
echo "=========================="
response=$(curl -s -w "%{http_code}" $BASE_URL/test/roles)
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Roles retrieval passed" 0
    echo "$body" | jq .
else
    print_status "Roles retrieval failed (HTTP $http_code)" 1
    echo "$body"
fi
echo ""

# Test 3: User Registration
echo "3. Testing User Registration"
echo "============================"
print_info "Registering new test user..."

registration_data='{
  "email": "testuser@example.com",
  "password": "TestUser@123",
  "firstName": "Test",
  "lastName": "User",
  "phoneNumber": "+1234567890",
  "roles": ["CUSTOMER"]
}'

response=$(curl -s -w "%{http_code}" -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "$registration_data")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "201" ]; then
    print_status "Registration passed" 0
    echo "$body" | jq .
else
    print_status "Registration failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Test 4: User Login (Admin)
echo "4. Testing Admin Login"
echo "======================"
print_info "Logging in as admin..."

login_data='{
  "email": "admin@nvocc.com",
  "password": "Admin@123"
}'

response=$(curl -s -w "%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "$login_data")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Admin login passed" 0
    # Extract access token
    access_token=$(echo "$body" | jq -r '.data.accessToken')
    echo "$body" | jq .
    print_info "Access token saved for subsequent tests"
else
    print_status "Admin login failed (HTTP $http_code)" 1
    echo "$body" | jq .
    exit 1
fi
echo ""

# Test 5: Get User Profile
echo "5. Testing Profile Retrieval"
echo "============================="
print_info "Getting user profile..."

response=$(curl -s -w "%{http_code}" -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $access_token")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Profile retrieval passed" 0
    echo "$body" | jq .
else
    print_status "Profile retrieval failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Test 6: Get Available Roles for User
echo "6. Testing User Roles Retrieval"
echo "================================"
print_info "Getting available roles for user..."

response=$(curl -s -w "%{http_code}" -X GET $BASE_URL/auth/roles \
  -H "Authorization: Bearer $access_token")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "User roles retrieval passed" 0
    echo "$body" | jq .
else
    print_status "User roles retrieval failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Test 7: Get User Menus
echo "7. Testing Menus Retrieval"
echo "==========================="
print_info "Getting menus for user..."

response=$(curl -s -w "%{http_code}" -X GET $BASE_URL/auth/menus \
  -H "Authorization: Bearer $access_token")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Menus retrieval passed" 0
    echo "$body" | jq .
else
    print_status "Menus retrieval failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Test 8: Multi-role User Login
echo "8. Testing Multi-role User Login"
echo "================================="
print_info "Logging in as multi-role user..."

multiuser_login='{
  "email": "multiuser@test.com",
  "password": "Multi@123"
}'

response=$(curl -s -w "%{http_code}" -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "$multiuser_login")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Multi-role user login passed" 0
    # Extract access token for multi-role user
    multiuser_token=$(echo "$body" | jq -r '.data.accessToken')
    echo "$body" | jq .
    print_info "Multi-role user token saved"
else
    print_status "Multi-role user login failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Test 9: Role Switching
echo "9. Testing Role Switching"
echo "=========================="
print_info "Switching from SALES to CUSTOMER role..."

if [ ! -z "$multiuser_token" ]; then
    role_switch_data='{
      "role": "CUSTOMER"
    }'

    response=$(curl -s -w "%{http_code}" -X POST $BASE_URL/auth/switch-role \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $multiuser_token" \
      -d "$role_switch_data")
    http_code="${response: -3}"
    body="${response%???}"

    if [ "$http_code" == "200" ]; then
        print_status "Role switching passed" 0
        # Update token after role switch
        multiuser_token=$(echo "$body" | jq -r '.data.accessToken')
        echo "$body" | jq .
        print_info "New token with CUSTOMER role saved"
    else
        print_status "Role switching failed (HTTP $http_code)" 1
        echo "$body" | jq .
    fi
else
    print_warning "Skipping role switching test (no multi-role token)"
fi
echo ""

# Test 10: Authentication Check
echo "10. Testing Authentication Check"
echo "================================="
print_info "Checking authentication status..."

response=$(curl -s -w "%{http_code}" -X GET $BASE_URL/auth/check \
  -H "Authorization: Bearer $access_token")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Authentication check passed" 0
    echo "$body" | jq .
else
    print_status "Authentication check failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Test 11: Rate Limiting Test
echo "11. Testing Rate Limiting"
echo "=========================="
print_info "Testing rate limiting with multiple requests..."

# Make multiple login attempts to trigger rate limiting
failed_login='{
  "email": "nonexistent@test.com",
  "password": "wrongpassword"
}'

rate_limit_triggered=false
for i in {1..6}; do
    response=$(curl -s -w "%{http_code}" -X POST $BASE_URL/auth/login \
      -H "Content-Type: application/json" \
      -d "$failed_login")
    http_code="${response: -3}"
    
    if [ "$http_code" == "429" ]; then
        rate_limit_triggered=true
        print_status "Rate limiting triggered after $i attempts" 0
        break
    fi
    
    print_info "Attempt $i: HTTP $http_code"
    sleep 1
done

if [ "$rate_limit_triggered" == false ]; then
    print_warning "Rate limiting not triggered (might need more attempts)"
fi
echo ""

# Test 12: Logout
echo "12. Testing Logout"
echo "=================="
print_info "Logging out admin user..."

response=$(curl -s -w "%{http_code}" -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $access_token")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "200" ]; then
    print_status "Logout passed" 0
    echo "$body" | jq .
else
    print_status "Logout failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Test 13: Access with Invalid Token
echo "13. Testing Invalid Token Access"
echo "================================="
print_info "Trying to access protected route with logged out token..."

response=$(curl -s -w "%{http_code}" -X GET $BASE_URL/auth/profile \
  -H "Authorization: Bearer $access_token")
http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" == "401" ]; then
    print_status "Invalid token handling passed" 0
    echo "$body" | jq .
else
    print_status "Invalid token handling failed (HTTP $http_code)" 1
    echo "$body" | jq .
fi
echo ""

# Summary
echo "🎉 Test Summary"
echo "==============="
print_info "All authentication system tests completed!"
print_info "Key features tested:"
echo "   • User registration with role assignment"
echo "   • Multi-role user login"
echo "   • JWT token authentication"
echo "   • Role switching without logout"
echo "   • Dynamic menu access based on roles"
echo "   • Rate limiting protection"
echo "   • Secure logout and session invalidation"
echo "   • Proper error handling"
echo ""
print_info "The NVOCC Platform authentication system is ready for use!"
echo ""
print_warning "Next steps:"
echo "   1. Set up your PostgreSQL database"
echo "   2. Run: npm run db:migrate"
echo "   3. Run: npm run db:seed"
echo "   4. Start building your frontend integration"

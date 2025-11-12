#!/bin/bash

BASE_URL="http://localhost:4000/api/auth"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPass123!"
TEST_NAME="John Doe"

PASSED=0
FAILED=0

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local expected_status=$5

  echo -e "${YELLOW}Testing: $name${NC}"

  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      "$BASE_URL$endpoint")
  fi

  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$status" = "$expected_status" ] || [ -z "$expected_status" ]; then
    echo -e "${GREEN}✅ PASSED${NC} (HTTP $status)"
    ((PASSED++))
  else
    echo -e "${RED}❌ FAILED${NC} (Expected $expected_status, got $status)"
    echo "Response: $body"
    ((FAILED++))
  fi
  echo ""
}

echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}🧪 API Integration Tests${NC}"
echo -e "${YELLOW}================================${NC}"
echo ""

# Test 1: Register a user
echo -e "${YELLOW}📝 Testing Registration Endpoint${NC}"
echo "=================================="
test_endpoint \
  "Register new user" \
  "POST" \
  "/register" \
  "{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  "201"

# Test 2: Register without email
test_endpoint \
  "Register without email" \
  "POST" \
  "/register" \
  "{\"name\":\"$TEST_NAME\",\"password\":\"$TEST_PASSWORD\"}" \
  "400"

# Test 3: Register without password
test_endpoint \
  "Register without password" \
  "POST" \
  "/register" \
  "{\"name\":\"$TEST_NAME\",\"email\":\"test-$(date +%s)-2@example.com\"}" \
  "400"

# Test 4: Register with duplicate email
test_endpoint \
  "Register with duplicate email" \
  "POST" \
  "/register" \
  "{\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  "400"

# Test 5: Login with correct credentials
echo -e "${YELLOW}🔐 Testing Login Endpoint${NC}"
echo "=========================="
test_endpoint \
  "Login with valid credentials" \
  "POST" \
  "/login" \
  "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  "200"

# Test 6: Login with wrong password
test_endpoint \
  "Login with wrong password" \
  "POST" \
  "/login" \
  "{\"email\":\"$TEST_EMAIL\",\"password\":\"WrongPassword123!\"}" \
  "401"

# Test 7: Login with non-existent email
test_endpoint \
  "Login with non-existent email" \
  "POST" \
  "/login" \
  "{\"email\":\"nonexistent-$(date +%s)@example.com\",\"password\":\"$TEST_PASSWORD\"}" \
  "401"

# Test 8: Verify email without token
echo -e "${YELLOW}✉️  Testing Email Verification Endpoint${NC}"
echo "========================================"
test_endpoint \
  "Verify email without token" \
  "GET" \
  "/verify-email" \
  "" \
  "400"

# Test 9: Verify email with invalid token
test_endpoint \
  "Verify email with invalid token" \
  "GET" \
  "/verify-email?token=invalid-token-123456789" \
  "" \
  "400"

# Test 10: Forgot password
echo -e "${YELLOW}🔄 Testing Password Reset Endpoints${NC}"
echo "======================================"
test_endpoint \
  "Forgot password with valid email" \
  "POST" \
  "/forgot-password" \
  "{\"email\":\"$TEST_EMAIL\"}" \
  "200"

# Test 11: Forgot password without email
test_endpoint \
  "Forgot password without email" \
  "POST" \
  "/forgot-password" \
  "{}" \
  "400"

# Test 12: Reset password without token
test_endpoint \
  "Reset password without token" \
  "POST" \
  "/reset-password" \
  "{\"newPassword\":\"NewPass123!\"}" \
  "400"

# Test 13: Reset password without password
test_endpoint \
  "Reset password without password" \
  "POST" \
  "/reset-password" \
  "{\"token\":\"some-token\"}" \
  "400"

# Test 14: Reset password with invalid token
test_endpoint \
  "Reset password with invalid token" \
  "POST" \
  "/reset-password" \
  "{\"token\":\"invalid-token-12345678\",\"newPassword\":\"NewPass123!\"}" \
  "400"

# Test 15: Logout
echo -e "${YELLOW}🚪 Testing Logout Endpoint${NC}"
echo "============================"
test_endpoint \
  "Logout" \
  "POST" \
  "/logout" \
  "{}" \
  "200"

# Print summary
echo ""
echo -e "${YELLOW}================================${NC}"
echo -e "${YELLOW}📊 Test Summary${NC}"
echo -e "${YELLOW}================================${NC}"
TOTAL=$((PASSED + FAILED))
echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 All tests passed!${NC}"
  exit 0
else
  echo ""
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi

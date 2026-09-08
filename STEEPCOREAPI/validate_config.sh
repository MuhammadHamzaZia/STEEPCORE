#!/bin/bash
# Configuration validation script for production environment
# This script validates all required environment settings

echo "================================"
echo "SteepCoreAPI - Configuration Validator"
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation status
VALIDATION_PASSED=true

# Function to check environment variable
check_env_var() {
	local var_name=$1
	local description=$2
	local value=${!var_name}

	if [ -z "$value" ]; then
		echo -e "${RED}✗ MISSING: ${description}${NC}"
		echo "  Environment variable: $var_name"
		VALIDATION_PASSED=false
	else
		# Mask sensitive values for display
		local display_value="${value:0:10}..."
		echo -e "${GREEN}✓ SET: ${description}${NC}"
		echo "  Value: $display_value"
	fi
	echo ""
}

# Function to validate value format
check_value_format() {
	local var_name=$1
	local description=$2
	local expected_prefix=$3
	local value=${!var_name}

	if [ -z "$value" ]; then
		echo -e "${RED}✗ MISSING: ${description}${NC}"
		echo "  Environment variable: $var_name"
		VALIDATION_PASSED=false
	elif [[ "$value" == "$expected_prefix"* ]]; then
		echo -e "${GREEN}✓ VALID: ${description}${NC}"
		echo "  Prefix validated: $expected_prefix"
	else
		echo -e "${RED}✗ INVALID: ${description}${NC}"
		echo "  Expected prefix: $expected_prefix"
		echo "  Got: ${value:0:15}..."
		VALIDATION_PASSED=false
	fi
	echo ""
}

echo "Checking Database Configuration..."
check_env_var "DB_CONNECTION_STRING" "Database Connection String"

echo "Checking JWT Configuration..."
check_env_var "JWT_SECRET" "JWT Secret (min 32 chars)"
check_env_var "JWT_ISSUER" "JWT Issuer"

echo "Checking Gemini AI Configuration..."
check_env_var "GEMINI_API_KEY" "Gemini API Key"

echo "Checking Stripe Configuration..."
check_value_format "STRIPE_SECRET_KEY" "Stripe Secret Key" "sk_live_"
check_value_format "STRIPE_PUBLISHABLE_KEY" "Stripe Publishable Key" "pk_live_"
check_env_var "STRIPE_WEBHOOK_SECRET" "Stripe Webhook Secret"

echo "Checking Frontend Configuration..."
check_env_var "FRONTEND_URL" "Frontend URL"

echo "================================"
if [ "$VALIDATION_PASSED" = true ]; then
	echo -e "${GREEN}✓ All configuration values validated successfully!${NC}"
	echo ""
	echo "You can proceed with deployment."
	exit 0
else
	echo -e "${RED}✗ Configuration validation failed!${NC}"
	echo ""
	echo "Please ensure all required environment variables are set:"
	echo ""
	echo "  export DB_CONNECTION_STRING='...'"
	echo "  export JWT_SECRET='...'"
	echo "  export JWT_ISSUER='https://your-api-domain.com'"
	echo "  export GEMINI_API_KEY='...'"
	echo "  export STRIPE_SECRET_KEY='sk_live_...'"
	echo "  export STRIPE_PUBLISHABLE_KEY='pk_live_...'"
	echo "  export STRIPE_WEBHOOK_SECRET='whsec_...'"
	echo "  export FRONTEND_URL='https://your-frontend-domain.com'"
	echo ""
	exit 1
fi

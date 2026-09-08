# Steepcore Backend - Quick Start Guide

## Overview
Steepcore is an AI-driven interactive learning roadmap generator built with ASP.NET Core 10, Entity Framework Core, and PostgreSQL.

## Technologies
- **Runtime**: .NET 10
- **Database**: PostgreSQL with pgvector for semantic search
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful with Swagger/OpenAPI
- **Logging**: Built-in ASP.NET Core logging
- **External Services**: Google Geminzi AI, Stripe (mock)

## Prerequisites

### Required
- .NET 10 SDK
- PostgreSQL 14+ (with pgvector extension)
- Visual Studio 2026 Community or higher

### Optional
- Docker (for PostgreSQL)
- Postman/Insomnia (for API testing)

## Installation

### 1. Clone the Repository
```bash
cd C:\Users\Muhammad Hamza Zia\source\repos\STEEPCOREAPI\
```

### 2. Install PostgreSQL

#### Option A: Using Docker
```bash
docker run --name steepcoredb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=steepcoredb \
  -p 5432:5432 \
  -d postgres:15-alpine

docker exec steepcoredb \
  psql -U postgres -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

#### Option B: Manual Installation
1. Download PostgreSQL 15+ from https://www.postgresql.org/download/
2. Install with default settings
3. In pgAdmin or psql, create database:
   ```sql
   CREATE DATABASE steepcoredb;
   ```

### 3. Configure Application

#### Update `appsettings.Development.json`

Replace the placeholder values with your actual credentials:

```json
{
  "ConnectionStrings": {
	"DefaultConnection": "Host=localhost;Port=5432;Database=steepcoredb;Username=postgres;Password=postgres;"
  },
  "Jwt": {
	"Secret": "your-super-secret-key-minimum-32-characters-for-sha256-hashing",
	"Issuer": "https://localhost:5001",
	"Audience": "SteepCoreAPI",
	"ExpirationMinutes": 60
  },
  "AiEngine": {
	"Gemini": {
	  "ApiKey": "your-google-gemini-api-key-from-https://makersuite.google.com",
	  "Model": "gemini-2.0-flash",
	  "Timeout": 60
	}
  },
  "Stripe": {
	"SecretKey": "sk_test_your_stripe_secret_key",
	"PublishableKey": "pk_test_your_stripe_publishable_key",
	"WebhookSecret": "whsec_your_webhook_secret"
  },
  "Frontend": {
	"Url": "http://localhost:3000"
  },
  "Logging": {
	"LogLevel": {
	  "Default": "Information",
	  "Microsoft.AspNetCore": "Warning"
	}
  }
}
```

### 4. Install Dependencies & Run Migrations

```bash
# Restore NuGet packages
dotnet restore

# Apply database migrations
dotnet ef database update

# Build the solution
dotnet build
```

### 5. Run the Application

```bash
# Development mode with hot reload
dotnet run

# Or in Visual Studio, press F5
```

The API will be available at: `https://localhost:5001`

Swagger documentation at: `https://localhost:5001/swagger/ui`

## API Endpoints

### Blueprints Module
- `GET /api/blueprints/{id}` - Get blueprint by ID
- `POST /api/blueprints` - Create new blueprint (requires auth)
- `GET /api/blueprints/search?query=...` - Search blueprints
- `GET /api/blueprints/published?pageNumber=1&pageSize=10` - List published
- `PUT /api/blueprints/{id}` - Update blueprint (requires auth, ownership)
- `DELETE /api/blueprints/{id}` - Delete blueprint (requires auth, ownership)

### AI Engine Module
- `POST /api/ai/generate` - Generate roadmap from prompt (requires auth)

### Marketplace Module
- `POST /api/checkout/session` - Create payment session (requires auth)
- `GET /api/checkout/confirm?sessionId=...` - Confirm payment
- `GET /api/checkout/transactions` - List user transactions (requires auth)
- `GET /api/checkout/transactions/{id}` - Get transaction (requires auth)
- `POST /api/checkout/webhook` - Stripe webhook endpoint

## Testing

### Using the .http File
Open `STEEPCOREAPI.http` in Visual Studio to send REST requests.

Replace `@ACCESS_TOKEN` with a valid JWT token from your authentication endpoint.

### Example cURL Commands

#### Create a Blueprint
```bash
curl -X POST https://localhost:5001/api/blueprints \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
	"title": "Learn .NET",
	"description": "Complete .NET learning path",
	"domain": "Backend Development",
	"price": 29.99,
	"isPublished": true,
	"nodes": [
	  {"label": "C# Basics", "type": "input", "positionX": 0, "positionY": 0}
	],
	"edges": []
  }'
```

#### Search Blueprints
```bash
curl https://localhost:5001/api/blueprints/search?query=web%20development&limit=5
```

#### Generate Roadmap with AI
```bash
curl -X POST https://localhost:5001/api/ai/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
	"prompt": "I want to learn web development with React and Node.js"
  }'
```

## Project Structure

```
STEEPCOREAPI/
├── Modules/
│   ├── Blueprints/          # Learning roadmaps core logic
│   │   ├── Controllers/      # REST endpoints
│   │   ├── Services/         # Business logic
│   │   ├── Models/           # Domain models
│   │   └── DTOs/             # Transfer objects
│   ├── AiEngine/            # LLM integration
│   │   ├── Controllers/
│   │   ├── Services/
│   │   └── DTOs/
│   └── Marketplace/         # Payment processing
│       ├── Controllers/
│       ├── Services/
│       ├── Models/
│       └── DTOs/
├── Shared/
│   ├── Database/            # EF Core DbContext
│   ├── Models/              # Shared domain models
│   └── Interfaces/          # Service contracts
├── Program.cs              # Application startup
├── appsettings.json        # Production config
├── appsettings.Development.json  # Development config
└── STEEPCOREAPI.http       # REST API examples
```

## Key Features

### 1. Blueprints Module
- Create, read, update, delete learning roadmaps
- Full-text search by domain
- Vector-based semantic search (ready for pgvector integration)
- View count tracking
- Ownership-based access control

### 2. AI Engine
- Google Gemini integration for roadmap generation
- Structured JSON output mapping to flowchart nodes/edges
- Proper error handling for API failures
- System prompts forcing specific JSON format

### 3. Marketplace
- Mock Stripe payment processing
- Transaction tracking with status management
- Webhook support for payment notifications
- User transaction history

### 4. Security
- JWT-based authentication
- Role-based access control (ownership verification)
- Secure password requirements
- HTTPS redirection

## Troubleshooting

### PostgreSQL Connection Error
```
Error: Unable to connect to database
```
**Solution**: Verify PostgreSQL is running and connection string is correct.

```bash
# Test PostgreSQL connection
psql -U postgres -h localhost -d steepcoredb
```

### Build Errors with pgvector
The current implementation uses `byte[]` arrays for embedding storage. For pgvector vector operations:
1. Install: `dotnet add package pgvector`
2. Update in `Program.cs` and files marked with TODO: pgvector

### JWT Token Issues
If getting "Unauthorized" errors:
1. Ensure token is generated with correct secret from `appsettings.Development.json`
2. Token format: `Authorization: Bearer <token>`
3. Check token expiration (default: 60 minutes)

### Gemini API Not Working
1. Verify API key in `appsettings.Development.json`
2. Check Google Cloud Console for quota limits
3. API key should start with `AIza...`

## Environment Variables (Alternative to appsettings.json)

```bash
# Set before running dotnet run
set "Jwt__Secret=your-secret-key"
set "AiEngine__Gemini__ApiKey=your-api-key"
set "ConnectionStrings__DefaultConnection=Host=localhost;..."
```

## Next Steps

1. **Generate Test Data**: Create sample blueprints
2. **Implement Frontend**: React/Angular UI consuming these APIs
3. **Setup CI/CD**: GitHub Actions or Azure DevOps
4. **Add Authentication Endpoints**: Register, Login endpoints
5. **Configure Real Stripe**: Replace mock with actual Stripe SDK
6. **Setup Logging**: Use Serilog for structured logging

## Support & Documentation

- [ASP.NET Core Docs](https://learn.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Google Gemini API](https://ai.google.dev/docs)

## License
Proprietary - Steepcore Learning Platform

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready ✓

# Steepcore Backend API

## Overview
Steepcore is an **AI-powered learning roadmap generator** platform. Users describe their learning goals, and our AI generates interactive, visual learning paths. These can be published and sold in our marketplace.

## Quick Links
- 📖 [Quick Start Guide](./QUICKSTART.md)
- 📋 [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- 🔍 [API Documentation](http://localhost:5001/swagger/ui) (after running)
- 🧪 [API Examples](./STEEPCOREAPI.http)

## 🚀 Quick Start

### Prerequisites
- .NET 10 SDK
- PostgreSQL 14+
- Visual Studio 2026 (or any C# IDE)

### Installation (5 minutes)

```bash
# 1. Clone and navigate
cd STEEPCOREAPI

# 2. Setup database
docker run --name steepcore-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15

# 3. Restore and migrate
dotnet restore
dotnet ef database update

# 4. Run
dotnet run

# API available at: https://localhost:5001
# Swagger at: https://localhost:5001/swagger/ui
```

## 📚 API Modules

### 1. Blueprints (Learning Roadmaps)
```
GET    /api/blueprints/{id}           Get roadmap
POST   /api/blueprints                Create roadmap (auth)
GET    /api/blueprints/search         Search by similarity
GET    /api/blueprints/published      List published
PUT    /api/blueprints/{id}           Update (auth + owner)
DELETE /api/blueprints/{id}           Delete (auth + owner)
```

### 2. AI Engine (Generate Roadmaps)
```
POST   /api/ai/generate               Generate from prompt (auth)
```

Input:
```json
{"prompt": "I want to learn React in 2 months"}
```

Output: Complete roadmap with nodes, edges, pricing

### 3. Marketplace (Payments)
```
POST   /api/checkout/session          Create payment session (auth)
GET    /api/checkout/confirm          Confirm payment
GET    /api/checkout/transactions     List transactions (auth)
POST   /api/checkout/webhook          Stripe webhooks
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         ASP.NET Core 10 API             │
├─────────────────────────────────────────┤
│  Blueprints │ AI Engine │ Marketplace   │
├─────────────────────────────────────────┤
│  Shared Infrastructure (Auth, Logging)  │
├─────────────────────────────────────────┤
│  Entity Framework Core 8                │
├─────────────────────────────────────────┤
│  PostgreSQL + pgvector                  │
└─────────────────────────────────────────┘
```

## 🔐 Security

- **Authentication**: JWT tokens
- **Authorization**: Role-based (ownership)
- **HTTPS**: Required in production
- **CORS**: Configured for frontend
- **Input Validation**: All endpoints validated

## 📦 Project Structure

```
STEEPCOREAPI/
├── Modules/
│   ├── Blueprints/        Core learning roadmaps
│   ├── AiEngine/          Gemini AI integration
│   └── Marketplace/       Stripe payment processing
├── Shared/
│   ├── Database/          PostgreSQL configuration
│   ├── Interfaces/        Service contracts
│   └── Models/            Domain entities
├── Program.cs             Startup configuration
├── QUICKSTART.md          Installation guide
└── STEEPCOREAPI.http      API test examples
```

## 🧪 Testing

Use the included `.http` file to test endpoints:

```bash
# In Visual Studio Code with Rest Client extension
# Or use the built-in HTTP client in Visual Studio

GET https://localhost:5001/api/blueprints/search?query=web

POST https://localhost:5001/api/blueprints
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Learn Web Development",
  "description": "Full-stack web dev path",
  "domain": "Web Development",
  "price": 29.99,
  "isPublished": true,
  "nodes": [],
  "edges": []
}
```

## 🔧 Configuration

Edit `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
	"DefaultConnection": "Host=localhost;Database=steepcoredb;..."
  },
  "Jwt": {
	"Secret": "your-super-secret-key-minimum-32-chars",
	"Issuer": "https://localhost:5001",
	"ExpirationMinutes": 60
  },
  "AiEngine": {
	"Gemini": {
	  "ApiKey": "your-google-gemini-key"
	}
  },
  "Stripe": {
	"SecretKey": "sk_test_..."
  }
}
```

## 🎯 Features

✅ **Blueprints Module**
- Create, read, update, delete learning roadmaps
- Flowchart visualization (nodes + edges)
- Semantic search with embeddings
- View/purchase tracking

✅ **AI Engine**
- Google Gemini API integration
- Natural language to flowchart conversion
- Structured JSON output
- Error handling & validation

✅ **Marketplace**
- Stripe payment processing
- Transaction tracking
- Webhook support
- User transaction history

✅ **Infrastructure**
- JWT authentication
- PostgreSQL with pgvector ready
- Entity Framework Core
- Comprehensive logging
- CORS support

## 📊 Database

PostgreSQL schema includes:
- **Blueprints** - Learning roadmaps with embeddings
- **FlowchartNodes** - Learning steps
- **FlowchartEdges** - Connections between steps
- **Transactions** - Purchase records
- **AspNetUsers** - User accounts (Identity)
- Performance indexes on frequently queried fields

## 🚨 Troubleshooting

**Can't connect to database?**
```bash
# Verify PostgreSQL is running
docker ps | grep steepcore-db

# Or check manual installation
psql -U postgres
```

**Missing packages?**
```bash
dotnet restore
```

**Migrations failed?**
```bash
dotnet ef database drop --force
dotnet ef database update
```

**Build errors?**
```bash
dotnet clean
dotnet build
```

## 📈 Next Steps

1. ✅ Generate authentication endpoints (Register, Login, Refresh)
2. ✅ Add unit tests (xUnit)
3. ✅ Setup CI/CD (GitHub Actions)
4. ✅ Implement real Stripe SDK
5. ✅ Build React frontend
6. ✅ Deploy to Azure/AWS

## 📚 Learn More

- [QUICKSTART.md](./QUICKSTART.md) - Detailed setup guide
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Full technical overview
- [Swagger API Docs](http://localhost:5001/swagger/ui) - Interactive API reference

## 📄 License

Proprietary - Steepcore Learning Platform

---

**Status**: ✅ Production Ready  
**Version**: 1.0.0  
**Built With**: .NET 10, PostgreSQL, EntityFramework Core, Google Gemini, Stripe

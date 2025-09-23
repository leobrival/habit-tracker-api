# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development Tasks
- `npm run dev` - Start development server with hot module reloading
- `npm run build` - Build the application for production
- `npm test` - Run all test suites (unit, functional, integration)
- `npm run lint` - Run ESLint for code quality checks
- `npm run typecheck` - TypeScript type checking without compilation
- `npm run format` - Format code using Prettier

### AdonisJS Ace Commands
- `node ace serve --hmr` - Start development server (same as npm run dev)
- `node ace build` - Build the application
- `node ace test` - Run tests with Japa test runner
- `node ace list:routes` - View all registered routes
- `node ace make:controller <name>` - Generate new controller
- `node ace make:model <name>` - Generate new Lucid model
- `node ace make:migration <name>` - Generate database migration

### Test Suites
The project uses Japa test runner with three test suites:
- **Unit tests**: `tests/unit/**/*.spec.ts` (2s timeout)
- **Functional tests**: `tests/functional/**/*.spec.ts` (30s timeout) 
- **Integration tests**: `tests/integration/**/*.spec.ts` (60s timeout)

## Architecture Overview

### Tech Stack
- **Framework**: AdonisJS v6 (Node.js MVC framework)
- **Database**: PostgreSQL with Lucid ORM
- **Authentication**: Supabase Auth integration
- **Validation**: VineJS for request validation
- **Documentation**: Auto-generated Swagger/OpenAPI via adonis-autoswagger
- **Testing**: Japa test runner with API client support

### Project Structure

#### Import Path Aliases
The project uses TypeScript path mapping for clean imports:
- `#controllers/*` → `./app/controllers/*.js`
- `#models/*` → `./app/models/*.js`
- `#services/*` → `./app/services/*.js`
- `#middleware/*` → `./app/middleware/*.js`
- `#validators/*` → `./app/validators/*.js`
- `#config/*` → `./config/*.js`
- `#database/*` → `./database/*.js`
- `#start/*` → `./start/*.js`
- `#tests/*` → `./tests/*.js`

#### Core Models
- **User**: Integrates with Supabase auth.users via auth_user_id
- **Board**: Habit tracking boards with quantity/binary modes, units system
- **CheckIn**: Individual habit check-ins with values and timestamps

#### Authentication System
- Uses Supabase Auth as the primary authentication provider
- Custom `SupabaseAuthMiddleware` validates JWT tokens
- Database users table syncs with Supabase auth.users via RLS policies
- Test environment includes email confirmation helpers

#### Database Architecture
- PostgreSQL database with Row Level Security (RLS) enabled
- Users table enforces auth_user_id integrity with Supabase auth.users
- Migration-based schema management
- Comprehensive unit system with automatic value inheritance

### API Design

#### Route Structure
- `/health` - Application health check
- `/api/auth/*` - Authentication endpoints (login, register, logout, me)
- `/api/boards` - Boards CRUD operations (RESTful resource)
- `/api/users` - Users CRUD operations (RESTful resource, excluding create/store)
- `/api/check-ins` - Check-ins CRUD operations (RESTful resource)
- `/swagger` - API documentation (JSON)
- `/docs` - Swagger UI interface

#### Middleware Pipeline
- `supabaseAuth()` - Protects API routes, validates Supabase JWT tokens
- `forceJsonResponse()` - Ensures JSON responses for API routes
- `containerBindings()` - IoC container bindings

### Development Environment

#### MCP Server Integrations
The project includes MCP server configurations for:
- **Supabase**: Direct database operations and project management
- **Railway**: Deployment and infrastructure management  
- **Context7**: Documentation access (AdonisJS v6 docs integrated)

#### Testing Strategy
- Integration tests cover full API workflows including auth
- Supabase test helpers for database setup/teardown
- API client for HTTP endpoint testing
- Test-specific email confirmation endpoints

### Environment Configuration
- Database connection via `DATABASE_URL` (PostgreSQL)
- Supabase integration requires `SUPABASE_URL` and `SUPABASE_ANON_KEY`
- Production builds include SSL configuration for database connections
- Hot reloading configured for controllers and middleware during development

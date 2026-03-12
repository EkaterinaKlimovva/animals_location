# Database Setup and Troubleshooting Guide

## Overview

This guide helps you set up and troubleshoot the PostgreSQL database connection for the Animals Location API.

## Database Configuration

### Environment Variables

The application uses the following environment variables for database configuration:

```bash
# Database URL (primary connection string)
DATABASE_URL=postgresql://postgres:pw@localhost:5432/animals_location

# Individual database components
DB_HOST=localhost          # or 'postgres' in Docker
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=pw
DB_NAME=animals_location
```

### Configuration Logic

The application automatically adjusts database configuration based on the environment:

- **Development/Local**: Uses `localhost` as the database host
- **Docker/Production**: Uses `postgres` as the database host (Docker service name)
- **Test Environment**: Uses `localhost` as the database host

## Running with Docker

### Start the Application

```bash
# Start PostgreSQL and the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
docker-compose down
```

### Docker Services

- `postgres`: PostgreSQL database container
- `webapi`: Main application container
- `tests`: Automated test container

## Running Locally

### 1. Start PostgreSQL

```bash
# Using Docker (recommended)
docker run -d --name animals_postgres \
  -e POSTGRES_DB=animals_location \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=pw \
  -p 5432:5432 \
  postgres

# Or using local PostgreSQL installation
# Make sure PostgreSQL is running on port 5432
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Database Migrations

```bash
npm run db:generate
npm run db:push
```

**Note**: The Docker setup automatically runs these migrations when the container starts.

### 4. Start the Application

```bash
npm run run
```

## Testing Database Connection

### Using the Test Script

```bash
# Test database connection
node test-connection.js
```

### Manual Testing

```bash
# Test PostgreSQL connection
psql -h localhost -U postgres -d animals_location -c "SELECT 1;"

# Test with Docker
docker exec -it animals_postgres psql -U postgres -d animals_location -c "SELECT 1;"
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Failed

**Error**: `DatabaseNotReachable` or connection timeout

**Solutions**:
- Ensure PostgreSQL is running
- Check database credentials in `.env` file
- Verify database host configuration
- Check if port 5432 is available

#### 2. Database Does Not Exist

**Error**: `database "animals_location" does not exist`

**Solution**:
```bash
# Create the database
createdb animals_location

# Or using psql
psql -U postgres -c "CREATE DATABASE animals_location;"
```

#### 3. Permission Denied

**Error**: `permission denied for database animals_location`

**Solution**: Ensure the database user has proper permissions

#### 4. Docker Connection Issues

**Error**: Cannot connect to `postgres` host

**Solutions**:
- Ensure Docker containers are running: `docker-compose ps`
- Check container logs: `docker-compose logs postgres`
- Verify network connectivity between containers

### Debug Commands

```bash
# Check if PostgreSQL is listening
netstat -an | grep 5432

# Test connection with telnet
telnet localhost 5432

# Check Docker container status
docker ps

# View Docker logs
docker logs animals_postgres
```

### Environment-Specific Configuration

#### Development Environment

```bash
# .env file for local development
DATABASE_URL=postgresql://postgres:pw@localhost:5432/animals_location
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=pw
DB_NAME=animals_location
```

#### Docker Environment

```bash
# Environment variables are automatically set in docker-compose.yml
# The application automatically detects Docker environment and uses 'postgres' host
# No .env file needed when using Docker
```

#### Test Environment

```bash
# tests/.env file
TEST_BASE_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:pw@localhost:5432/animals_location
```

## Database Schema

The application uses Prisma ORM with the following models:

- `Account`: User accounts
- `Animal`: Animal records
- `AnimalType`: Animal type classifications
- `AnimalOnType`: Many-to-many relationship between animals and types
- `AnimalVisitedLocation`: Animal location history
- `LocationPoint`: Geographic location points

## Reset Database

### Development

```bash
# Drop and recreate database
dropdb animals_location
createdb animals_location

# Run migrations
npm run db:push
```

### Docker

```bash
# Restart with fresh database
docker-compose down -v
docker-compose up -d
```

## Performance Tips

1. **Connection Pooling**: The application uses connection pooling with PostgreSQL
2. **Retry Logic**: Automatic retry for failed connections (5 attempts with 2-second delays)
3. **Logging**: Database queries are logged in development mode
4. **Environment Variables**: Use appropriate configuration for each environment

## Support

If you continue to experience database connection issues:

1. Check the application logs for detailed error messages
2. Verify PostgreSQL is running and accessible
3. Ensure all environment variables are correctly set
4. Test the connection using the provided test script
5. Check Docker container status if using Docker setup
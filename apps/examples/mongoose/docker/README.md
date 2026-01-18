# MongoDB Docker Setup for mongoose-cats Template

This directory contains Docker Compose configuration for running MongoDB locally for testing and development.

## Usage

### Start MongoDB

```bash
docker compose -f docker/docker-compose.yml up -d
```

### Stop MongoDB

```bash
docker compose -f docker/docker-compose.yml down
```

### View Logs

```bash
docker compose -f docker/docker-compose.yml logs -f
```

## Connection String

When MongoDB is running, use this connection string:

```
mongodb://localhost:27017/cats-example
```

## Environment Variables

Set in your `.env` file or environment:

```env
MONGODB_URI=mongodb://localhost:27017/cats-example
JWT_SECRET=your-secret-key
```

# Debugging Cheatsheet

## Containers

```bash
docker ps -a                          # List all containers (running & stopped)
docker ps                             # List running containers only
docker logs <container-id> --tail 100 # View the last 100 lines of logs
docker logs -f <container-id>         # Follow logs live (Ctrl+C to exit)
docker exec -it <container-id> bash   # Open a shell inside the container
docker restart <container-id>         # Restart a container
docker inspect <container-id>         # View detailed container configuration
```

### Common Container Names

* **API:** `task-manager-api`, `taskmanager-api` (or random ID)
* **DB:** `taskmanager-postgres`, `postgres`, `task-manager-db`
* **Redis:** `taskmanager-redis`, `redis`

---

## Database (Docker)

```bash
# 1. Find the postgres container ID or name
docker ps -a | grep postgres

# 2. Connect to the database CLI
docker exec -it <postgres-container> psql -U task_user -d task_manager

# 3. Quick query (run without entering the shell)
docker exec <postgres-container> psql -U task_user -d task_manager -c "SELECT COUNT(*) FROM users;"
```

## Database (AWS RDS)

```bash
# Get endpoint from AWS Console or via CLI:
aws rds describe-db-instances --query 'DBInstances[0].Endpoint.Address'

# Connect via psql:
psql -h <endpoint>.rds.amazonaws.com -U task_user -d task_manager
```

### Common PostgreSQL Commands

*(Use these once connected via `psql`)*

```sql
\l                                  -- List all databases
\c task_manager                     -- Connect to the 'task_manager' database
\dt                                 -- List all tables
\d users                            -- Describe the 'users' table structure
\q                                  -- Exit psql
```

---

## Network

```bash
docker network ls                       # List all docker networks
docker network inspect <network-name>   # View network details (IPs, containers)

# Test connectivity (from host or inside container)
nc -zv localhost 5432                   # Test PostgreSQL port
nc -zv localhost 6379                   # Test Redis port
```

## Environment Variables

```bash
docker exec <container-id> env                  # List all environment variables
docker exec <container-id> env | grep AWS       # Check AWS credentials
docker exec <container-id> env | grep DATABASE  # Check Database connection string
```

---

## Files & Storage

```bash
# Browse files inside a container
docker exec <container-id> ls -la /

# View specific files
docker exec <container-id> cat /app/.env        # Check .env file content
docker exec <container-id> cat /app/main.py     # Verify deployed code version
```

## Cleanup

```bash
docker system df                  # Show docker disk usage
docker image prune -a             # Remove all unused images
docker container prune            # Remove all stopped containers
df -h                             # Check host system disk space
```

---

## Troubleshooting

### Finding Things

```bash
# Find API container
docker ps | grep -E "api|task-manager|faros"

# Find Database container
docker ps -a | grep -E "postgres|db"

# Find what process is using a specific port
sudo netstat -tlnp | grep 8000    # Check API port
sudo netstat -tlnp | grep 5432    # Check Postgres port
```

### Common Fixes

```bash
# Container won't start? Check the exit code and state
docker logs <container-id>
docker inspect <container-id> | grep -A 10 State

# Database connection failed? Ping it from the API container
docker exec <api-container> ping <db-container-name>
docker network inspect bridge

# Out of space?
df -h
docker system prune -a

# Check if service exists (systemd/non-Docker)
sudo systemctl list-units --type=service | grep -E "postgres|taskmanager"
```
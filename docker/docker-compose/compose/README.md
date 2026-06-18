## Running the Entire Application Using Docker

If you want to run all the microservices via docker container, follow the steps below.

### Prerequisites

Many of our microservices rely on external infrastructure services (PostgreSQL, Redis, RabbitMQ, and MongoDB) which run
inside Docker containers. **You must start these containers before running any of the microservices.**

* Ensure you have **Docker** installed and running on your machine.
* Ensure you have **Make** installed (if you wish to use the Makefile shortcuts).

### Step 1: Start the Containers

You can run the following commands either from the project's root directory or from inside the
`docker/docker-compose/compose` folder. *(The examples below assume you are operating from
the `docker/docker-compose/compose` directory).*

If you prefer using standard Docker Compose commands instead of `make`, feel free to do so by referencing the underlying
`docker-compose.yml` file.

```shell
# Start RabbitMQ & Redis containers
make up-infra  

# Start Postgres & MongoDB containers
make up-db

# Start all services
make up-services 

```

**Note:** Wait 2–3 minutes for all the containers to start.

### Step 2: Verify Running Containers

Verify that all four containers have started successfully by running:

```shell
docker ps

```

Your output should look similar to this, showing all services up and healthy:

```text
> docker ps -a
CONTAINER ID   IMAGE                                      COMMAND                  CREATED          STATUS                       PORTS     NAMES
30ffc7d6968f   ripanbaidya/lunecare-frontend:latest       "/docker-entrypoint.…"   25 minutes ago   Exited (0) 5 minutes ago               lunecare-frontend
b6d7594fed5e   ripanbaidya/lunecare-patient:1.0.0         "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-patient
90efbe3e0e29   ripanbaidya/lunecare-api-gateway:1.0.0     "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-api-gateway
45b66fa5999b   ripanbaidya/lunecare-appointment:1.0.0     "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-appointment
63a621f1eee6   ripanbaidya/lunecare-admin:1.0.0           "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-admin
3eb0cc2c04a1   ripanbaidya/lunecare-notification:1.0.0    "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-notification
3b1659052cc4   ripanbaidya/lunecare-auth:1.0.0            "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-auth
307fa51baf8e   ripanbaidya/lunecare-doctor:1.0.0          "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-doctor
003c4ddd9969   ripanbaidya/lunecare-feedback:1.0.0        "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-feedback
6018681fc888   ripanbaidya/lunecare-payment:1.0.0         "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-payment
20b9c12486bd   ripanbaidya/lunecare-eureka-server:1.0.0   "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-eureka-server
fbd899e1a91f   ripanbaidya/lunecare-config-server:1.0.0   "java -cp @/app/jib-…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-config-server
9ad146f53d57   postgres:16-alpine                         "docker-entrypoint.s…"   25 minutes ago   Exited (0) 5 minutes ago               lunecare-postgres
fd5cb18597e6   mongo:8.2                                  "docker-entrypoint.s…"   25 minutes ago   Exited (0) 5 minutes ago               lunecare-mongodb
a62582d8cbe9   rabbitmq:3.12-management-alpine            "docker-entrypoint.s…"   25 minutes ago   Exited (137) 5 minutes ago             lunecare-rabbitmq
63dd0fb656a2   redis:7.2-alpine                           "docker-entrypoint.s…"   25 minutes ago   Exited (0) 5 minutes ago               lunecare-redis
```

### Step 3: Test the Application

Once all services are up and running, you can test the application by accessing the frontend application which is
also deployed as a Docker container.

Open your browser and visit the following URLs to verify that all components are running correctly:

| Component / Service | Target URL                                                                                                     | Verification Criteria                                                                                   |
|---------------------|----------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| **Config Server**   | [http://localhost:8888/actuator/health](https://www.google.com/search?q=http://localhost:8888/actuator/health) | Should return a status of `{"status":"UP"}`.                                                            |
| **Config Profiles** | [http://localhost:8888/auth/dev](https://www.google.com/search?q=http://localhost:8888/auth/dev)               | Verifies that the specific service configurations (e.g., `auth` in `dev` profile) are loading properly. |
| **Eureka Server**   | [http://localhost:8761/](https://www.google.com/search?q=http://localhost:8761/)                               | The dashboard should display all microservices registered with their status as **UP**.                  |
| **Swagger UI**      | `http://localhost:{port}/swagger-ui/index.html`                                                                | Replace `{port}` with the specific service's port to view its interactive API documentation.            |
| **Frontend App**    | [http://localhost:5173/](https://www.google.com/search?q=http://localhost:5173/)                               | Displays the user interface of the running frontend application.                                        |
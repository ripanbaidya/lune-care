## Running the Application Locally

If you want to run all the microservices locally via an IDE (e.g., IntelliJ IDEA, Eclipse), follow the steps below.

### Prerequisites

Many of our microservices rely on external infrastructure services (PostgreSQL, Redis, RabbitMQ, and MongoDB) which run
inside Docker containers. **You must start these containers before running any of the microservices.**

* Ensure you have **Docker** installed and running on your machine.
* Ensure you have **Make** installed (if you wish to use the Makefile shortcuts).

### Step 1: Start the Infrastructure Containers

You can run the following commands either from the project's root directory or from inside the
`docker/docker-compose/local` folder. *(The examples below assume you are operating from
the `docker/docker-compose/local` directory).*

If you prefer using standard Docker Compose commands instead of `make`, feel free to do so by referencing the underlying
`docker-compose.yml` file.

```shell
# Start RabbitMQ & Redis containers
make up-infra  

# Start Postgres & MongoDB containers
make up-db     

```

### Step 2: Verify Running Containers

Verify that all four containers have started successfully by running:

```shell
docker ps

```

Your output should look similar to this, showing all services up and healthy:

```text
CONTAINER ID   IMAGE                             COMMAND                  CREATED          STATUS                            PORTS                                                                                          NAMES
93d9ed583f2c   postgres:16-alpine                "docker-entrypoint.s…"   4 seconds ago    Up 3 seconds (health: starting)   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp                                                    lunecare-postgres
0123bbaf0adb   mongo:8.2                         "docker-entrypoint.s…"   4 seconds ago    Up 3 seconds (health: starting)   0.0.0.0:27017->27017/tcp, [::]:27017->27017/tcp                                                lunecare-mongodb
83049b8a79c8   rabbitmq:3.12-management-alpine   "docker-entrypoint.s…"   10 seconds ago   Up 9 seconds (healthy)            0.0.0.0:5672->5672/tcp, [::]:5672->5672/tcp, 0.0.0.0:15672->15672/tcp, [::]:15672->15672/tcp   lunecare-rabbitmq
7b6bd494255c   redis:7.2-alpine                  "docker-entrypoint.s…"   10 seconds ago   Up 9 seconds (healthy)            0.0.0.0:6379->6379/tcp, [::]:6379->6379/tcp                                                    lunecare-redis

```

### Step 3: Run the Microservices

You can now boot up each microservice one by one from your IDE.

> ⚠️ **Important:** The **order of execution is critical**. If you do not follow this specific sequence, you will
> encounter errors such as `Connection Refused`, `Service Not Found`, or configuration loading failures.

| Boot Order | Service Name    | Type / Description                                                             |
|------------|-----------------|--------------------------------------------------------------------------------|
| **1**      | `config-server` | **Must be run first.** All other services fetch their configuration from here. |
| **2**      | `eureka-server` | **Service Registry.** Handles service discovery.                               |
| **3**      | `auth`          | Authentication and authorization service.                                      |
| **4**      | `patient`       | Patient-specific APIs.                                                         |
| **5**      | `doctor`        | Doctor-specific APIs.                                                          |
| **6**      | `appointment`   | Appointment-specific APIs (Implements SAGA pattern).                           |
| **7**      | `payment`       | Payment-specific APIs.                                                         |
| **8**      | `notification`  | Notification-specific APIs.                                                    |
| **9**      | `feedback`      | Feedback-specific APIs.                                                        |
| **10**     | `admin`         | Admin-specific APIs.                                                           |
| **11**     | `api-gateway`   | **Must be run last.** Routes external incoming traffic to the services.        |

Here is the polished and formatted continuation for Steps 4 and 5 of your documentation. I have aligned the style, tone,
and formatting with the previous steps for a seamless, professional README.

### Step 4: Run the Frontend

Once the backend infrastructure and microservices are up and running, you can boot up the frontend application.

Navigate to the frontend directory (`web`) from the root of the project and execute the following commands:

```shell
# Navigate to the frontend directory
cd web

# Install dependencies
npm install

# Start the development server
npm run dev

```

### Step 5: Verify the Deployment

Open your browser and visit the following URLs to verify that all components are running correctly:

| Component / Service | Target URL                                                                                                     | Verification Criteria                                                                                   |
|---------------------|----------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| **Config Server**   | [http://localhost:8888/actuator/health](https://www.google.com/search?q=http://localhost:8888/actuator/health) | Should return a status of `{"status":"UP"}`.                                                            |
| **Config Profiles** | [http://localhost:8888/auth/dev](https://www.google.com/search?q=http://localhost:8888/auth/dev)               | Verifies that the specific service configurations (e.g., `auth` in `dev` profile) are loading properly. |
| **Eureka Server**   | [http://localhost:8761/](https://www.google.com/search?q=http://localhost:8761/)                               | The dashboard should display all microservices registered with their status as **UP**.                  |
| **Swagger UI**      | `http://localhost:{port}/swagger-ui/index.html`                                                                | Replace `{port}` with the specific service's port to view its interactive API documentation.            |
| **Frontend App**    | [http://localhost:5173/](https://www.google.com/search?q=http://localhost:5173/)                               | Displays the user interface of the running frontend application.                                        |
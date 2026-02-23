
## looply_server architecture (microservices architecture)


## folder structure of auth_service
- controllers: contains all the controllers of the auth service bussiness logic
- libs: contains all the libs of the auth service third party libs
- middlewares: contains all the middlewares of the auth service
- routes: contains all the routes of the auth service end points 
- utils: contains all the utils of the auth service utility functions
- prisma : contains schema file for database

# services 
- auth service
- notification service
- upload service
- api gateway

## how to setup project locally

1. clone the repository 
    cd auth_service
    npx prisma generate 

    npm install in all services

2. install docker and docker compose

3. run docker compose up --build




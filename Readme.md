
## looply_server architecture (microservices architecture)


# folder structure of looply_server
.

├── api_gateway
│   └── src
└── auth_service
    ├── dist
    ├── prisma
    └── src
        ├── controllers
        ├── libs
        ├── middlewares
        ├── routes
        └── utils




## folder structure of api_gateway
- src: containes main.ts and it have express server with proxy middleware that redirect to different services 


## folder structure of auth_service
- controllers: contains all the controllers of the auth service bussiness logic
- libs: contains all the libs of the auth service third party libs
- middlewares: contains all the middlewares of the auth service
- routes: contains all the routes of the auth service end points 
- utils: contains all the utils of the auth service utility functions
- prisma : contains schema file for database



## folder structure of docker-compose.yaml 
- services : contains all the services of the auth service
- postgres : postgres database



## how to setup project locally

1. clone the repository

2. install docker and docker compose

3. run docker compose up --build




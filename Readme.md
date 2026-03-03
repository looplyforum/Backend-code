
## looply_server architecture (microservices architecture)

api gateway
|- auth service
|- posts service
|- notification service


### user requests -> api gateway -> auth service -> database
### user request -> api gateway -> posts service -> database

### notification service only handles email for now 



### swagger api documentation


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
- api gateway
- posts service

## how to setup project locally

1. clone the repository 

2. install docker and docker compose

3. run docker compose up --build


## TODOS:
- otp verification for login
- chat room for applicants 
- project limit to users
- fetch posts based on user profile
- auto block user who are spanning -> on what basis?
- 



// Each idea needs to have restrictions 
// 1: Only people who are a part of the idea should be allowed to view the details -> this is fetching the post based on user profile

// 2: How would someone be a part of the idea? 

// 2.1: Anyone who has been approved by the idea owner as the person who they feel is right fit for the idea 
// 2.2 How would the owner select anyone? 
// 2.2.1: The idea owner must be able to submit the idea card amd the following information 
// A: Idea name 
// B: Short description 
// C: What skillsets are needed ( this would be the way the idea would be available to people on their feed  based on their selected interests) 
// D: Number of people needed - (Drop down between between 1- 10 and then 10+ as the next option) 
// E:  Once anyone clicks on the idea - they need to be presented with a screen that has the description of the idea and the option for them to express an interest to join the idea 
// F: When the express interest is clicked - Form needs to open up with these set of questions and a character box with a char limit of not exceeding 200 words per question (Questions can be customizable by the idea owner , however there need to be 5 default questions 

// a: What impressed you to join the idea
// b: Explain what you can bring on table as a contribution for the idea 
// c: What are you looking to learn from this idea 
// d: How much time you can dedicate on a weekly basis to the idea? 
// e: Would you be willing to work on this idea for a long term if the idea owner decides to build from the idea to a product or a service? 

// G: Provide a submit form button 
// H: Thank you note - for expressing the interest 
// I: Notification to the idea owner on the expression of interest & a nitrification to the Participating enthusiast on the confirmation of the outcome -> TODO
// J: Idea interest owner view 

// a: Be able to see the profile of the person expressing their interest 
// b: ask more questions if need be( if there were no questions asked at the first time) 
// c: ability to see the people needed for the idea (resource availability and resource needed) 
// d: Seek mentorship 
// e: Invite mentors




user login
user create post 
after uploading the post it will to everyone with same field of interests limit 10 intersets
auto block user who are spanning 


week 2 and 3 :
- otp verification for login
- openapi setup
- notification service 
- chat room for applicants
- integration testing
- 
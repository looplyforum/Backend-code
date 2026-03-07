## Chat Service

### Requirements 

- private group chat
- public group chat
- one-on-one chat -> TODO:future work

- select multiple members from the applicants to create a public group chat for the post then select few people from them for private group chat for the post 

- group will be created by post author when he approves any application for his post.then other applicant will join the previous created group 
- group will name will be the same as the post slug
- group will be deleted when the post is deleted
- post author can kick any member from the group
- post author can promote any member to mentor of the group, limit 5 mentors per group

- if teamsize > 10 create a public group only 
- member limit <= 5 only for private group chat 

### Tech Stack
- socket.io
- redis



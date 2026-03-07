## looply_server architecture (microservices architecture)

api gateway
|- auth service
|- posts service
|- notification service
|- chat service

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
- user login
- user create post
- after uploading the post it will to everyone with same field of interests limit 10 intersets
- auto block user who are spanning

week 2 and 3 :

- otp verification for login
- openapi setup -> done
- notification service -> done
- chat room for applicants
- integration testing
- notification email after logged out in 24 hours

# Week 3 Requirements

## 1. Notification Mechanism

### Triggered Notifications

1. **Login Notification (Debatable)**
   - OTP verification during login.

2. **Feed Posted in Field of Interest (Optional)**
   - Trigger when a post is created in a user’s field of interest.
   - Can be fetched from the database.

3. **Post/Idea Liked (Optional)**
   - In-app notification when someone likes an idea or post.

4. **Similar or Related Idea Posted (Optional)**
   - Notify users if a related idea is posted in the same field of interest.
   - TODO.

5. **Comments on Idea Feed (Mandatory)**
   - Notification when someone comments on an idea.

6. **Other Optional Notifications**
   - To be defined.

### Mentor Notifications

1. Define which notifications should go to mentors.
2. **Mentor Login / Availability Notification**
   - Mentors should be able to provide available time slots.
   - Mentees can connect during those slots.
   - Group discussion support.

3. Additional mentor-related notifications (TBD).

---

## 2. Messaging Setup

1. **Sending Messages**
2. **Collaboration Messaging**
   - Group messaging.
   - Public groups.
   - Private groups.

3. **Private Messaging**
   - With connections.
   - Limited messaging without connections.

4. **Spam/Ad Filtering**
   - Message filtering system.
   - TODO.

---

## 3. Usage Analytics (TODO)

1. **Post Performance**
   - Split by:
     - People interested in the topic.
     - People studying the subject.

2. **Post Reach**
3. **Profile Views**

---

# Open Feature Questions

1. Should we create a **friend system**?
2. Should we add **collaboration with mentors** as a feature?

---

# Idea Collaboration Workflow

## Express Interest Flow

### Case 1: Fewer People Than Required

- Student clicks **Express Interest**.
- Questions pop up.
- Student submits answers.
- Idea owner gets notified.

### Case 2: More People Than Required

- Express Interest opens **chat window with idea owner** after answering questions.
- If applications exceed requirements:
  - Create a **group for public discussion**.

---

## Drop-off Handling

- If a student leaves the idea:
  - Idea owner can choose replacements from a **dynamic list of applicants**.

---

# Idea Owner Controls

1. **Pitch Idea**
   - Short description.
   - List of screening questions.

2. **Applicant Management**
   - Accept or reject applicants.

3. **Communication**
   - Selected users enter a **public discussion/chat room**.

---

# Mentor Integration

## Mentor Selection

- Idea owner can select mentors or invite mentors with email it can be external user.

- Private focused chat group created for:
  - Mentor
  - Selected participants.

- Public forum members can be selected and moved to private group.

## Group Control

- Idea owner can:
  - Move people from public → private forum.
  - Remove participants.

- If **no mentor is associated**:
  - All discussions happen in the **public forum**.

- Idea owner decides whether **mentor involvement is required**.

---

# Mentor Rules & Constraints

1. **Mentor Limit per Idea**
   - Minimum: 1 mentor
   - Maximum: 5 mentors

2. **Mentor Group Visibility**
   - Mentors participate **only in the private/focused chat group**.
   - Mentors are removed from public discussion groups.

3. **Mentor Access**
   - Mentors can view:
     - Idea description
     - Idea details
     - Focused/private chat group

4. **Mentor Project Limit**
   - A mentor can be part of multiple ideas.
   - Maximum **5 ideas simultaneously**.

5. **Mentor Removal**
   - Idea owner can remove mentor at any time.

---

# Idea Lifecycle Management

1. Idea owner can **delete an idea** if:
   - There are **no responses for 10 days**.

2. System flow:
   - Wait 10 days.
   - Automatically delete inactive idea.

---

# Future Improvements / TODO

- Spam detection for messaging.
- Post recommendation system for similar ideas.
- Detailed analytics dashboard.
- Mentor notification design.

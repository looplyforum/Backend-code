## Event Driven Notification Service

- bullmq
- redis
### types of notifications

 - email -> login registeration password reset 
 - in app -> post notification, comment notification, like notification, application status change notification, message notification
 - sms -> TODO : future work

### events
- new post -> imp
- new comment
- new like
- new applicant -> imp
- application status change -> imp
- new message

### emails
- register 
- login
- password reset
- user is not logged in for a long time to encourage them to come back -> TODO : future work
- user schema field add for loggedin if not logged in for 30 days send email -> TODO : future work


### mind map for notifiiocation service design

- notification-queue
- inapp-queue
- email-queue



- inapp worker
- post upload notification based on fieldOfInterest pub/sub mechanism
    user created a post with -> fieldOfinterest = ["web development", "mobile development", "data science"]
    after creating post push it to inapp-queue with event name "new-post" and data { postId, fieldOfInterest }
    publish post to all users who have any fieldOfInterest matching with post's fieldOfInterest

- application submission notification to post owner
    applicant applied to a post -> push it to inapp-queue with event name "new-applicant" and data { postId, applicantId }
    publish notification to post owner

- application status change notification to applicant
    post owner changed application status -> push it to inapp-queue with event name "application-status-change" and data { postId, applicantId, newStatus }
    publish notification to applicant

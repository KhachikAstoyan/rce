### Problems
[x] GET       /problems                        List all problems
[x] POST      /problems                        Create a new problem
[x] GET       /problems/:id                    Get a specific problem
[x] GET       /problems/:id/tests              Get tests for a specific problem
[x] PUT       /problems/:id                    Update a specific problem
[x] DELETE    /problems/:id                    Delete a specific problem
[x] GET       /problems/:id/submissions        List all submissions for a problem

### Submissions
[x] GET       /submissions/:id                 Get a specific submission
[x] DELETE    /submissions/:id                 Delete a specific submission (if needed)

### Users
[ ] GET       /users/:id/solved-problems       Get problems solved by user (Maybe?)
[ ] GET       /users/:id/stats                 Get user's overall statistics
[ ] GET       /users/:id/problems              Get problems created by user (if applicable)
[ ] GET       /users/:id/submissions           Get all submissions by user

### Auth
[x] GET       /auth/google                     Redirect to consent screen
[x] GET       /auth/google/callback            Handle google oauth
[x] POST      /auth/logout
[x] POST      /auth/refresh                    Refresh authentication token

### Permissions
[x] GET       /auth/permissions
[x] POST      /auth/permissions
[x] PUT       /auth/permissions/:id
[x] DELETE    /auth/permissions/:id

[ ] Add not nullable constraints to some of the fields
[x] Add permissions for all routes
[x] Add pagination
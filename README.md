## .ENV Example

MONGO_URI=mongodb+srv://localhost:5000
NEXTAUTH_SECRET=testdu4ev
FRONTEND_URL=http://localhost:8888
PORT=3000

### PASS test/users.e2e-spec.ts (9.268 s)

UsersController (e2e)
✓ POST /users - should create a user (auth required) (63 ms)
✓ POST /users - should fail without token (8 ms)
✓ GET /users - should return all users (auth required) (43 ms)
✓ GET /users/:id - should return one user (12 ms)
✓ PATCH /users/:id - should update user (18 ms)
✓ DELETE /users/:id - should remove user (20 ms)

Test Suites: 1 passed, 1 total
Tests: 6 passed, 6 total
Snapshots: 0 total
Time: 9.737 s, estimated 12 s

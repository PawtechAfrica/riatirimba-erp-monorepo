# 🔐 Auth Service - RIATIRIMBA ERP

This service handles **authentication**, **authorization**, and **JWT token issuance** using RS256 (public/private key pair). It allows for role-based and permission-based access control, and is designed to integrate with a microservices architecture.

---

## 🌍 Base URL
http://api.riatirimbatvc.ac.ke/auth/

---

## 📌 Endpoints Summary

| Method | Endpoint            | Description                     | Auth Required |
|--------|---------------------|----------------------------------|---------------|
| POST   | `/auth/login`            | Login user, return JWT tokens    | ❌ No         |
| POST   | `/auth/refresh`          | Refresh access token             | ❌ No         |
| POST   | `/auth/register`         | Create a new user + permissions  | ❌ No         |


---

## 🔐 Login - `POST /auth/login`

Login a user and receive access and refresh tokens.

### Request
```json
{
  "email": "admin@riatirimba.com",
  "password": "admin123"
}


### Response

{
  "access_token": "<JWT_ACCESS_TOKEN>",
  "refresh_token": "<JWT_REFRESH_TOKEN>",
  "user": {
    "name": "Admin",
    "role": "admin",
    "permissions": ["view_users", "edit_users"]
  }
}


Payload in req.user after auth 

{
  sub: 1,
  email: '  john@example.com',
  role: 'registrar',
  permissions: [ 'view_users', 'edit_users', 'view_roles' ],
  iat: 1753995647,
  exp: 1753996547
}


## 🔐 Logout - `GET /auth/logout`



📋 Middleware Usage: verifyJWT(requiredPermission)
In code:

const { verifyJWT } = require('../middlewares/auth.middleware');

// Protect route, check for a specific permission
app.get('/admin-panel', verifyJWT('view_users'), (req, res) => {
  res.send('Access granted to admin panel');
});


👥 USERS - /api/users
🔹 Create New User
POST /api/users

Create a new user with optional permissions.

Request
    {
  "username": "john",
  "email": "john@example.com",
  "password": "john1234",
  "permissionIds": [1, 2, 4]
}

Response
{
  "id": 3,
  "username": "john",
  "email": "john@example.com",
  "permissions": [
    { "id": 1, "name": "view_users" },
    { "id": 2, "name": "edit_users" }
  ]
}

PATCH /api/users/:id

Request
    {
  "username": "john",
  "email": "john@example.com",
}





🧾 PERMISSIONS - /api/permissions
🔹 Get All Permissions
GET /api/permissions

Returns a list of all permissions.

Response

[
  { "id": 1, "name": "view_users", "description": "Can view user list" },
  { "id": 2, "name": "edit_users", "description": "Can edit users" }
]



🔹 Get Single Permission
GET /api/permissions/:id

Returns one permission.

Example
GET /api/permissions/1

Response


{
  "id": 1,
  "name": "view_users",
  "description": "Can view user list"
}



🔹 Create New Permission
POST /api/permissions

Request

{
  "name": "manage_courses",
  "description": "Can manage course data"
}



Response

{
  "id": 5,
  "name": "manage_courses",
  "description": "Can manage course data"
}


.

🔹 Update Permission
PUT /api/permissions/:id

Update name and/or description.

Request
{
  "name": "edit_courses",
  "description": "Can update course info"
}

Response

{
  "id": 5,
  "name": "edit_courses",
  "description": "Can update course info"
}

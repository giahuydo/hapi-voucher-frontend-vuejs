# API Setup Guide

## Yêu cầu
- Hapi Voucher API server phải chạy trên port 3000
- API endpoints cần có sẵn:

## Required API Endpoints

### 1. POST /api/auth/login
```json
Request:
{
  "email": "admin@example.com",
  "password": "password"
}

Response:
{
  "user": {
    "id": "1",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  },
  "token": "jwt-token-here"
}
```

### 2. POST /api/auth/logout
```json
Request: (với Authorization header)
Headers: {
  "Authorization": "Bearer jwt-token-here"
}

Response: 200 OK
```

### 3. GET /api/auth/me
```json
Request: (với Authorization header)
Headers: {
  "Authorization": "Bearer jwt-token-here"
}

Response:
{
  "id": "1",
  "email": "admin@example.com",
  "name": "Admin User",
  "role": "admin"
}
```

### 4. POST /api/auth/refresh
```json
Request:
{
  "refreshToken": "refresh-token-here"
}

Response:
{
  "token": "new-jwt-token-here"
}
```

## Cách test API

1. Start API server:
```bash
# Trong thư mục API project
npm start
# hoặc
node server.js
```

2. Test login endpoint:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

3. Start frontend:
```bash
# Trong thư mục frontend project
npm run dev
```

## Environment Variables

Đảm bảo file `.env` có:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Hapi Voucher
VITE_APP_VERSION=1.0.0
VITE_DEBUG=true
```

## Troubleshooting

- Nếu gặp lỗi CORS, thêm CORS middleware vào API server
- Nếu gặp lỗi 404, kiểm tra API routes
- Nếu gặp lỗi 401, kiểm tra JWT token validation

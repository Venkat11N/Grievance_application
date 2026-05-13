# Grievance Notification System

A comprehensive grievance management and notification system for seafarers and officials, featuring real-time push notifications, OTP-based authentication, and role-based access control.

## Features

### Core Functionality
- **OTP-Based Authentication**: Secure login/registration using email OTP
- **Role-Based Access**: Separate interfaces for seafarers and officials
- **Real-Time Notifications**: Push notifications via Expo for grievance updates
- **Notification Management**: View, mark as read, and track unread notifications
- **Auto-Refresh**: Notification list updates automatically when new notifications arrive

### Security Features
- **Email Masking**: Sensitive user data masked in logs
- **Secure Storage**: Token storage using expo-secure-store on mobile
- **Web Protection**: Blocks localStorage token storage on web (XSS protection)
- **API Validation**: Proper ObjectId validation and error handling
- **Non-Fatal Push Registration**: Push token failures don't block login

### Accessibility
- **Screen Reader Support**: Accessibility labels and hints for notification icons
- **Role Validation**: Explicit role checking to prevent mislabeling
- **Platform Optimization**: Web-specific optimizations for push notifications

## Project Structure

```
Grievance_application/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts      # OTP generation, verification, login
│   │   │   └── notification.controller.ts # Notification management, push sending
│   │   ├── models/
│   │   │   ├── User.ts                 # User schema
│   │   │   ├── Notification.ts         # Notification schema
│   │   │   ├── PushToken.ts            # Push token storage
│   │   │   └── UserNotificationSeed.ts # Sample notification seeding
│   │   ├── routes/
│   │   │   ├── auth.routes.ts          # Authentication endpoints
│   │   │   └── notification.routes.ts  # Notification endpoints
│   │   ├── services/
│   │   │   ├── email.ts                # Nodemailer OTP email sending
│   │   │   ├── otp.ts                  # OTP generation and verification
│   │   │   └── push.ts                 # Expo push notification sending
│   │   └── middlewares/
│   │       └── auth.ts                 # JWT authentication middleware
│   └── .env                           # Environment variables (not in git)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── NotificationIcon.tsx    # Notification bell with badge
    │   ├── hooks/
    │   │   ├── usePushToken.ts        # Push token registration
    │   │   └── useNotificationListener.ts # Real-time notification handling
    │   ├── screens/
    │   │   ├── LoginScreen.tsx        # Login with OTP
    │   │   ├── RegisterScreen.tsx     # Registration with OTP
    │   │   ├── NotificationsScreen.tsx # Notification list
    │   │   └── NotificationDetailScreen.tsx # Notification details
    │   ├── services/
    │   │   ├── api.ts                 # Axios configuration
    │   │   ├── auth.ts                # Authentication API calls
    │   │   ├── notification.ts        # Notification API calls
    │   │   └── storage.ts             # Secure storage abstraction
    │   └── styles/
    │       ├── LoginScreen.styles.ts
    │       ├── RegisterScreen.styles.ts
    │       ├── NotificationsScreen.styles.ts
    │       └── NotificationDetailScreen.styles.ts
    ├── app.json                       # Expo configuration
    └── eas.json                       # EAS build configuration
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Expo CLI
- Expo account (for push notifications)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/grievance-db
   JWT_SECRET=your_jwt_secret_change_me
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASS=your_app_password
   ENABLE_EMAIL_DELIVERY=true
   FEATURE_FLAG_SAMPLE_NOTIFICATIONS=false
   ALLOW_INSECURE_SMTP_TLS=false
   ENABLE_MAGIC_OTP=false
   EXPO_ACCESS_TOKEN=your_expo_access_token
   ```

4. **Start the backend server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint**
   Update the API base URL in `frontend/src/services/api.ts` if needed:
   ```typescript
   const API_BASE_URL = 'http://localhost:5000/api';
   ```

4. **Start the Expo development server**
   ```bash
   npx expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code for Expo Go app

## Environment Variables

### Backend (.env)
- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation
- `EMAIL_USER`: Email address for OTP sending
- `EMAIL_PASS`: Email app password (not regular password)
- `ENABLE_EMAIL_DELIVERY`: Enable/disable email sending
- `FEATURE_FLAG_SAMPLE_NOTIFICATIONS`: Enable sample notifications for testing
- `ALLOW_INSECURE_SMTP_TLS`: Disable TLS verification (testing only)
- `ENABLE_MAGIC_OTP`: Enable magic OTP "123456" for development
- `EXPO_ACCESS_TOKEN`: Expo access token for push notifications

### Frontend
- API base URL configured in `src/services/api.ts`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/request-otp` - Request OTP for login
- `POST /api/auth/verify-otp` - Verify OTP and complete registration
- `POST /api/auth/login` - Login with OTP
- `GET /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/push-token` - Register push token

### Notifications
- `POST /api/notifications/send` - Send notification (external system)
- `GET /api/notifications/my` - Get user's notifications
- `PATCH /api/notifications/:notificationId/read` - Mark notification as read

## Usage

### Registration
1. Open the app
2. Navigate to registration screen
3. Enter name, email, mobile (optional), and role (seafarer/official)
4. Request OTP
5. Enter OTP received via email
6. Complete registration

### Login
1. Open the app
2. Enter email
3. Request OTP
4. Enter OTP received via email
5. Login to notifications screen

### Notifications
- **View Notifications**: Tap bell icon to see notification list
- **Mark as Read**: Open notification to mark as read
- **Unread Badge**: Bell icon shows unread count
- **Real-Time Updates**: List refreshes automatically when new notifications arrive

### Test Notifications
- After login, a test notification arrives after 5 seconds
- Different messages for seafarers vs officials
- Demonstrates push notification functionality

## Push Notifications

### Setup
1. Get Expo access token from [expo.dev](https://expo.dev)
2. Add to backend `.env` file
3. Push token automatically registered after login/registration

### Behavior
- Notifications appear on device when app is in background
- Alert shown when app is in foreground
- Tapping notification opens specific notification detail
- Fallback to notification list if notificationId missing

## Security Considerations

### Implemented Security Measures
- **Email Masking**: User identifiers masked in console logs
- **Secure Storage**: Tokens stored using expo-secure-store on mobile
- **Web Protection**: localStorage blocked for auth tokens on web
- **API Validation**: ObjectId validation prevents injection attacks
- **Error Handling**: Proper HTTP status codes and error messages
- **Lease-Based Locking**: Seeding locks expire to prevent permanent locks

### Recommendations
- Use httpOnly cookies for web authentication
- Enable email delivery in production
- Disable magic OTP in production
- Use strong JWT secret in production
- Implement rate limiting for OTP requests
- Add CAPTCHA for registration

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend (EAS)
cd frontend
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### Email Not Sending
- Check SMTP credentials in `.env`
- Verify app password (not regular password) for Gmail
- Check firewall/antivirus blocking Node.js SMTP
- Check backend console for error logs

### Push Notifications Not Working
- Verify `EXPO_ACCESS_TOKEN` in backend `.env`
- Check device has push notification permissions
- Verify push token registered successfully
- Check backend console for push errors

### Login Issues
- Verify OTP is correct (check backend console)
- Check if magic OTP is enabled for development
- Verify JWT secret matches between requests
- Check network connectivity to backend

### Web Issues
- Tokens not stored on web (security feature)
- Push notifications not available on web
- Use mobile for full functionality

## License

This project is open source and available for use and modification.

## Support

For issues and questions, please contact the development team.

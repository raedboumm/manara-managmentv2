# Al Manar Backend API

This is the backend API server for the Al Manar Management System.

## Tech Stack
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (Atlas for online hosting)
- **Mongoose** - ODM (Object Data Modeling)
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Project Structure

```
backend/
├── models/           # Database schemas
│   ├── User.js
│   ├── Group.js
│   ├── Passenger.js
│   ├── Flight.js
│   ├── Hotel.js
│   ├── Operation.js
│   └── Activity.js
├── routes/           # API routes
│   ├── auth.js       # Authentication endpoints
│   ├── users.js      # User management
│   ├── groups.js     # Group management
│   ├── passengers.js # Passenger management
│   ├── flights.js    # Flight management
│   ├── hotels.js     # Hotel management
│   ├── operations.js # Operation management
│   └── activities.js # Activity management
├── middleware/       # Express middleware
│   └── auth.js       # JWT verification
├── server.js         # Main server file
├── package.json      # Dependencies
├── .env.example      # Environment variables template
└── .env              # Environment variables (create this)
```

## Installation

1. **Install dependencies**
```bash
npm install
```

2. **Create `.env` file**
Copy `.env.example` to `.env` and update with your credentials:
```bash
cp .env.example .env
```

3. **Update environment variables**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/manar_db?retryWrites=true&w=majority
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
```

## Running the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 5000).

## API Usage

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Request Headers
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token>"
}
```

### Response Format
All responses follow this format:
```json
{
  "data": { ... },
  "message": "Success message",
  "status": "success"
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": { ... }
}
```

## Database Models

### User
- `name` - User full name
- `email` - Unique email address
- `password` - Hashed password
- `role` - User role (Super Admin, Group Leader, Operational Staff)
- `phone` - Contact number
- `active` - Account status
- `createdAt`, `updatedAt` - Timestamps

### Group
- `name` - Group name
- `description` - Group details
- `leader` - Reference to User
- `totalPassengers` - Number of passengers
- `budget` - Group budget
- `startDate`, `endDate` - Trip dates
- `status` - Planning, Active, Completed, Cancelled

### Passenger
- `firstName`, `lastName` - Passenger name
- `email`, `phone` - Contact info
- `passport` - Passport number
- `nationality` - Nationality
- `dateOfBirth` - Birth date
- `group` - Reference to Group
- `photo` - Photo URL
- `status` - Registration status

### Flight
- `flightNumber` - Unique flight number
- `airline` - Airline name
- `departureCity`, `arrivalCity` - Route
- `departureTime`, `arrivalTime` - Times
- `group` - Reference to Group
- `passengers` - Array of Passenger references
- `status` - Scheduled, Boarded, Departed, Arrived, Cancelled

### Hotel
- `name` - Hotel name
- `city` - Location
- `address`, `phone`, `email` - Contact info
- `totalRooms`, `availableRooms` - Room info
- `pricePerNight` - Rate
- `checkInDate`, `checkOutDate` - Dates
- `group` - Reference to Group
- `status` - Available, Reserved, Occupied, Maintenance

### Operation
- `name` - Operation name
- `description` - Details
- `hotel` - Reference to Hotel
- `group` - Reference to Group
- `startDate`, `endDate` - Operation dates
- `status` - Planned, In Progress, Completed, Cancelled
- `budget`, `actualCost` - Financial data

### Activity
- `name` - Activity name
- `description` - Details
- `location` - Location
- `group` - Reference to Group
- `date`, `startTime`, `endTime` - Timing
- `participants` - Array of Passenger references
- `status` - Planned, In Progress, Completed, Cancelled
- `budget` - Activity budget

## Authentication Flow

1. **Register**
   - POST `/api/auth/register`
   - Body: `{ name, email, password, role }`
   - Returns: `{ token, user }`

2. **Login**
   - POST `/api/auth/login`
   - Body: `{ email, password }`
   - Returns: `{ token, user }`

3. **Use Token**
   - Include `Authorization: Bearer <token>` in headers for protected routes

4. **Token Expiration**
   - Default: 7 days
   - After expiration, user must login again

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `500` - Server error

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ CORS protection
- ✅ Request validation
- ✅ MongoDB connection security
- ✅ Error handling without exposing internals

## MongoDB Atlas Tips

1. **Connection String Format**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
   ```

2. **Important Settings**
   - IP Whitelist: Add your IP or allow 0.0.0.0/0 for development
   - Database User: Create specific user for your app
   - Connection Options: Always use retryWrites=true

3. **Monitoring**
   - Check "Monitoring" tab in Atlas dashboard
   - View database metrics and logs
   - Check query performance

## Deployment

### Prepare for Deployment
1. Remove console.logs from production code
2. Set `NODE_ENV=production`
3. Use strong JWT_SECRET
4. Configure proper CORS origins
5. Set up environment variables

### Deploy to Render
1. Push code to GitHub
2. Create Render account and connect GitHub
3. Create new Web Service
4. Set environment variables
5. Deploy

### Deploy to Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI="your_connection_string"
heroku config:set JWT_SECRET="your_secret"

# Deploy
git push heroku main
```

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string in .env
- Check IP whitelist in MongoDB Atlas
- Ensure username/password are correct
- Try connecting with MongoDB Compass

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### CORS Errors
- Check FRONTEND_URL in .env
- Ensure it matches your frontend URL
- For development, use http://localhost:3000

## Development Tips

1. **Use Postman/Insomnia** for testing API endpoints
2. **Enable request logging** to debug issues
3. **Use MongoDB Compass** for database exploration
4. **Test with sample data** before production

## Next Steps

1. Run the setup guide at the project root
2. Create test users and data
3. Integrate with frontend
4. Test all endpoints
5. Deploy to production

---

**Ready to use!** The backend API is now ready to handle requests from the React frontend.

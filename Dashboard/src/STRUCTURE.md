# Dashboard Folder Structure

This document describes the organized structure of the Dashboard application.

## Folder Organization

```
src/
├── components/          # Reusable UI components
│   ├── Layout.jsx      # Main layout wrapper
│   └── Login.jsx       # Login page component
│
├── pages/              # Page-level components (routes)
│   ├── Students.jsx
│   ├── StudentDetails.jsx
│   ├── Rooms.jsx
│   ├── RoomDetails.jsx
│   ├── Hospitals.jsx
│   ├── HospitalDetails.jsx
│   ├── Builds.jsx
│   ├── BuildingDetails.jsx
│   ├── Staff.jsx
│   ├── StaffDetails.jsx
│   ├── AddStaff.jsx
│   ├── Shifts.jsx
│   ├── ShiftDetails.jsx
│   └── Leaves.jsx
│
├── services/           # API service layer
│   └── api.js          # Centralized API calls
│
├── constants/          # Constants and configuration
│   └── api.js          # API endpoints configuration
│
├── utils/              # Utility functions (for future use)
│
├── assets/             # Static assets
│   └── react.svg
│
├── App.jsx             # Main app component with routing
├── App.css             # App styles
├── index.css           # Global styles
└── main.jsx            # Entry point
```

## Usage

### API Services

Instead of using axios directly, use the centralized API services:

```javascript
import { userService, roomService, hospitalService } from '../services/api';

// Example usage
const users = await userService.getAll();
const room = await roomService.getById(roomId);
```

### Constants

Use API endpoints from constants:

```javascript
import { API_ENDPOINTS } from '../constants/api';

// Access endpoints
const usersEndpoint = API_ENDPOINTS.USERS;
const userById = API_ENDPOINTS.USER_BY_ID(userId);
```

## Benefits

1. **Better Organization**: Clear separation of concerns
2. **Easier Maintenance**: Related files are grouped together
3. **Centralized API**: All API calls in one place for easier updates
4. **Reusability**: Components and services can be easily reused
5. **Scalability**: Easy to add new features without cluttering

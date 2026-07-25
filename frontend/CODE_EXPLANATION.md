# Frontend Code Explanation

This document explains the flow and structure of the `frontend` React application.

## 1. Application Entry Point
- **`main.tsx`**: Bootstraps the React application and attaches it to the DOM.
- **`App.tsx`**: The root component. Handles top-level routing (login, dashboard, meeting).

## 2. Global State Management (Zustand)
- **`useAuthStore.ts`**: Manages the user's authentication state. 
  - Tracks the JWT token and the currently logged-in user's profile.
  - Contains actions for `login`, `register`, and `logout`, which make API calls via `apiClient.ts` to the `auth-service`.
- **`useMeetingStore.ts`**: Manages meeting state and LiveKit integration.
  - Tracks the current meeting details (title, join code, host).
  - Fetches and stores the LiveKit token securely from the `meeting-service`.

## 3. UI Components and Views
- **`LoginScreen.tsx` / `RegistrationScreen.tsx`**: The authentication UI. These components render the forms, validate user input, and call the actions in `useAuthStore` to authenticate the user.
- **`DashboardScreen.tsx`**: The main post-login screen. 
  - Allows users to see their upcoming meetings.
  - Users can initiate a meeting or enter a join code.
- **`MeetingViews.tsx`**: Handles the pre-call "waiting room" states.
  - Differentiates between the Host (can admit users or start the meeting directly) and Guests (waiting for the host to admit them).
- **`LiveMeetingView.tsx`**: The core WebRTC real-time room (powered by LiveKit components).
  - Uses `<LiveKitRoom>` to connect to the LiveKit server using the token stored in `useMeetingStore`.
  - Renders `<VideoConference>` to seamlessly display the camera grid, chat, and audio channels.

## 4. API Client & Utilities
- **`apiClient.ts`**: An Axios instance configured to talk to the backend microservices.
  - Automatically attaches the stored JWT token to the `Authorization: Bearer` header for every outgoing request.
  - Ensures seamless, secure communication with `auth-service`, `user-service`, and `meeting-service`.

## Summary of the User Flow
1. A user visits the app, sees `LoginScreen`, enters their email/password.
2. `useAuthStore.login()` makes a request via `apiClient` to the `auth-service`.
3. The backend returns a JWT, which the store saves. `App.tsx` re-renders and routes the user to `DashboardScreen`.
4. The user enters a meeting join code in the dashboard.
5. `useMeetingStore` fetches a LiveKit token from the `meeting-service`.
6. Once a token is obtained, the UI transitions to `LiveMeetingView`, passing the token into the LiveKit React SDK to establish the real-time video connection.

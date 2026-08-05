# Frontend Application Architecture

This is the main React application for Vaarta, built with Vite, TypeScript, and Tailwind CSS. It serves as the single unified UI that communicates with all the microservices.

## Key Technologies
- **React 18** with Functional Components & Hooks
- **Vite** for blazing fast build and HMR
- **Zustand** for state management
- **React Router** for declarative navigation
- **Tailwind CSS** for atomic, utility-first styling
- **Axios** for API requests

## Folder Structure & File Explanations

### `/src/app/`
Contains the core application logic and components.

- **`App.tsx`**: The main entry point. Sets up React Router and global providers. Contains the primary routes (`/login`, `/register`, `/verify`, `/reset-password`, `/dashboard`, `/join/:joinCode`, etc.). It coordinates with `useAuthStore` to protect authenticated routes (like dashboard) and redirect unauthenticated users.
- **`apiClient.ts`**: Configures Axios instances. It establishes interceptors to automatically attach the JWT Bearer token to outgoing requests to the backend microservices.

### `/src/app/store/`
Global state management using Zustand.

- **`useAuthStore.ts`**: Manages user authentication state (JWT token, user profile, login status). Handles API calls to `auth-service` for login, registration, verification, and logout. Persists the JWT in `localStorage`.
- **`useMeetingStore.ts`**: Manages state related to meetings. Handles API calls to `meeting-service` to fetch a user's meetings, create a new meeting (instant or scheduled), and invite participants.

### `/src/app/components/`
Contains UI components, categorized by feature.

#### `/auth/`
Components for authentication workflows.
- **`AuthScreen.tsx`**: The Login screen. Handles credentials and sets global auth state on success.
- **`RegisterScreen.tsx`**: Registration screen for new users.
- **`VerifyEmailScreen.tsx`**: Screen that handles parsing a verification token from the URL and submitting it to `auth-service`.
- **`ForgotPasswordScreen.tsx` / `ResetPasswordScreen.tsx`**: Flows for resetting a user's password.

#### `/coreapp/`
The main logged-in experience.
- **`Layout.tsx`**: The shell of the app (Sidebar + Main content area) used in the Dashboard.
- **`/components/ui/`**: Reusable generic UI components (Buttons, Inputs, Cards, Avatars).
- **`/components/views/`**: Specific views within the dashboard.
  - **`MeetingViews.tsx`**: The main meeting dashboard where users can see upcoming meetings, start an instant meeting, schedule a meeting, or join via code.
  - **`Modals.tsx`**: Contains interactive modals like `CreateMeetingModal` and `ScheduleMeetingModal` which collect meeting details and emails, calling `useMeetingStore` to persist them.
  - **`OtherViews.tsx`**: Placeholder/stub views for other features (Messages, Profile, etc).

### `/public/` & `/index.html`
Static assets and the root HTML template where the React app mounts.

## Environment Variables
- `VITE_AUTH_API_URL`: Points to `auth-service`
- `VITE_USER_API_URL`: Points to `user-service` 
- `VITE_MEETING_API_URL`: Points to `meeting-service`

## Flow of Execution

Here is how data flows through the Frontend:

1. **User Interaction**: The user clicks a button or interacts with a UI component (e.g., `src/app/components/coreapp/components/views/MeetingViews.tsx`).
2. **State Management**: The component calls a function in the Zustand store (e.g., `createMeeting` in `src/app/store/useMeetingStore.ts`).
3. **API Client**: The store uses the configured Axios client (`src/app/apiClient.ts`). The API client's interceptor automatically injects the JWT token (from `localStorage`) into the `Authorization` header.
4. **Network Request**: The API client sends an HTTP request to the corresponding microservice backend (e.g., `meeting-service`).
5. **UI Update**: The response is returned to the store, the Zustand state is updated, and React automatically re-renders the UI to reflect the changes.

## End-to-End Architecture & Code Explanation

### 1. The Core UI (`app/components/`)
This Next.js application organizes its visual layers functionally.
- **`landing/`**: The public-facing static pages (marketing, features).
- **`auth/`**: Registration, Login, and OTP Verification pages.
- **`coreapp/`**: The logged-in dashboard and meeting interface.
  - `LiveMeetingView.tsx` heavily relies on the `@livekit/components-react` library. It renders the `LiveKitRoom`, injects the JWT token, and manages the camera, microphone, screen sharing, meeting reactions (raise hand, emojis), and dynamic layouts for grids of participants.

### 2. State Management (`app/store/`)
Vaarta uses **Zustand** for lightweight, global state management, avoiding the boilerplate of Redux.
- **`useAuthStore.ts`**: Handles authentication workflows. When a user logs in, it calls the `auth-service`, stores the returned JWT in browser storage, and exposes `user` state globally to protect routes.
- **`useMeetingStore.ts`**: Manages all meeting lifecycle actions.
  - Generates meeting join codes and stores meeting configurations.
  - Facilitates the "Invite Participants" functionality by passing comma-separated emails to the `meeting-service`, rigorously catching network errors to ensure UI consistency.

### 3. Real-Time Communication
- The frontend connects directly to LiveKit Cloud via WebSockets (`wss://`) using tokens securely minted by our `meeting-service`.
- This WebRTC abstraction handles NAT traversal, media encoding, and streaming.

### 4. Build & Routing
- Uses Next.js App Router or Pages Router (depending on Next.js version configuration).
- Tailwind CSS config (`tailwind.config.ts`) provides utility-first styling for the entire component tree.
- Deployed on Vercel, allowing edge-optimized static delivery and seamless continuous deployment linked to the Git repository.

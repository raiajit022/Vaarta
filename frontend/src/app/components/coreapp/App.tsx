import { useState, useEffect, lazy, Suspense } from "react";
import { toast } from "sonner";
import { Sidebar, TopNav } from "./components/layout/Layout";
import { DashboardView } from "./components/views/DashboardView";
import { CreateMeetingModal, MeetingCreatedModal, ScheduleMeetingModal } from "./components/views/Modals";
import { JoinMeetingView, PreCallDeviceCheckView, WaitingRoomGuestView, WaitingRoomHostView } from "./components/views/MeetingViews";
const LiveMeetingView = lazy(() =>
  import("./components/views/LiveMeetingView").then((m) => ({ default: m.LiveMeetingView }))
);
import { MeetingsView, ContactsView, SettingsView } from "./components/views/OtherViews";
const AdminLayout = lazy(() =>
  import("../admin/AdminLayout").then((m) => ({ default: m.AdminLayout }))
);
const AdminUsersPage = lazy(() =>
  import("../admin/AdminUsersPage").then((m) => ({ default: m.AdminUsersPage }))
);
const AdminMeetingsPage = lazy(() =>
  import("../admin/AdminMeetingsPage").then((m) => ({ default: m.AdminMeetingsPage }))
);
import { useAuthStore } from "../../store/useAuthStore";
import { useMeetingStore } from "../../store/useMeetingStore";
import { RouteFallback } from "../../ui/RouteFallback";

/**
 * Core application container component.
 * 
 * Manages the top-level routing state (since we use a custom state-based router
 * instead of react-router for this prototype) and renders the appropriate view.
 * Also handles global modals (create meeting, schedule meeting).
 *
 * @param onSignOut Callback invoked when the user clicks the sign out button.
 */
export function CoreApp({ onSignOut }: { onSignOut?: () => void }) {
  const [currentView, setCurrentView] = useState("dashboard");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMeetingCreatedModalOpen, setIsMeetingCreatedModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const { fetchProfile } = useAuthStore();

  // --- URL-based routing ---

  // Map view names to URL paths
  const viewToPath = (view: string, meeting?: any): string => {
    switch (view) {
      case 'meetings': return '/meetings';
      case 'contacts': return '/contacts';
      case 'settings': return '/settings';
      case 'join': return '/join';
      case 'live': return meeting?.joinCode ? `/join/${meeting.joinCode}` : '/';
      case 'pre-call': return meeting?.joinCode ? `/join/${meeting.joinCode}` : '/';
      case 'admin-users': return '/admin/users';
      case 'admin-meetings': return '/admin/meetings';
      default: return '/';
    }
  };

  // On mount: read the current URL and initialize the correct view
  useEffect(() => {
    const path = window.location.pathname;

    const joinMatch = path.match(/^\/join\/([A-Z0-9-]+)$/i);
    const meetingMatch = path.match(/^\/meeting\/([A-Z0-9-]+)/i);

    if (joinMatch) {
      const joinCode = joinMatch[1];
      useMeetingStore.getState().joinMeeting(joinCode).then((meeting) => {
        setActiveMeeting(meeting);
        setCurrentView('pre-call');
      }).catch(() => {
        setCurrentView('dashboard');
        window.history.replaceState({}, '', '/');
      });
    } else if (meetingMatch) {
      const joinCode = meetingMatch[1];
      // Fetch meetings and find the one with this join code
      useMeetingStore.getState().fetchMyMeetings().then(() => {
        const meetings = useMeetingStore.getState().meetings;
        const found = meetings.find(m => m.joinCode === joinCode);
        if (found) {
          setActiveMeeting(found);
          setCurrentView('live');
        } else {
          setCurrentView('dashboard');
          window.history.replaceState({}, '', '/');
        }
      });
    } else if (path === '/meetings') {
      setCurrentView('meetings');
    } else if (path === '/contacts') {
      setCurrentView('contacts');
    } else if (path === '/settings') {
      setCurrentView('settings');
    } else if (path === '/admin/users') {
      setCurrentView('admin-users');
    } else if (path === '/admin/meetings') {
      setCurrentView('admin-meetings');
    }
    // else stays on dashboard (default)
  }, []);

  // Sync URL when currentView changes (push to history)
  useEffect(() => {
    const targetPath = viewToPath(currentView, activeMeeting);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({ view: currentView }, '', targetPath);
    }
  }, [currentView, activeMeeting]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/meetings') setCurrentView('meetings');
      else if (path === '/contacts') setCurrentView('contacts');
      else if (path === '/settings') setCurrentView('settings');
      else if (path === '/admin/users') setCurrentView('admin-users');
      else if (path === '/admin/meetings') setCurrentView('admin-meetings');
      else if (path === '/join') setCurrentView('join');
      else setCurrentView('dashboard');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    fetchProfile();

    const handleAdmitGuest = () => setCurrentView("live");
    window.addEventListener('admit-guest', handleAdmitGuest);
    return () => window.removeEventListener('admit-guest', handleAdmitGuest);
  }, [fetchProfile]);

  const handleCreateMeeting = async () => {
    try {
      const meeting = await useMeetingStore.getState().createMeeting("Instant Meeting");
      setActiveMeeting(meeting);
      // For instant meeting, bypass device check and drop directly into the call
      setCurrentView("live");
    } catch (e: any) {
      console.error("Failed to create instant meeting", e);
      toast.error(e?.response?.data?.message || "Could not start the meeting. Please try again.");
    }
  };

  const handleScheduleMeeting = () => {
    setIsScheduleModalOpen(true);
  };

  const handleMeetingCreated = (meeting: any) => {
    setActiveMeeting(meeting);
    setIsCreateModalOpen(false);
    setIsScheduleModalOpen(false);
    setIsMeetingCreatedModalOpen(true);
  };

  const handleStartMeeting = () => {
    setIsMeetingCreatedModalOpen(false);
    setCurrentView("pre-call");
  };

  const handleJoinMeeting = () => {
    setCurrentView("join");
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-canvas">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto scrollbar-fine">
              <DashboardView
                onCreateMeeting={handleCreateMeeting}
                onJoinMeeting={handleJoinMeeting}
                onScheduleMeeting={handleScheduleMeeting}
                onJoinDirectly={(meeting) => {
                  setActiveMeeting(meeting);
                  setCurrentView("pre-call");
                }}
              />
            </div>
          </div>
        );
      case "meetings":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-canvas">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto scrollbar-fine">
              <MeetingsView
                onScheduleMeeting={handleScheduleMeeting}
                onJoinDirectly={(meeting) => {
                  setActiveMeeting(meeting);
                  setCurrentView("pre-call");
                }}
              />
            </div>
          </div>
        );
      case "contacts":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-canvas">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto scrollbar-fine">
              <ContactsView />
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-canvas">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto scrollbar-fine">
              <SettingsView />
            </div>
          </div>
        );
      case "join":
        return <JoinMeetingView 
          onJoin={(meeting) => {
            setActiveMeeting(meeting);
            setCurrentView("pre-call");
          }} 
          onBack={() => setCurrentView("dashboard")}
        />;
      case "pre-call":
        // Device check step before entering the actual meeting
        return <PreCallDeviceCheckView 
          onJoinNow={() => {
            setCurrentView("live");
          }} 
          onBack={() => setCurrentView("dashboard")}
        />;
      case "waiting-guest":
        return <WaitingRoomGuestView meeting={activeMeeting} onLeave={() => setCurrentView("dashboard")} />;
      case "waiting-host":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-canvas">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto scrollbar-fine">
              <WaitingRoomHostView onAdmitAll={() => setCurrentView("live")} />
            </div>
          </div>
        );
      case "admin-users":
        return (
          <AdminLayout currentRoute={currentView} onNavigate={setCurrentView}>
            <AdminUsersPage />
          </AdminLayout>
        );
      case "admin-meetings":
        return (
          <AdminLayout currentRoute={currentView} onNavigate={setCurrentView}>
            <AdminMeetingsPage />
          </AdminLayout>
        );
      case "live":
        return <LiveMeetingView meeting={activeMeeting} onLeave={() => setCurrentView("dashboard")} />;
      default:
        return null;
    }
  };

  // Full-screen views hide the sidebar completely
  const isFullScreenView = ["join", "pre-call", "waiting-guest", "live"].includes(currentView);

  return (
    <div className="flex h-screen bg-canvas font-sans text-ink">
      {!isFullScreenView && (
        <Sidebar currentView={currentView} setView={setCurrentView} onSignOut={onSignOut} />
      )}
      <Suspense fallback={<RouteFallback />}>{renderContent()}</Suspense>

      {/* Render shared modals globally to avoid duplicating them across cases */}
      {isCreateModalOpen && (
        <CreateMeetingModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleMeetingCreated}
        />
      )}
      {isScheduleModalOpen && (
        <ScheduleMeetingModal
          onClose={() => setIsScheduleModalOpen(false)}
          onSuccess={handleMeetingCreated}
        />
      )}
      {isMeetingCreatedModalOpen && activeMeeting && (
        <MeetingCreatedModal
          meeting={activeMeeting}
          onClose={() => setIsMeetingCreatedModalOpen(false)}
          onStart={handleStartMeeting}
        />
      )}
    </div>
  );
}

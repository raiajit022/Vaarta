import React, { useState, useEffect } from "react";
import { Sidebar, TopNav } from "./components/layout/Layout";
import { DashboardView } from "./components/views/DashboardView";
import { CreateMeetingModal, MeetingCreatedModal, ScheduleMeetingModal } from "./components/views/Modals";
import { JoinMeetingView, PreCallDeviceCheckView, WaitingRoomGuestView, WaitingRoomHostView } from "./components/views/MeetingViews";
import { LiveMeetingView } from "./components/views/LiveMeetingView";
import { MeetingsView, RecordingsView, ContactsView, SettingsView } from "./components/views/OtherViews";
import { AdminLayout } from "../admin/AdminLayout";
import { AdminUsersPage } from "../admin/AdminUsersPage";
import { AdminMeetingsPage } from "../admin/AdminMeetingsPage";
import { useAuthStore } from "../../store/useAuthStore";

export function CoreApp({ onSignOut }: { onSignOut?: () => void }) {
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, meetings, recordings, contacts, settings, join, pre-call, waiting-guest, waiting-host
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMeetingCreatedModalOpen, setIsMeetingCreatedModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<any>(null);
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();

    const handleAdmitGuest = () => setCurrentView("live");
    window.addEventListener('admit-guest', handleAdmitGuest);
    return () => window.removeEventListener('admit-guest', handleAdmitGuest);
  }, [fetchProfile]);

  const handleCreateMeeting = () => {
    setIsCreateModalOpen(true);
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
          <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f7]">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto">
              <DashboardView 
                onCreateMeeting={handleCreateMeeting} 
                onJoinMeeting={handleJoinMeeting}
                onScheduleMeeting={handleScheduleMeeting}
              />
            </div>
          </div>
        );
      case "meetings":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f7]">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto">
              <MeetingsView onScheduleMeeting={handleScheduleMeeting} />
            </div>
          </div>
        );
      case "recordings":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f7]">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto">
              <RecordingsView />
            </div>
          </div>
        );
      case "contacts":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f7]">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto">
              <ContactsView />
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f7]">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto">
              <SettingsView />
            </div>
          </div>
        );
      case "join":
        return <JoinMeetingView onJoin={() => setCurrentView("pre-call")} />;
      case "pre-call":
        // For prototype purposes, alternating between guest and host waiting rooms
        return <PreCallDeviceCheckView onJoinNow={() => setCurrentView("waiting-guest")} />;
      case "waiting-guest":
        return <WaitingRoomGuestView onLeave={() => setCurrentView("dashboard")} />;
      case "waiting-host":
        return (
          <div className="flex-1 flex flex-col min-w-0 bg-[#faf9f7]">
            <TopNav onAvatarClick={() => setCurrentView("settings")} />
            <div className="flex-1 overflow-auto">
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

  // If we are in full-screen views, don't show sidebar
  const isFullScreenView = ["join", "pre-call", "waiting-guest", "live"].includes(currentView);

  return (
    <div className="flex h-screen bg-[#faf9f7] font-sans text-stone-900">
      {!isFullScreenView && <Sidebar currentView={currentView} setView={setCurrentView} />}
      {renderContent()}

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
      
      {onSignOut && (
        <button
          onClick={onSignOut}
          className="fixed bottom-4 right-4 z-50 text-[12px] font-medium text-stone-500 hover:text-stone-900 bg-white border border-stone-200 rounded-[6px] px-3 py-1.5 shadow-sm transition-colors"
        >
          Sign out
        </button>
      )}
    </div>
  );
}

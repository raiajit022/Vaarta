import React, { useState } from "react";
import { Sidebar, TopNav } from "./components/layout/Layout";
import { DashboardView } from "./components/views/DashboardView";
import { CreateMeetingModal, MeetingCreatedModal, ScheduleMeetingModal } from "./components/views/Modals";
import { JoinMeetingView, PreCallDeviceCheckView, WaitingRoomGuestView, WaitingRoomHostView } from "./components/views/MeetingViews";
import { MeetingsView, RecordingsView, ContactsView, SettingsView } from "./components/views/OtherViews";

export function CoreApp({ onSignOut }: { onSignOut?: () => void }) {
  const [currentView, setCurrentView] = useState("dashboard"); // dashboard, meetings, recordings, contacts, settings, join, pre-call, waiting-guest, waiting-host
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMeetingCreatedModalOpen, setIsMeetingCreatedModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleCreateMeeting = () => {
    setIsCreateModalOpen(true);
  };

  const handleScheduleMeeting = () => {
    setIsScheduleModalOpen(true);
  };

  const handleMeetingCreated = () => {
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
              <WaitingRoomHostView onAdmitAll={() => setCurrentView("dashboard")} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // If we are in full-screen views, don't show sidebar
  const isFullScreenView = ["join", "pre-call", "waiting-guest"].includes(currentView);

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
      {isMeetingCreatedModalOpen && (
        <MeetingCreatedModal 
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

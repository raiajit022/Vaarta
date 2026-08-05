import React, { useState, useCallback } from 'react';
import { useLocalParticipant, useDataChannel } from '@livekit/components-react';
import { Hand, Smile, MicOff } from 'lucide-react';
import { toast } from 'sonner';

export function MeetingReactions({ isHost }: { isHost: boolean }) {
  const { localParticipant } = useLocalParticipant();

  // Floating emojis state
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, emoji: string}[]>([]);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const EMOJIS = ['👍', '❤️', '😂', '👏', '🎉', '😮'];

  const showFloatingEmoji = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  }, []);

  // Data Channel for Emojis, Mute All, and Raise Hand
  const { send } = useDataChannel(
    "reactions",
    useCallback((msg: any) => {
      try {
        const data = JSON.parse(new TextDecoder().decode(msg.payload));
        
        if (data.type === 'EMOJI') {
          showFloatingEmoji(data.emoji);
        } 
        else if (data.type === 'MUTE_ALL' && !isHost) {
          // Host requested everyone to mute
          if (localParticipant.isMicrophoneEnabled) {
            localParticipant.setMicrophoneEnabled(false);
            toast.info("The host has muted all participants.");
          }
        }
        else if (data.type === 'RAISE_HAND') {
          const name = msg.from?.name || msg.from?.identity || "A participant";
          if (data.state) {
            toast(`${name} raised their hand ✋`, { duration: 5000 });
          }
        }
      } catch (e) {
        console.error(e);
      }
    }, [localParticipant, isHost, showFloatingEmoji])
  );

  const sendEmoji = (emoji: string) => {
    send(new TextEncoder().encode(JSON.stringify({ type: 'EMOJI', emoji })), { reliable: true });
    showFloatingEmoji(emoji); // show locally too
  };

  const muteEveryone = () => {
    if (window.confirm("Are you sure you want to mute all participants?")) {
      send(new TextEncoder().encode(JSON.stringify({ type: 'MUTE_ALL' })), { reliable: true });
      toast.success("Mute command sent to all participants.");
    }
  };

  const [isHandRaised, setIsHandRaised] = useState(false);
  const toggleHand = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    send(new TextEncoder().encode(JSON.stringify({ type: 'RAISE_HAND', state: newState })), { reliable: true });
    if (newState) {
      toast.success("You raised your hand ✋");
    }
  };

  return (
    <>
      {/* Floating Emojis Overlay */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {floatingEmojis.map(e => (
          <div 
            key={e.id}
            className="absolute bottom-32 right-12 text-4xl"
            style={{ 
              animation: 'float-up 3s ease-out forwards',
              left: `${Math.random() * 20 + 75}%`, // random position on the right 25% of screen
            }}
          >
            {e.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) scale(0.5); opacity: 0; }
          20% { transform: translateY(-50px) scale(1.2); opacity: 1; }
          100% { transform: translateY(-200px) scale(1); opacity: 0; }
        }
      `}</style>

      {/* Floating Control Panel */}
      <div className="absolute bottom-6 right-6 z-[100] flex gap-3">
        {isHost && (
          <button 
            onClick={muteEveryone}
            className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg border border-red-500 transition-colors"
            title="Mute Everyone"
          >
            <MicOff size={22} />
          </button>
        )}

        <div className="relative">
          {showEmojiMenu && (
            <div className="absolute bottom-full right-0 mb-3 bg-gray-900 rounded-lg shadow-xl border border-gray-700 p-2 flex gap-2">
              {EMOJIS.map(e => (
                <button 
                  key={e}
                  onClick={() => { sendEmoji(e); setShowEmojiMenu(false); }}
                  className="text-2xl hover:bg-gray-800 p-2 rounded transition-colors"
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          <button 
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full shadow-lg border border-gray-600 transition-colors"
            title="React"
          >
            <Smile size={22} />
          </button>
        </div>

        <button 
          onClick={toggleHand}
          className={`${isHandRaised ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-800 hover:bg-gray-700'} text-white p-3 rounded-full shadow-lg border ${isHandRaised ? 'border-yellow-400' : 'border-gray-600'} transition-colors`}
          title={isHandRaised ? "Lower Hand" : "Raise Hand"}
        >
          <Hand size={22} />
        </button>
      </div>
    </>
  );
}

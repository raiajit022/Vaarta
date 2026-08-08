import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocalParticipant, useDataChannel } from '@livekit/components-react';
import { Hand, Smile, MicOff } from 'lucide-react';
import { toast } from 'sonner';
import { confirm } from '../../../../ui/confirm';
import { cn } from '../../../../ui/cn';

const EMOJIS = ['👍', '❤️', '😂', '👏', '🎉', '😮'];

/**
 * Reactions, raise-hand and the host's mute-all, plus the floating emoji
 * overlay. Lives in the bottom-right dock so it never collides with LiveKit's
 * centred control bar or the host cluster on the left.
 */
export function MeetingReactions({ isHost }: { isHost: boolean }) {
  const { localParticipant } = useLocalParticipant();

  const [floatingEmojis, setFloatingEmojis] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [showEmojiMenu, setShowEmojiMenu] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showEmojiMenu) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowEmojiMenu(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setShowEmojiMenu(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [showEmojiMenu]);

  const showFloatingEmoji = useCallback((emoji: string) => {
    const id = Date.now() + Math.random();
    setFloatingEmojis((prev) => [...prev, { id, emoji, left: Math.random() * 18 + 76 }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== id));
    }, 3000);
  }, []);

  const { send } = useDataChannel(
    'reactions',
    useCallback(
      (msg: any) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(msg.payload));

          if (data.type === 'EMOJI') {
            showFloatingEmoji(data.emoji);
          } else if (data.type === 'MUTE_ALL' && !isHost) {
            if (localParticipant.isMicrophoneEnabled) {
              localParticipant.setMicrophoneEnabled(false);
              toast.info('The host muted everyone.');
            }
          } else if (data.type === 'RAISE_HAND') {
            const name = msg.from?.name || msg.from?.identity || 'Someone';
            if (data.state) toast(`${name} raised their hand ✋`, { duration: 5000 });
          }
        } catch (e) {
          console.error(e);
        }
      },
      [localParticipant, isHost, showFloatingEmoji]
    )
  );

  const sendEmoji = (emoji: string) => {
    send(new TextEncoder().encode(JSON.stringify({ type: 'EMOJI', emoji })), { reliable: true });
    showFloatingEmoji(emoji);
  };

  const muteEveryone = async () => {
    const ok = await confirm({
      title: 'Mute everyone?',
      description:
        'All participants will have their microphone switched off. They can unmute themselves.',
      confirmLabel: 'Mute all',
    });
    if (!ok) return;

    send(new TextEncoder().encode(JSON.stringify({ type: 'MUTE_ALL' })), { reliable: true });
    toast.success('Everyone has been muted.');
  };

  const toggleHand = () => {
    const next = !isHandRaised;
    setIsHandRaised(next);
    send(new TextEncoder().encode(JSON.stringify({ type: 'RAISE_HAND', state: next })), {
      reliable: true,
    });
    if (next) toast.success('Hand raised ✋');
  };

  const dockButton =
    'w-11 h-11 rounded-xl border flex items-center justify-center transition-all duration-150 hover:-translate-y-0.5';

  return (
    <>
      {/* Floating emoji overlay */}
      <div className="pointer-events-none fixed inset-0 z-[45] overflow-hidden">
        {floatingEmojis.map((e) => (
          <div
            key={e.id}
            className="absolute bottom-28 text-4xl"
            style={{
              animation: 'vaarta-float-up 3s cubic-bezier(0.16,1,0.3,1) forwards',
              left: `${e.left}%`,
            }}
          >
            {e.emoji}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes vaarta-float-up {
          0%   { transform: translateY(0) scale(0.5) rotate(-6deg); opacity: 0; }
          18%  { transform: translateY(-46px) scale(1.15) rotate(3deg); opacity: 1; }
          100% { transform: translateY(-220px) scale(0.95) rotate(-2deg); opacity: 0; }
        }
      `}</style>

      {/* Bottom-right dock */}
      <div className="absolute bottom-6 right-6 z-40 flex items-center gap-2">
        {isHost && (
          <button
            onClick={muteEveryone}
            title="Mute everyone"
            aria-label="Mute everyone"
            className={cn(
              dockButton,
              'bg-[var(--scrim)] backdrop-blur-xl border-line text-ink-2 hover:text-danger-ink hover:border-danger-line'
            )}
          >
            <MicOff size={19} />
          </button>
        )}

        <div className="relative" ref={menuRef}>
          {showEmojiMenu && (
            <div className="absolute bottom-full right-0 mb-2.5 flex gap-1 p-1.5 rounded-xl border border-line bg-surface elev-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => {
                    sendEmoji(e);
                    setShowEmojiMenu(false);
                  }}
                  className="text-2xl w-10 h-10 rounded-lg hover:bg-surface-hover hover:scale-110 transition-all"
                  aria-label={`React with ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowEmojiMenu(!showEmojiMenu)}
            title="React"
            aria-label="Send a reaction"
            className={cn(
              dockButton,
              showEmojiMenu
                ? 'bg-iris border-iris text-on-iris'
                : 'bg-[var(--scrim)] backdrop-blur-xl border-line text-ink-2 hover:text-ink'
            )}
          >
            <Smile size={19} />
          </button>
        </div>

        <button
          onClick={toggleHand}
          title={isHandRaised ? 'Lower hand' : 'Raise hand'}
          aria-label={isHandRaised ? 'Lower hand' : 'Raise hand'}
          aria-pressed={isHandRaised}
          className={cn(
            dockButton,
            isHandRaised
              ? 'bg-saffron border-saffron text-on-saffron'
              : 'bg-[var(--scrim)] backdrop-blur-xl border-line text-ink-2 hover:text-ink'
          )}
        >
          <Hand size={19} />
        </button>
      </div>
    </>
  );
}

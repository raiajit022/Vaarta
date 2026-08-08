import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "../../../../ui/Button";
import { Select, Field } from "../../../../ui/Input";
import { Video, Mic, Volume2 } from "lucide-react";

export function DeviceTester() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [speakerTestPlaying, setSpeakerTestPlaying] = useState(false);
  
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>('');
  const [selectedAudioId, setSelectedAudioId] = useState<string>('');

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const speakerAudioRef = useRef<OscillatorNode | null>(null);
  const speakerGainRef = useRef<GainNode | null>(null);
  const startingRef = useRef<boolean>(false);

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions first to get device labels
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => s.getTracks().forEach(t => t.stop()));
        const d = await navigator.mediaDevices.enumerateDevices();
        setDevices(d);
        const vids = d.filter(x => x.kind === 'videoinput');
        const auds = d.filter(x => x.kind === 'audioinput');
        if (vids.length > 0) setSelectedVideoId(vids[0].deviceId);
        if (auds.length > 0) setSelectedAudioId(auds[0].deviceId);
      } catch (e) {
        console.error("Could not enumerate devices", e);
      }
    };
    getDevices();
  }, []);

  const stopTest = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch (_) {}
      sourceRef.current = null;
    }
    analyzerRef.current = null;
    if (speakerAudioRef.current) {
      try { speakerAudioRef.current.stop(); } catch (_) {}
      speakerAudioRef.current = null;
    }
    speakerGainRef.current = null;
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsTesting(false);
    setVolume(0);
    setSpeakerTestPlaying(false);
    startingRef.current = false;
  }, []);

  const startTest = async () => {
    if (startingRef.current) return;
    startingRef.current = true;
    
    // Stop any existing stream before starting a new one
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: selectedVideoId ? { deviceId: { exact: selectedVideoId } } : true,
        audio: selectedAudioId ? { deviceId: { exact: selectedAudioId } } : true
      };
      const s = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = s;
      setIsTesting(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      const analyzer = audioCtx.createAnalyser();
      analyzerRef.current = analyzer;
      const source = audioCtx.createMediaStreamSource(s);
      sourceRef.current = source;
      source.connect(analyzer);

      analyzer.fftSize = 256;
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;
        setVolume(average);
        rafRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err: any) {
      setError(err.message || "Could not access camera/microphone. Please check browser permissions.");
      setIsTesting(false);
    } finally {
      startingRef.current = false;
    }
  };

  // restart test if device changes
  useEffect(() => {
    if (isTesting && !startingRef.current) {
      startTest();
    }
  }, [selectedVideoId, selectedAudioId]);

  const playSpeakerTest = () => {
    if (!audioContextRef.current || speakerTestPlaying) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, ctx.currentTime); // A4 note
    gainNode.gain.setValueAtTime(0.15, ctx.currentTime); // Low volume

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    speakerAudioRef.current = oscillator;
    speakerGainRef.current = gainNode;

    oscillator.start();
    setSpeakerTestPlaying(true);

    setTimeout(() => {
      stopSpeakerTest();
    }, 2000);
  };

  const stopSpeakerTest = () => {
    if (speakerAudioRef.current) {
      try { speakerAudioRef.current.stop(); } catch (_) {}
      speakerAudioRef.current = null;
    }
    speakerGainRef.current = null;
    setSpeakerTestPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        streamRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (sourceRef.current) {
        try { sourceRef.current.disconnect(); } catch (_) {}
      }
      if (speakerAudioRef.current) {
        try { speakerAudioRef.current.stop(); } catch (_) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Camera" htmlFor="dt-camera">
          <Select id="dt-camera" value={selectedVideoId} onChange={e => setSelectedVideoId(e.target.value)}>
            {devices.filter(d => d.kind === 'videoinput').map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.substring(0, 5)}`}</option>
            ))}
          </Select>
        </Field>
        <Field label="Microphone" htmlFor="dt-mic">
          <Select id="dt-mic" value={selectedAudioId} onChange={e => setSelectedAudioId(e.target.value)}>
            {devices.filter(d => d.kind === 'audioinput').map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.substring(0, 5)}`}</option>
            ))}
          </Select>
        </Field>
      </div>

      {!isTesting ? (
        <div className="text-center py-10 px-6 bg-surface-inset border border-line rounded-xl">
          <div className="w-12 h-12 rounded-xl bg-iris-soft border border-iris-line flex items-center justify-center mx-auto mb-4 text-iris">
            <Video className="w-5 h-5" />
          </div>
          <p className="t-h3 text-ink mb-1">Test your devices</p>
          <p className="t-small text-ink-3 mb-5">Check your camera, microphone and speakers.</p>
          <Button onClick={startTest}>Start test</Button>
          {error && (
            <p className="mt-4 mx-auto max-w-sm px-3 py-2.5 rounded-lg bg-danger-soft border border-danger-line text-danger-ink t-small">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Camera Preview */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-ink-3" />
                <span className="t-small font-medium text-ink-2">Camera preview</span>
              </div>
              <Button variant="dangerGhost" size="sm" onClick={stopTest}>Stop test</Button>
            </div>
            <div className="aspect-video bg-canvas border border-line rounded-xl overflow-hidden flex items-center justify-center relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
          </div>

          {/* Microphone Level */}
          <div className="pt-5 border-t border-line">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-ink-3" />
              <span className="t-small font-medium text-ink-2">Microphone</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="t-caption text-ink-3 w-10">Level</span>
              <div className="flex-1 flex gap-1 h-3">
                {[...Array(15)].map((_, i) => {
                  const isActive = volume > (i * 5);
                  return (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full transition-colors duration-100 ${isActive
                        ? (i > 11 ? 'bg-danger' : i > 8 ? 'bg-saffron' : 'bg-live')
                        : 'bg-surface-inset'
                        }`}
                    ></div>
                  );
                })}
              </div>
            </div>
            <p className="t-caption text-ink-3 mt-2.5">Speak — the bars should follow your voice.</p>
          </div>

          {/* Speaker Test */}
          <div className="pt-5 border-t border-line">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-ink-3" />
              <span className="t-small font-medium text-ink-2">Speakers</span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={speakerTestPlaying ? stopSpeakerTest : playSpeakerTest}
                disabled={speakerTestPlaying}
              >
                {speakerTestPlaying ? "Playing…" : "Play test tone"}
              </Button>
              <p className="t-caption text-ink-3">
                {speakerTestPlaying ? "You should hear a tone." : "Plays a short A4 tone."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

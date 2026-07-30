import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "../ui/Button";
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
        <div>
          <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Camera</label>
          <select 
            className="w-full h-10 px-3 rounded-[6px] border border-stone-200 bg-white text-[14px] text-stone-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value={selectedVideoId} 
            onChange={e => setSelectedVideoId(e.target.value)}
          >
            {devices.filter(d => d.kind === 'videoinput').map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.substring(0, 5)}`}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-stone-700 mb-1.5">Microphone</label>
          <select 
            className="w-full h-10 px-3 rounded-[6px] border border-stone-200 bg-white text-[14px] text-stone-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            value={selectedAudioId} 
            onChange={e => setSelectedAudioId(e.target.value)}
          >
            {devices.filter(d => d.kind === 'audioinput').map(d => (
              <option key={d.deviceId} value={d.deviceId}>{d.label || `Microphone ${d.deviceId.substring(0, 5)}`}</option>
            ))}
          </select>
        </div>
      </div>

      {!isTesting ? (
        <div className="text-center py-10 bg-stone-50 border border-stone-200 rounded-[8px]">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Video className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-[14px] text-stone-600 mb-1 font-medium">Test your devices</p>
          <p className="text-[13px] text-stone-500 mb-4">Check your camera, microphone, and speakers before a call.</p>
          <Button onClick={startTest}>Start Test</Button>
          {error && <p className="text-red-500 text-[13px] mt-4">{error}</p>}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Camera Preview */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-stone-500" />
                <label className="block text-[13px] font-medium text-stone-700">Camera Preview</label>
              </div>
              <Button variant="ghost" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={stopTest}>Stop Test</Button>
            </div>
            <div className="mt-2 aspect-video bg-stone-900 rounded-[8px] overflow-hidden flex items-center justify-center relative">
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
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 mb-3">
              <Mic className="w-4 h-4 text-stone-500" />
              <label className="block text-[13px] font-medium text-stone-700">Microphone</label>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-stone-500 w-12">Level</span>
              <div className="flex-1 flex gap-1 h-3">
                {[...Array(15)].map((_, i) => {
                  const isActive = volume > (i * 5);
                  return (
                    <div
                      key={i}
                      className={`h-full flex-1 rounded-full transition-colors duration-100 ${isActive
                        ? (i > 11 ? 'bg-red-500' : i > 8 ? 'bg-yellow-500' : 'bg-emerald-500')
                        : 'bg-stone-200'
                        }`}
                    ></div>
                  );
                })}
              </div>
            </div>
            <p className="text-[12px] text-stone-500 mt-2">Speak into your microphone — the bars should respond to your voice.</p>
          </div>

          {/* Speaker Test */}
          <div className="pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-stone-500" />
              <label className="block text-[13px] font-medium text-stone-700">Speakers</label>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="text-xs"
                onClick={speakerTestPlaying ? stopSpeakerTest : playSpeakerTest}
                disabled={speakerTestPlaying}
              >
                {speakerTestPlaying ? "Playing..." : "Play Test Sound"}
              </Button>
              <p className="text-[12px] text-stone-500">
                {speakerTestPlaying ? "You should hear a tone from your speakers." : "Click to play a test tone through your speakers."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

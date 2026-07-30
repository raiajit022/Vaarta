import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/Button";

export function DeviceTester() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [volume, setVolume] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);

  const startTest = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setStream(s);
      setIsTesting(true);
      setError(null);

      // Audio analysis
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(s);
      sourceRef.current.connect(analyzerRef.current);

      analyzerRef.current.fftSize = 256;
      const bufferLength = analyzerRef.current.frequencyBinCount;
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
      setError(err.message || "Could not access camera/microphone");
      setIsTesting(false);
    }
  };

  const stopTest = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsTesting(false);
    setVolume(0);
  };

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.error("Error playing video:", e));
    }
  }, [stream, isTesting]);

  useEffect(() => {
    return () => {
      stopTest();
    };
  }, []);

  return (
    <div className="space-y-6">
      {!isTesting ? (
        <div className="text-center py-10 bg-stone-50 border border-stone-200 rounded-[8px]">
          <p className="text-[14px] text-stone-600 mb-4">Click below to allow access and test your camera and microphone.</p>
          <Button onClick={startTest}>Start Test</Button>
          {error && <p className="text-red-500 text-[13px] mt-4">{error}</p>}
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[13px] font-medium text-stone-700">Camera Preview</label>
              <Button variant="ghost" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={stopTest}>Stop Test</Button>
            </div>
            <div className="mt-2 aspect-video bg-stone-900 rounded-[8px] overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
          </div>

          <div className="pt-6 border-t border-stone-100">
            <label className="block text-[13px] font-medium text-stone-700 mb-3">Microphone Volume</label>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-stone-500 w-12">Input</span>
              <div className="flex-1 flex gap-1 h-2">
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
            <p className="text-[12px] text-stone-500 mt-2">Speak into your microphone to test the input levels.</p>
          </div>
        </div>
      )}
    </div>
  );
}

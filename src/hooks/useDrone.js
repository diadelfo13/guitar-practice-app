import { useState, useCallback } from 'react';
import { drone } from '../lib/audioEngine';
import { NOTE_FREQUENCIES } from '../lib/constants';

export function useDrone() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveform, setWaveformState] = useState('sawtooth');
  const [volume, setVolumeState] = useState(0.3);
  const [droneMode, setDroneMode] = useState('root+5th'); // 'root' | 'root+5th' | 'root+octave'

  const getDroneFreqs = useCallback((key) => {
    const rootFreq = NOTE_FREQUENCIES[key] ?? 130.81;
    switch (droneMode) {
      case 'root':      return [rootFreq];
      case 'root+5th':  return [rootFreq, rootFreq * 1.5];
      case 'root+octave': return [rootFreq, rootFreq * 2];
      case 'full':      return [rootFreq, rootFreq * 1.5, rootFreq * 2];
      default:          return [rootFreq];
    }
  }, [droneMode]);

  const start = useCallback((key) => {
    const freqs = getDroneFreqs(key);
    drone.start(freqs);
    setIsPlaying(true);
  }, [getDroneFreqs]);

  const stop = useCallback(() => {
    drone.stop();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback((key) => {
    if (drone.isPlaying) { stop(); } else { start(key); }
  }, [start, stop]);

  const setWaveform = useCallback((w) => {
    drone.setWaveform(w);
    setWaveformState(w);
    if (drone.isPlaying) {
      // Restart with new waveform — we need the key, so caller restarts
    }
  }, []);

  const setVolume = useCallback((v) => {
    drone.setVolume(v);
    setVolumeState(v);
  }, []);

  return { isPlaying, toggle, start, stop, waveform, setWaveform, volume, setVolume, droneMode, setDroneMode, getDroneFreqs };
}

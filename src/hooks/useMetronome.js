import { useState, useEffect, useCallback, useRef } from 'react';
import { metronome } from '../lib/audioEngine';

export function useMetronome() {
  const [bpm, setBpmState] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [subdivision, setSubdivisionState] = useState(1);
  const [flash, setFlash] = useState(false);
  const [accentFlash, setAccentFlash] = useState(false);
  const flashTimerRef = useRef(null);

  useEffect(() => {
    const onBeat = (isAccent) => {
      setFlash(true);
      if (isAccent) setAccentFlash(true);
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => {
        setFlash(false);
        setAccentFlash(false);
      }, 100);
    };
    metronome.onBeat(onBeat);
    return () => {
      metronome.offBeat(onBeat);
      clearTimeout(flashTimerRef.current);
    };
  }, []);

  const toggle = useCallback(() => {
    metronome.toggle();
    setIsPlaying(metronome.isPlaying);
  }, []);

  const setBpm = useCallback((val) => {
    metronome.setBpm(val);
    setBpmState(metronome.bpm);
  }, []);

  const tap = useCallback(() => {
    const newBpm = metronome.tap();
    setBpmState(newBpm);
  }, []);

  const setSubdivision = useCallback((val) => {
    metronome.subdivision = val;
    setSubdivisionState(val);
  }, []);

  return { bpm, setBpm, isPlaying, toggle, tap, subdivision, setSubdivision, flash, accentFlash };
}

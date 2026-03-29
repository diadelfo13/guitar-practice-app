import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import DailyPracticeSection from './components/sections/DailyPracticeSection';
import OverviewSection from './components/sections/OverviewSection';
import TriadsSection from './components/sections/TriadsSection';
import SeventhChordsSection from './components/sections/SeventhChordsSection';
import ExtensionsSection from './components/sections/ExtensionsSection';
import IntervalsSection from './components/sections/IntervalsSection';
import ModesSection from './components/sections/ModesSection';
import MinorScalesSection from './components/sections/MinorScalesSection';
import BonusSection from './components/sections/BonusSection';
import ChordLibrarySection from './components/sections/ChordLibrarySection';
import { metronome, drone } from './lib/audioEngine';

const STORAGE_KEY = 'guitar-practice-prefs';

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function App() {
  const prefs = loadPrefs();
  const [selectedKey, setSelectedKey] = useState(prefs.key || 'C');
  const [currentSection, setCurrentSection] = useState(prefs.section || 'daily');

  // Session timer
  const sectionEnteredAtRef = useRef(Date.now());
  const [sectionElapsed, setSectionElapsed] = useState(0);

  useEffect(() => {
    sectionEnteredAtRef.current = Date.now();
    setSectionElapsed(0);
  }, [currentSection]);

  useEffect(() => {
    const id = setInterval(() => {
      setSectionElapsed(Math.floor((Date.now() - sectionEnteredAtRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [currentSection]);

  // Persist preferences
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ key: selectedKey, section: currentSection }));
    } catch (_) {}
  }, [selectedKey, currentSection]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    // Space toggles metronome
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      metronome.toggle();
      return;
    }

    // D toggles drone
    if (e.key === 'd' || e.key === 'D') {
      drone.toggleWithLastFreqs();
      return;
    }

    // Number keys 1-9 switch sections
    const sections = ['daily','overview','triads','sevenths','extensions','intervals','modes','minor','bonus','chords'];
    if (e.key >= '1' && e.key <= '9') {
      setCurrentSection(sections[Number(e.key) - 1]);
    }
    if (e.key === '0' && sections.length >= 10) {
      setCurrentSection(sections[9]);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const sectionProps = { selectedKey, sectionElapsed, currentSection, onSectionChange: setCurrentSection };

  const renderSection = () => {
    switch (currentSection) {
      case 'daily':       return <DailyPracticeSection {...sectionProps} />;
      case 'overview':    return <OverviewSection {...sectionProps} />;
      case 'triads':      return <TriadsSection {...sectionProps} />;
      case 'sevenths':    return <SeventhChordsSection {...sectionProps} />;
      case 'extensions':  return <ExtensionsSection {...sectionProps} />;
      case 'intervals':   return <IntervalsSection {...sectionProps} />;
      case 'modes':       return <ModesSection {...sectionProps} />;
      case 'minor':       return <MinorScalesSection {...sectionProps} />;
      case 'bonus':       return <BonusSection {...sectionProps} />;
      case 'chords':      return <ChordLibrarySection {...sectionProps} />;
      default:            return <DailyPracticeSection {...sectionProps} />;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#07070b]">
      <Header selectedKey={selectedKey} onKeyChange={setSelectedKey} currentSection={currentSection} onSectionChange={setCurrentSection} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentSection={currentSection} onSectionChange={setCurrentSection} />
        <main className="flex flex-1 overflow-hidden min-w-0" key={currentSection}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

export default App;

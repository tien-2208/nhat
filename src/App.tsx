import { useEffect, useRef, useState } from 'react';
import { GameSceneManager } from './game/threeScene';
import { GameState, FloatingText, ItemType } from './types/game';
import { GAME_ITEMS, TARGET_SCORE } from './game/constants';
import { soundManager } from './audio/soundEffects';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { BirthdayModal } from './components/BirthdayModal';
import { ItemsGuideModal } from './components/ItemsGuideModal';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneManagerRef = useRef<GameSceneManager | null>(null);

  // React State
  const [gameState, setGameState] = useState<GameState>('title');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  // Initialize Three.js scene once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const handleScoreUpdate = (
      newScore: number,
      itemType: ItemType,
      points: number,
      xRatio: number
    ) => {
      setScore(newScore);

      const config = GAME_ITEMS[itemType];
      if (config.isPositive) {
        setCombo((prev) => prev + 1);
      } else {
        setCombo(0);
      }

      // Add floating feedback text: item name first, points after text
      const ptsStr = points > 0 ? `+${points}` : `${points}`;
      const newFt: FloatingText = {
        id: Date.now() + Math.random(),
        text: `${config.shortLabel} ${ptsStr}`,
        x: Math.max(0.15, Math.min(0.85, xRatio)),
        y: 65, // middle-lower screen above pig
        color: config.color,
        isPositive: config.isPositive,
      };

      setFloatingTexts((prev) => [...prev.slice(-4), newFt]);

      // Remove after 1.2s
      setTimeout(() => {
        setFloatingTexts((prev) => prev.filter((item) => item.id !== newFt.id));
      }, 1200);
    };

    const handleVictory = () => {
      setGameState('victory');
    };

    const manager = new GameSceneManager(
      canvasMountRef.current,
      handleScoreUpdate,
      handleVictory
    );
    sceneManagerRef.current = manager;

    return () => {
      manager.destroy();
      sceneManagerRef.current = null;
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const keysPressed = { left: false, right: false };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Space or Enter to start from title
      if (gameState === 'title' && (e.code === 'Space' || e.code === 'Enter')) {
        e.preventDefault();
        handleStartGame();
        return;
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysPressed.left = true;
        sceneManagerRef.current?.setKeyInput(true, keysPressed.right);
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysPressed.right = true;
        sceneManagerRef.current?.setKeyInput(keysPressed.left, true);
      }

    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keysPressed.left = false;
        sceneManagerRef.current?.setKeyInput(false, keysPressed.right);
      }
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keysPressed.right = false;
        sceneManagerRef.current?.setKeyInput(keysPressed.left, false);
      }
    };

    const handleBlur = () => {
      keysPressed.left = false;
      keysPressed.right = false;
      sceneManagerRef.current?.setKeyInput(false, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState]);

  // Pointer/Mouse/Touch tracking on whole screen
  useEffect(() => {
    if (gameState !== 'playing') return;

    const handlePointerMove = (e: PointerEvent) => {
      // Convert clientX to normalized -1 to +1
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneManagerRef.current?.setPointerTarget(normalizedX);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerdown', handlePointerMove);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerMove);
    };
  }, [gameState]);

  const handleStartGame = () => {
    setScore(0);
    setCombo(0);
    setGameState('playing');
    soundManager.init();
    soundManager.playCatchPositive(20);
    sceneManagerRef.current?.start();
  };

  const handleRestart = () => {
    setScore(0);
    setCombo(0);
    setGameState('playing');
    sceneManagerRef.current?.reset();
  };

  const handleContinueEndless = () => {
    setGameState('playing');
    sceneManagerRef.current?.resume();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* 1. Isolated Three.js WebGL Mount Container */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 z-0 touch-none w-full h-full"
      />

      {/* 2. HUD (Score, Progress, Milestones, Combo, Top Controls) */}
      {gameState !== 'title' && (
        <HUD
          score={score}
          floatingTexts={floatingTexts}
          isMuted={isMuted}
          onToggleMute={() => setIsMuted(!isMuted)}
          combo={combo}
          onOpenGuide={() => setShowGuide(true)}
        />
      )}

      {/* 4. Title Screen */}
      {gameState === 'title' && <TitleScreen onStart={handleStartGame} />}

      {/* 5. Birthday Celebration Victory Modal (At 1000 Points) */}
      {gameState === 'victory' && (
        <BirthdayModal
          score={score}
          onRestart={handleRestart}
          onContinueEndless={handleContinueEndless}
        />
      )}

      {/* 6. Scoring Guide Modal */}
      {showGuide && <ItemsGuideModal onClose={() => setShowGuide(false)} />}
    </div>
  );
}

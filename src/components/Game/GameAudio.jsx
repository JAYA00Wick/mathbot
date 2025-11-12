import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const GameAudio = ({ isPlaying }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);
  const audioRef = useRef(null);

  // Initialize audio context
  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/assets/sounds/game-music.mp3');
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    // Add load event listener
    audioRef.current.addEventListener('loadeddata', () => {
      console.log('Audio file loaded successfully');
      setIsAudioLoaded(true);
      
      // Try to play if conditions are met
      if (hasInteracted && isPlaying && !isMuted) {
        playAudio();
      }
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Separate function to handle playing audio
  const playAudio = async () => {
    try {
      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          console.log('Audio playing successfully');
        }
      }
    } catch (error) {
      console.error('Failed to play audio:', error);
    }
  };

  // Handle user interaction
  useEffect(() => {
    const handleInteraction = () => {
      console.log('User interaction detected');
      setHasInteracted(true);
      
      if (isPlaying && !isMuted && isAudioLoaded) {
        playAudio();
      }
    };

    // Add interaction listeners
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [isPlaying, isMuted, isAudioLoaded]);

  // Handle play/pause based on isPlaying prop
  useEffect(() => {
    if (!audioRef.current || !hasInteracted || !isAudioLoaded) return;

    if (isPlaying && !isMuted) {
      playAudio();
    } else {
      audioRef.current.pause();
      console.log('Audio paused');
    }
  }, [isPlaying, isMuted, hasInteracted, isAudioLoaded]);

  // Handle mute toggle
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      audioRef.current.pause();
    } else if (isPlaying && hasInteracted) {
      playAudio();
    }
    
    console.log('Mute toggled:', newMutedState);
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      {!hasInteracted && (
        <div className="text-yellow-400 text-sm animate-pulse">
          Click anywhere to enable music
        </div>
      )}
      <button
        onClick={toggleMute}
        className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-6 h-6 text-gray-400" />
        ) : (
          <Volume2 className="w-6 h-6 text-yellow-400" />
        )}
      </button>
    </div>
  );
};

export default GameAudio;
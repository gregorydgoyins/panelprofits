import { useEffect } from 'react';
import hotkeys from 'hotkeys-js';

export function useKeyboardShortcuts() {
  useEffect(() => {
    // Navigation shortcuts
    hotkeys('ctrl+h, cmd+h', 'all', (event) => {
      event.preventDefault();
      // Navigate to home/dashboard
    });

    hotkeys('ctrl+w, cmd+w', 'all', (event) => {
      event.preventDefault();
      // Open writing editor
    });

    // Editor shortcuts
    hotkeys('ctrl+s, cmd+s', 'editor', (event) => {
      event.preventDefault();
      // Save current work
    });

    hotkeys('ctrl+/, cmd+/', 'editor', (event) => {
      event.preventDefault();
      // Toggle AI suggestions
    });

    return () => {
      hotkeys.unbind();
    };
  }, []);

  const registerCustomShortcut = (keys: string, scope: string, callback: () => void) => {
    hotkeys(keys, scope, (event) => {
      event.preventDefault();
      callback();
    });
  };

  return { registerCustomShortcut };
}
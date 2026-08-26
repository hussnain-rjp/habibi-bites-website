import React, { useEffect } from 'react';

export const IndependenceDecorations = () => {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.remove('azaadi-theme-active');
    }
  }, []);

  return null;
};

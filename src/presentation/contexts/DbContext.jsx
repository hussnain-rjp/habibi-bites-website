import React, { createContext, useContext, useMemo } from 'react';
import { isSupabaseConfigured } from '../../infrastructure/supabase/client.js';
import { SupabaseRepository } from '../../infrastructure/repositories/SupabaseRepository.js';
import { LocalStorageRepository } from '../../infrastructure/repositories/LocalStorageRepository.js';

const DbContext = createContext(null);

export const DbProvider = ({ children }) => {
  const repository = useMemo(() => {
    if (isSupabaseConfigured()) {
      return new SupabaseRepository();
    }
    return new LocalStorageRepository();
  }, []);

  return (
    <DbContext.Provider value={repository}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => {
  const repo = useContext(DbContext);
  if (!repo) throw new Error("useDb must be used within a DbProvider");
  return repo;
};

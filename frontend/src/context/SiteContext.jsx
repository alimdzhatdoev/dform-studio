import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSite()
      .then(setSite)
      .catch(() => setSite({}))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SiteContext.Provider value={{ site, loading, setSite }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}

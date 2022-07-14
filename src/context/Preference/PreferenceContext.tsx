import * as React from 'react';

import reducer from '@/context/Preference/reducer';
import { ProviderState } from '@/context/Preference/types';

const PreferenceContext = React.createContext({} as ProviderState);

export default function PreferenceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preferences, dispatch] = React.useReducer(reducer, {
    theme: 'default',
    fontFamily: 'chakra-petch',
    isOpen: false,
    type: 'words',
    time: '15',
  });

  React.useEffect(() => {
    if (typeof window !== undefined) {
      const theme = window.localStorage.getItem('theme');
      const fontFamily = window.localStorage.getItem('font-family');
      const type = window.localStorage.getItem('type');
      const time = window.localStorage.getItem('time');
      if (theme) dispatch({ type: 'SET_THEME', payload: theme });
      if (fontFamily)
        dispatch({ type: 'SET_FONT_FAMILY', payload: fontFamily });
      if (type) dispatch({ type: 'SET_TYPE', payload: type });
      if (time) dispatch({ type: 'SET_TIME', payload: time });
    }
  }, []);

  return (
    <PreferenceContext.Provider value={{ preferences, dispatch }}>
      {children}
    </PreferenceContext.Provider>
  );
}

export const usePreferenceContext = () => React.useContext(PreferenceContext);

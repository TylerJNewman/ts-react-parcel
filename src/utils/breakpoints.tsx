import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from 'react';

const defaultValue = {};

const BreakpointContext = createContext(defaultValue);

interface Queries {
  [key: string]: string;
}

interface Props {
  children: ReactNode;
  queries: Queries;
}

interface MediaQueryLists {
  [index: string]: MediaQueryList;
}

interface QueryMatch {
  sm?: boolean;
  md?: boolean;
  lg?: boolean;
  [index: string]: boolean | undefined;
}

// const queries = {
//   xs: '(max-width: 320px)',
//   sm: '(max-width: 720px)',
//   md: '(max-width: 1024px)',
// };

//  MediaQueryList {media: "(max-width: 600px)", matches: false, onchange: ƒ}

const BreakpointProvider = ({ children, queries }: Props) => {
  const [queryMatch, setQueryMatch] = useState({});

  useEffect(() => {
    const mediaQueryLists: MediaQueryLists = {};
    const keys = Object.keys(queries);
    let isAttached = false;

    const handleQueryListener = () => {
      const updatedMatches = keys.reduce((acc: QueryMatch, media: string) => {
        acc[media] = !!(
          mediaQueryLists[media] && mediaQueryLists[media].matches
        );
        return acc;
      }, {});
      setQueryMatch(updatedMatches);
    };

    if (window && window.matchMedia) {
      const matches: QueryMatch = {};
      keys.forEach(media => {
        if (typeof queries[media] === 'string') {
          mediaQueryLists[media] = window.matchMedia(queries[media]);
          matches[media] = mediaQueryLists[media].matches;
        } else {
          matches[media] = false;
        }
      });
      setQueryMatch(matches);
      isAttached = true;
      keys.forEach(media => {
        if (typeof queries[media] === 'string') {
          mediaQueryLists[media].addListener(handleQueryListener);
        }
      });
    }

    return () => {
      if (isAttached) {
        keys.forEach(media => {
          if (typeof queries[media] === 'string') {
            mediaQueryLists[media].removeListener(handleQueryListener);
          }
        });
      }
    };
  }, [queries]);

  return (
    <BreakpointContext.Provider value={queryMatch}>
      {children}
    </BreakpointContext.Provider>
  );
};

function useBreakpoint(): QueryMatch {
  const context = useContext(BreakpointContext);
  if (context === defaultValue) {
    throw new Error('useBreakpoint must be used within BreakpointProvider');
  }
  return context;
}
export { useBreakpoint, BreakpointProvider };

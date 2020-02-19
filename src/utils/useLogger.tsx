import { useEffect } from 'react';

const useLogger = (element: any, description?: string) => {
  const fancyTag = ['%c Logger ', 'color: white; background-color: #2274A5'];
  useEffect(() => {
    if (!description) {
      console.log(...fancyTag, element);
    } else {
      console.log(...fancyTag, `${description}: `, element);
    }
  }, [element]);
};

export default useLogger;

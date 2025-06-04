import { useEffect } from 'react';

export const usePollUntilReady = (status: string | undefined, refetch: () => void) => {
  useEffect(() => {
    if (status != 'completed' && status != 'failed') {
      const interval = setInterval(() => {
        refetch();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status, refetch]);
};

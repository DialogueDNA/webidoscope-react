import { useEffect } from 'react';
import {ProcessingStatus} from "@/types/api.tsx";

export const usePollUntilReady = (status: ProcessingStatus, refetch: () => void) => {
  useEffect(() => {
    if (status !== 'completed') {
      const interval = setInterval(() => {
        refetch();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status, refetch]);
};

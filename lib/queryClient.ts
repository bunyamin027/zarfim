/**
 * TanStack Query Client — Zarfım
 */
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 dakika boyunca veriyi "taze" kabul et
      staleTime: 5 * 60 * 1000,
      // Ağ hatalarında 2 kez tekrar dene
      retry: 2,
      // Arka plandan döndüğünde yeniden çek
      refetchOnWindowFocus: true,
    },
  },
});

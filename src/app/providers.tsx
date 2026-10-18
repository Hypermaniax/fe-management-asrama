import type { ReactNode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'

import { ErrorBoundary } from '@/components/shared/error-boundary'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {children}
          <Toaster
            position="top-right"
            closeButton
            toastOptions={{
              classNames: {
                toast:
                  'rounded-base border-2 border-border bg-secondary-background text-foreground font-base shadow-shadow',
                title: 'font-heading',
                description: 'text-foreground',
                actionButton:
                  'rounded-base border-2 border-border bg-main text-main-foreground font-base',
                cancelButton:
                  'rounded-base border-2 border-border bg-secondary-background text-foreground font-base',
                closeButton:
                  'rounded-base border-2 border-border bg-secondary-background',
              },
            }}
          />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

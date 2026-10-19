import type { ComponentProps } from 'react'
import { LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function LoadingButton({
  loading = false,
  disabled,
  children,
  ...props
}: ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle className="animate-spin" /> : null}
      {children}
    </Button>
  )
}

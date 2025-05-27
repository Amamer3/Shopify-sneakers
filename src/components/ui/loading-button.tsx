import * as React from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  children: React.ReactNode
  loadingText?: string
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ className, children, isLoading, loadingText, disabled, ...props }, ref) => {
    return (
      <Button
        className={cn("relative", className)}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {isLoading && loadingText ? loadingText : children}
      </Button>
    )
  }
)
LoadingButton.displayName = "LoadingButton"

export { LoadingButton }

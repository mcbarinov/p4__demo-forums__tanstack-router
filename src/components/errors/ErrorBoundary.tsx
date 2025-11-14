import { Component, type ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AppError } from "@/lib/errors"
import { AlertCircleIcon } from "lucide-react"

interface Props {
  children: ReactNode
  resetKey?: unknown
}

export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo)
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      const appError = AppError.fromUnknown(this.state.error)

      return (
        <div className="container mx-auto p-6">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircleIcon />
            <AlertTitle>{appError.title}</AlertTitle>
            <AlertDescription>{appError.message}</AlertDescription>
          </Alert>
        </div>
      )
    }

    return this.props.children
  }
}

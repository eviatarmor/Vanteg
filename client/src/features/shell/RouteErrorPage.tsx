import { isRouteErrorResponse, useRouteError } from "react-router"

export function RouteErrorPage() {
  const error = useRouteError()

  let message = "Something went wrong."
  if (isRouteErrorResponse(error)) {
    message = `${error.status} ${error.statusText}`
  } else if (error instanceof Error) {
    message = error.message
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold">Unable to load this page</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

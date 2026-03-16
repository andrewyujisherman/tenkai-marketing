export default function PortalLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 border-2 border-torii border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-charcoal/50">Loading...</p>
      </div>
    </div>
  )
}

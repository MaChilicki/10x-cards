interface LoadingOverlayProps {
  isVisible: boolean;
  message: string;
  subMessage?: string;
}

export function LoadingOverlay({
  isVisible,
  message,
  subMessage = "Proszę czekać, to może chwilę zająć.",
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[100]">
      <div className="flex flex-col items-center gap-4 p-8 bg-card rounded-lg shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg font-medium">{message}</p>
        <p className="text-sm text-muted-foreground">{subMessage}</p>
      </div>
    </div>
  );
}

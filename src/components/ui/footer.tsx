import { cn } from "@/lib/utils";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={cn("fixed bottom-0 left-0 right-0 w-full border-t border-border bg-background", className)}>
      <div className="container mx-auto px-4 py-2 text-center">
        <div className="mb-2 text-sm">
          <img src="/logo.svg" alt="10xCards Logo" className="inline-block h-8 w-8 mr-1 align-middle" />
          <span className="font-bold text-sm">10xCards</span>
          <span className="text-muted-foreground"> — Twoje notatki, Twoje fiszki, Twoja wiedza.</span>
          <span className="text-muted-foreground">
            © 2025 10xCards. Udostępniono na licencji{" "}
            <a
              href="https://opensource.org/license/mit"
              className="underline hover:text-primary transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              MIT
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-card border-t border-border py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Invoice.OS. All rights reserved.</span>
        <span>
          Built with <a href="https://aptos.dev/" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">Aptos</a>
        </span>
      </div>
    </footer>
  );
}
import { WalletSelector } from "./WalletSelector";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto w-full flex-wrap">
      <h1 className="display">Boilerplate Template</h1>

      <div className="flex gap-2 items-center flex-wrap">
        <ThemeToggle />
        <WalletSelector />
      </div>
    </div>
  );
}

import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { ModeToggle } from "../ui/theme-toggle";

export function Navbar() {
  return (
    <nav className="w-full h-16 flex items-center px-4 justify-between">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <h1 className="text-2xl font-bold">
            Next
            <span className="text-blue-500">Pro</span>
          </h1>
        </Link>

        <div>
          <Link href="/" className={buttonVariants({ variant: "ghost" })}>
            Home
          </Link>
          <Link href="/about" className={buttonVariants({ variant: "ghost" })}>
            About
          </Link>
          <Link
            href="/contact"
            className={buttonVariants({ variant: "ghost" })}
          >
            Contact
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Link href="/auth/sign-up" className={buttonVariants()}>
          Sign up
        </Link>
        <Link
          href="/auth/login"
          className={buttonVariants({ variant: "outline" })}
        >
          Login
        </Link>
        <ModeToggle/>
      </div>
    </nav>
  );
}

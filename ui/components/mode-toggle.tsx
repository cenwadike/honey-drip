"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
          className="relative flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 rounded-md"
        >
          {/* Sun icon (light mode) */}
          <Sun className="h-[1.4rem] w-[1.4rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          {/* Moon icon (dark mode) */}
          <Moon className="absolute h-[1.4rem] w-[1.4rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="min-w-[8rem] sm:min-w-[10rem] p-1"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-3 py-2 sm:py-1.5"
        >
          <Sun className="h-5 w-5" />
          <span className="text-sm sm:text-base">Light</span>
          {theme === "light" && (
            <span className="ml-auto text-xs sm:text-sm">✓</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-3 py-2 sm:py-1.5"
        >
          <Moon className="h-5 w-5" />
          <span className="text-sm sm:text-base">Dark</span>
          {theme === "dark" && (
            <span className="ml-auto text-xs sm:text-sm">✓</span>
          )}
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-3 py-2 sm:py-1.5"
        >
          <Monitor className="h-5 w-5" />
          <span className="text-sm sm:text-base">System</span>
          {theme === "system" && (
            <span className="ml-auto text-xs sm:text-sm">✓</span>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

"use client";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function MainNav() {
  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <img src="/logo.svg" alt="10xCards Logo" className="h-9 w-9" />
            <span className="font-bold">10xCards</span>
          </a>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavigationMenuLink href="/" className={navigationMenuTriggerStyle()}>
                        Strona główna
                      </NavigationMenuLink>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Przejdź do strony głównej</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavigationMenuLink href="/topics" className={navigationMenuTriggerStyle()}>
                        Fiszki
                      </NavigationMenuLink>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Przeglądaj i zarządzaj fiszkami</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavigationMenuLink href="/sessions" className={navigationMenuTriggerStyle()}>
                        Sesje nauki
                      </NavigationMenuLink>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rozpocznij sesję nauki z fiszkami</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <NavigationMenuLink href="/statistics" className={navigationMenuTriggerStyle()}>
                        Statystyki
                      </NavigationMenuLink>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zobacz swoje postępy w nauce</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="ml-auto flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <a href="/profile">Profil</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/settings">Ustawienia</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="/logout">Wyloguj</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { GearIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { set } from "zod";
import UsernameForm from "./username-form";
import EditUsernameForm from "./edit-username-form";
import PullModel from "./pull-model";
import useChatStore from "@/app/hooks/useChatStore";

interface UserSettingsProps {
  showPullModel?: boolean;
}

export default function UserSettings({ showPullModel = true }: UserSettingsProps) {
  const [open, setOpen] = useState(false);
  const userName = useChatStore((state) => state.userName);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex justify-start gap-4 w-full h-20 xl:h-24 text-lg xl:text-xl font-semibold items-center px-4 py-3"
        >
          <Avatar className="flex justify-start items-center overflow-hidden h-14 w-14 xl:h-16 xl:w-16">
            <AvatarImage
              src="/user.jpg"
              alt="User"
              width={64}
              height={64}
              className="object-cover h-14 w-14 xl:h-16 xl:w-16 border-2 border-primary"
            />
            <AvatarFallback className="text-xl xl:text-2xl">
              {(userName && userName !== "Anonymous" ? userName : "Khách")
                .substring(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start justify-center min-w-0">
            <p className="text-base xl:text-lg font-bold truncate max-w-[120px] xl:max-w-[160px]">
              {userName && userName !== "Anonymous" ? userName : "Khách"}
            </p>
            <span className="text-xs xl:text-sm text-muted-foreground font-normal">
              Tài khoản
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-3">
        {/* Không còn PullModel */}
        <Dialog>
          <DialogTrigger className="w-full">
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <div className="flex w-full gap-2 p-1 items-center cursor-pointer">
                <GearIcon className="w-5 h-5" />
                Cài đặt
              </div>
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="space-y-4">
              <DialogTitle>Cài đặt</DialogTitle>
              <EditUsernameForm setOpen={setOpen} />
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import React, { useEffect } from "react";
import { ChatProps } from "./chat";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import TextareaAutosize from "react-textarea-autosize";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross2Icon,
  ImageIcon,
  PaperPlaneIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import { Mic, SendHorizonal } from "lucide-react";
import MultiImagePicker from "../image-embedder";
import useChatStore from "@/app/hooks/useChatStore";
import Image from "next/image";
import { ChatRequestOptions, Message } from "ai";
import { ChatInput } from "../ui/chat/chat-input";

interface ChatBottombarProps {
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>,
    chatRequestOptions?: ChatRequestOptions
  ) => void;
  isLoading: boolean;
  stop: () => void;
  setInput?: React.Dispatch<React.SetStateAction<string>>;
  input: string;
}

export default function ChatBottombar({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  setInput,
}: ChatBottombarProps) {
  const inputRef = React.useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      console.log("Input focused");
    }
  }, [inputRef]);

  return (
    <div className="px-4 pb-7 flex justify-center w-full items-center relative ">
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center bg-accent dark:bg-card rounded-2xl shadow-md border border-border focus-within:ring-2 focus-within:ring-primary/40 transition-all duration-200 min-h-[72px]"
        style={{ overflow: "hidden", borderRadius: "1rem", paddingRight: 0 }}
      >
        <div className="flex-1 flex">
          <ChatInput
            value={input}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name="message"
            placeholder="Ngày mới vui vẻ..."
            className="w-full resize-none bg-transparent border-none px-6 py-6 text-lg focus:outline-none focus:ring-0 focus:shadow-none placeholder:text-muted-foreground rounded-none"
            style={{
              boxShadow: "none",
              border: "none",
              background: "transparent",
              borderRadius: 0,
              outline: "none",
              marginRight: 0,
              fontSize: "1.25rem", // 20px
            }}
          />
        </div>
        <Button
          className="ml-2 rounded-full h-14 w-14 flex items-center justify-center text-xl bg-transparent text-primary shadow-none hover:bg-primary/10 transition-all duration-200 border-none"
          variant="ghost"
          size="icon"
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{ border: "none", boxShadow: "none" }}
        >
          <SendHorizonal className="w-7 h-7" />
        </Button>
      </form>
    </div>
  );
}

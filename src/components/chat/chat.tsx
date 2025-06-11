"use client";

import ChatTopbar from "./chat-topbar";
import ChatList from "./chat-list";
import ChatBottombar from "./chat-bottombar";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { BytesOutputParser } from "@langchain/core/output_parsers";
import { Attachment, ChatRequestOptions, generateId } from "ai";
import { Message, useChat } from "ai/react";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import useChatStore from "@/app/hooks/useChatStore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export interface ChatProps {
  id: string;
  initialMessages: Message[] | [];
  isMobile?: boolean;
}

export default function Chat({ initialMessages, id, isMobile }: ChatProps) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    setMessages,
    setInput,
    reload,
  } = useChat({
    id,
    initialMessages,
    onResponse: (response) => {
      if (response) {
        setLoadingSubmit(false);
      }
    },
    onFinish: (message) => {
      const savedMessages = getMessagesById(id);
      saveMessages(id, [...savedMessages, message]);
      setLoadingSubmit(false);
      router.replace(`/c/${id}`);
    },
    onError: (error) => {
      setLoadingSubmit(false);
      router.replace("/");
      console.error(error.message);
      console.error(error.cause);
    },
  });
  const [loadingSubmit, setLoadingSubmit] = React.useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const base64Images = useChatStore((state) => state.base64Images);
  const setBase64Images = useChatStore((state) => state.setBase64Images);
  const selectedModel = useChatStore((state) => state.selectedModel);
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getMessagesById = useChatStore((state) => state.getMessagesById);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.history.replaceState({}, "", `/c/${id}`);

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
    };

    setLoadingSubmit(true);

    // Gửi message tới API backend sample
    try {
      const response = await fetch("https://your-backend-api.com/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          images: base64Images || [],
        }),
      });
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      // Giả sử API trả về { reply: string }
      const aiMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: data.reply,
      };
      saveMessages(id, [...messages, userMessage, aiMessage]);
      setMessages([...messages, userMessage, aiMessage]);
    } catch (error) {
      toast.error("API error: " + (error as Error).message);
    } finally {
      setLoadingSubmit(false);
      setBase64Images(null);
      setInput("");
    }
  };

  const removeLatestMessage = () => {
    const updatedMessages = messages.slice(0, -1);
    setMessages(updatedMessages);
    saveMessages(id, updatedMessages);
    return updatedMessages;
  };

  const handleStop = () => {
    stop();
    saveMessages(id, [...messages]);
    setLoadingSubmit(false);
  };

  return (
    <div className="flex flex-col w-full max-w-3xl h-full">
      <ChatTopbar
        isLoading={isLoading}
        chatId={id}
        messages={messages}
        setMessages={setMessages}
      />

      {messages.length === 0 ? (
        <div className="flex flex-col h-full w-full items-center gap-4 justify-center">
          <Image
            src="/Logo_DAI_NAM.png"
            alt="AI"
            width={80}
            height={80}
            className="h-24 w-24 xl:h-28 xl:w-28 object-contain dark:invert"
          />
          <p className="text-center text-xl xl:text-2xl font-semibold text-muted-foreground">
            Hôm nay bạn cần mình trợ giúp điều gì ?
          </p>
          <ChatBottombar
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            isLoading={isLoading}
            stop={handleStop}
            setInput={setInput}
          />
        </div>
      ) : (
        <>
          <ChatList
            messages={messages}
            isLoading={isLoading}
            loadingSubmit={loadingSubmit}
            reload={async () => {
              removeLatestMessage();

              const requestOptions: ChatRequestOptions = {};

              setLoadingSubmit(true);
              return reload(requestOptions);
            }}
          />
          <ChatBottombar
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={onSubmit}
            isLoading={isLoading}
            stop={handleStop}
            setInput={setInput}
          />
        </>
      )}
    </div>
  );
}

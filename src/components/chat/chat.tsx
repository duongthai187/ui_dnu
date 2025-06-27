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
import Auth from '../../Auth';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import firebaseApp from '../../firebase';



export interface ChatProps {
  id: string;
  initialMessages: Message[] | [];
  isMobile?: boolean;
}

export default function Chat({ initialMessages, id, isMobile }: ChatProps) {
  // Đã vô hiệu hóa kiểm tra đăng nhập/đăng ký, luôn cho phép vào chat
  type StreamCallback = (chunk: string) => void;
  type FinishCallback = () => void;

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
  const saveMessages = useChatStore((state) => state.saveMessages);
  const getMessagesById = useChatStore((state) => state.getMessagesById);
  const router = useRouter();
  const userName = useChatStore((state) => state.userName);

  async function streamChatMessage({
    userInput,
    onMessage,
    onFinish,
    onError,
  }: {
    userInput: string;
    onMessage: StreamCallback;
    onFinish: FinishCallback;
    onError: (err: any) => void;
  }) {
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: userInput, user_name: userName }),
      });

      if (!response.body) throw new Error("No streaming body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          onFinish();
          break;
        }
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop()!; // giữ lại phần chưa hoàn chỉnh

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;

          try {
            const json = JSON.parse(line.slice(6));
            if (json.event === "message") {
              onMessage(json.answer);
            } else if (json.event === "message_end") {
              onFinish();
            }
          } catch {}
        }
      }
    } catch (err) {
      onError(err);
    }
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSubmit(true);

    const trimmedInput = input.trim();
    setInput(""); // Reset input

    if (!trimmedInput) {
      toast.error("Vui lòng nhập nội dung trước khi gửi!");
      setLoadingSubmit(false);
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: trimmedInput,
    };

    setMessages([...messages, userMessage]);

    const assistantId = generateId();
    let currentContent = "";

    streamChatMessage({
      userInput: trimmedInput, // Sử dụng giá trị đã lưu
      onMessage: (chunk) => {
        currentContent += chunk;

        const update_message: Message = {
          id: assistantId,
          role: "assistant",
          content: currentContent,
        };

        const updatedMessages = [...messages, userMessage, update_message];
        setMessages(updatedMessages);
      },
      onFinish: () => {
        saveMessages(id, [...messages, userMessage, {
          id: assistantId,
          role: "assistant",
          content: currentContent,
        }]);
        setLoadingSubmit(false);
        setBase64Images(null);
      },
      onError: (err) => {
        toast.error("Streaming error: " + err.message);
        setLoadingSubmit(false);
      }
    });
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
    <div className="flex flex-col w-full max-w-7xl h-full">
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
            width={240}
            height={240}
            className="h-48 w-48 xl:h-96 xl:w-96 object-contain"
          />
          <p className="text-center text-2xl xl:text-3xl font-semibold text-muted-foreground">
            Hãy hỏi Viện Công nghệ Tài chính bất cứ điều gì bạn muốn.
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

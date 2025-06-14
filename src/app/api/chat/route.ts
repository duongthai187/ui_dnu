// import { createOllama } from 'ollama-ai-provider';
// import { streamText, convertToCoreMessages, CoreMessage, UserContent } from 'ai';

// export const runtime = "edge";
// export const dynamic = "force-dynamic";

// export async function POST(req: Request) {
//   // Destructure request data
//   const { messages, selectedModel, data } = await req.json();

//   const ollamaUrl = process.env.OLLAMA_URL;

//   const initialMessages = messages.slice(0, -1); 
//   const currentMessage = messages[messages.length - 1]; 

//   const ollama = createOllama({baseURL: ollamaUrl + "/api"});

//   // Build message content array directly
//   const messageContent: UserContent = [{ type: 'text', text: currentMessage.content }];

//   // Add images if they exist
//   data?.images?.forEach((imageUrl: string) => {
//     const image = new URL(imageUrl);
//     messageContent.push({ type: 'image', image });
//   });

//   // Stream text using the ollama model
//   const result = await streamText({
//     model: ollama(selectedModel),
//     messages: [
//       ...convertToCoreMessages(initialMessages),
//       { role: 'user', content: messageContent },
//     ],
//   });

//   return result.toDataStreamResponse();
// }


// app/api/stream-chat/route.ts
export const dynamic = "force-dynamic"; // không cache, keep streaming

export async function POST(req: Request) {
  console.log("Received request for chat stream");
  const { input } = await req.json();
  const apiKey = process.env.API_DIFY_KEY!;
  const res = await fetch(`${process.env.BASE_URL}/chat-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: input,
      inputs: { user_name: "Khách" },
      response_mode: "streaming",
      user: "anonymous",
      conversation_id: "",
    }),
  });

  const encoder = new TextEncoder();
  const reader = res.body!.getReader();

  return new Response(
    new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      },
    }),
    {
      status: res.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Content-Encoding": "none",
      },
    }
  );
}

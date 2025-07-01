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


export const dynamic = "force-dynamic"; // không cache, keep streaming

export async function POST(req: Request) {
  const { input, user_name, conversation_id } = await req.json(); // Nhận conversation_id từ client
  const apiKey = process.env.API_DIFY_KEY!;
  const res = await fetch(`${process.env.BASE_URL}/chat-messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      query: input,
      inputs: { user_name: user_name ? user_name : "Khách" },
      response_mode: "streaming",
      user: "anonymous",
      conversation_id: conversation_id || "", // Gửi conversation_id từ client nếu có
    }),
  });

  const encoder = new TextEncoder();
  const reader = res.body!.getReader();

  return new Response(
    new ReadableStream({
      async start(controller) {
        let sentConversationId = false; // Đảm bảo chỉ gửi conversation_id một lần

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Trích xuất conversation_id từ phản hồi đầu tiên
          const text = new TextDecoder().decode(value);
          const match = text.match(/"conversation_id":\s*"([^"]+)"/);
          if (match && !sentConversationId) {
            const newConversationId = match[1];
            controller.enqueue(
              encoder.encode(`data: {"conversation_id": "${newConversationId}"}\n\n`)
            ); // Gửi conversation_id mới về client
            sentConversationId = true; // Đánh dấu đã gửi
          }

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

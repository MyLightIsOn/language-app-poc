import { openai } from "@/app/openai";

// Send a new message to a thread
export async function POST(
  request: { json: () => PromiseLike<{ content: never }> | { content: never } },
  { params: { threadId } }: never,
) {
  const { content } = await request.json();

  await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: content,
  });

  const stream = openai.beta.threads.runs.stream(threadId, {
    assistant_id: process.env.OPENAI_ASSISTANT_ID || "",
  });

  return new Response(stream.toReadableStream());
}

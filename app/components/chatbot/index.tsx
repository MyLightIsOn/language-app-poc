"use client";

import { useEffect, useState } from "react";

export default function Chatbot() {
  const [threadId, setThreadId] = useState("");

  // create a new threadID when chat component created
  useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

  console.log(threadId);

  const sendMessage = async (text) => {
    console.log(text);
  };

  const handleSubmitQuestion = (e: React.UIEvent<HTMLButtonElement>) => {
    console.log(e);

    sendMessage(e);
  };

  return (
    <>
      <button onClick={(e) => handleSubmitQuestion(e)} type="submit">
        Start
      </button>
    </>
  );
}

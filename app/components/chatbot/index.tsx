"use client";

import { useEffect, useState } from "react";
import { AssistantStream } from "openai/lib/AssistantStream";
import Message from "@/app/components/chatbot/messages";

export default function Chatbot() {
  const [threadId, setThreadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [questionReload, setQuestionReload] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedTopic, setSelectedTopic] = useState("Food");

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

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path") {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`,
          );
        }
      });
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    stream.on("event", (event) => {
      if (event.event === "thread.run.completed") setLoading(false);
    });
  };

  const sendMessage = async (text) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      },
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmitQuestion = (e: React.UIEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    const requestQuestion = `Give me a test question from HSK level ${selectedLevel} about ${selectedTopic}.`;
    sendMessage(requestQuestion);
    setQuestionReload(true);
  };

  return (
    <div className={"chatbot-container"}>
      {!loading &&
        messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}

      {loading && (
        <div className={"ldsRipple"}>
          <div></div>
          <div></div>
        </div>
      )}

      {!questionReload && (
        <button
          className={"start"}
          onClick={(e) => handleSubmitQuestion(e)}
          type="submit"
        >
          Start
        </button>
      )}
    </div>
  );
}

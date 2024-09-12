"use client";

import { useEffect, useState } from "react";
import { AssistantStream } from "openai/lib/AssistantStream";
import Message, { MessageInterface } from "@/app/components/chatbot/messages";
import { Threads } from "openai/resources/beta/threads/index";
import { AnnotationDelta } from "openai/resources/beta/threads/index";

export default function Chatbot() {
  const [threadId, setThreadId] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<MessageInterface[]>([]);
  const [questionReload, setQuestionReload] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedLevel, setSelectedLevel] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedTopic, setSelectedTopic] = useState("Food");
  const [canRestart, setCanRestart] = useState(false);

  const levels = [
    {
      level: 1,
      title: "newbie",
    },
    {
      level: 2,
      title: "beginner",
    },
    {
      level: 3,
      title: "beginner",
    },
    {
      level: 4,
      title: "intermediate",
    },
    {
      level: 5,
      title: "advanced",
    },
    {
      level: 6,
      title: "advanced",
    },
  ];

  const topics = ["Food", "Work", "Travel", "Dinosours"];

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

  const appendToLastMessage = (text: string) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role: string, text: string) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations: AnnotationDelta[]) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === "file_path" && annotation.text) {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path?.file_id}`,
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
  const handleTextDelta = (delta: Threads.TextDelta) => {
    if (delta.value != null) {
      appendToLastMessage(delta?.value);
    }
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };
  //delta: TextDelta, snapshot: Text
  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    stream.on("event", (event) => {
      if (event.event === "thread.run.completed") setLoading(false);
      if (event.event === "thread.run.completed") setCanRestart(true);
    });
  };

  const sendMessage = async (text: string) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      },
    );
    if (response.body) {
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    }
  };

  const handleSubmitQuestion = (e: React.UIEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setCanRestart(false);
    setLoading(true);
    const requestQuestion = `Give me a test question from HSK level ${selectedLevel} about ${selectedTopic}.`;
    sendMessage(requestQuestion);
    setQuestionReload(true);
  };

  const message = messages[messages.length - 1];

  return (
    <div className={"chatbot-container"}>
      {!loading && message && (
        <Message
          key={message.text.substring(0, 5)}
          role={message.role}
          text={message.text}
        />
      )}

      {!loading && canRestart && (
        <button
          className={
            "bg-selected border border-selected text-white p-5 hover:border-black hover:bg-white hover:text-black"
          }
          onClick={(e) => handleSubmitQuestion(e)}
        >
          Reset Question
        </button>
      )}

      {loading && (
        <>
          <p className={"absolute text-lg top-52 w-full text-center font-bold"}>
            Generating Question...
          </p>
          <div className={"ldsRipple"}>
            <div></div>
            <div></div>
          </div>
        </>
      )}

      {!questionReload && (
        <>
          <button
            className={"start"}
            onClick={(e) => handleSubmitQuestion(e)}
            type="submit"
          >
            Start
          </button>
          <div>
            <div className={"flex w-fit gap-1 mx-auto mb-5"}>
              {levels.map((level) => (
                <button
                  className={`level-select ${level.level === selectedLevel ? `level-selected` : ""}`}
                  key={`${level.level}-${level.title}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedLevel(level.level);
                  }}
                >
                  {level.level}
                </button>
              ))}
            </div>
            <div
              className={
                "flex w-fit gap-1 mx-auto mb-5 justify-around flex-col"
              }
            >
              {topics.map((topic) => (
                <button
                  className={`level-select ${topic === selectedTopic ? `level-selected` : ""}`}
                  key={`${topic}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedTopic(topic);
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

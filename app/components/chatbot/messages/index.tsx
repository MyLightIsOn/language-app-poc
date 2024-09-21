export interface MessageInterface {
  role: string;
  text: string;
}

const UserMessage = ({ text }: { text: string }) => {
  return <div>{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  const markup = { __html: text };
  return (
    <>
      <div className={"agent"} dangerouslySetInnerHTML={markup} />
      <span className={"note"}>
        ** Answer buttons are not hooked up yet. Right now, I am testing the
        variety of outputs from the AI.
      </span>
    </>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageInterface) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

export default Message;

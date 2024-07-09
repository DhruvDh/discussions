import { createSignal, ParentComponent } from "solid-js";

type ChatInputProps = {
  currentQuestionAnswered: boolean;
  onSendMessage: (message: string) => void;
};

const ChatInput: ParentComponent<ChatInputProps> = (props) => {
  const [userInput, setUserInput] = createSignal("");

  const sendMessage = () => {
    if (userInput().trim() !== "") {
      props.onSendMessage(userInput().trim());
      setUserInput("");
    }
  };

  return (
    <div
      class="m-6 justify-content-center flex bg-slate-100 rounded-3xl join"
      style={{
        "background-color":
          "oklch(var(--btn-color, var(--b2)) / var(--tw-bg-opacity))",
      }}
    >
      <textarea
        value={userInput()}
        onInput={(e) => setUserInput(e.currentTarget.value)}
        class="textarea w-full ml-3 mt-3 mb-3 rounded-l-3xl"
        placeholder={
          props.currentQuestionAnswered
            ? "This question has been marked as answered."
            : "Please enter response here..."
        }
        disabled={props.currentQuestionAnswered}
      />
      <button
        class="btn btn-neutral mr-3 mt-3 mb-3 rounded-r-3xl min-h-20"
        disabled={props.currentQuestionAnswered}
        onClick={sendMessage}
      >
        <span class="pi pi-send" />
      </button>
    </div>
  );
};

export default ChatInput;

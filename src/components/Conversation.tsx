import { For, Show } from "solid-js";
import Message from "./Message.tsx";

interface ConversationMessage {
  timestamp: number;
  content: string;
  role: "assistant" | "user";
}

interface ConversationProps {
  messages: ConversationMessage[];
}

export const Conversation = (props: ConversationProps) => {
  return (
    <div class="ml-6 mr-6 mb-6 overflow-y-auto h-[75svh]">
      <For each={props.messages}>
        {(message) => (
          <Show when={message} fallback={<></>}>
            <Message
              msg={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          </Show>
        )}
      </For>
    </div>
  );
};

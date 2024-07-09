import { createMemo, ParentComponent } from "solid-js";
import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";
import { formatDistanceToNow } from "date-fns";

type MessageProps = {
  msg: string;
  role: "assistant" | "user";
  timestamp: string;
};

const Message: ParentComponent<MessageProps> = (props) => {
  const htmlContent = createMemo(() => {
    if (!props.msg) return "";
    if (props.msg === '<span class="loading loading-dots loading-md"></span>')
      return props.msg;

    return micromark(props.msg, {
      extensions: [gfm()],
      htmlExtensions: [gfmHtml()],
    });
  });

  return (
    <div
      class={props.role === "assistant" ? "chat chat-start" : "chat chat-end"}
    >
      {props.role !== "assistant" && (
        <div class="chat-header ml-3 mr-3 mb-2">
          You
          <time class="text-xs opacity-50">
            {formatDistanceToNow(props.timestamp, { addSuffix: true })}
          </time>
        </div>
      )}
      {props.role === "assistant" ? (
        <article class="prose" innerHTML={htmlContent()} />
      ) : (
        <div
          class="chat-bubble chat-end bg-amber-100 text-gray-950"
          innerHTML={htmlContent()}
        />
      )}
    </div>
  );
};

export default Message;

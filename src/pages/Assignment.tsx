import { useParams } from "@solidjs/router";
import toast, { Toaster } from "solid-toast";
import { cid, fetchAssignments, userInstitution } from "../index.tsx";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from "solid-js";
import { TopMenu } from "../components/TopMenu.tsx";
import { Conversation } from "../components/Conversation.tsx";
import ChatInput from "../components/ChatInput.tsx";

const Assignment = () => {
  const params = useParams();

  const [assignments, { refetch: refetchAssignments }] = createResource(() => {
    const institutionId = userInstitution()?.id;
    const courseId = cid();
    return institutionId && courseId ? [institutionId, courseId] : null;
  }, fetchAssignments);

  createEffect(() => {
    if (assignments.error) {
      toast.error("Failed to fetch assignments");
    }
  });

  createEffect(() => {
    refetchAssignments();
  });

  const assignmentName = createMemo(
    () =>
      assignments()?.find((a) => a.id === params.assignmentID)?.moduleName ||
      "Loading..."
  );

  // New signals and functions for child components
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [messages, setMessages] = createSignal<
    Array<{ id: string; content: string; role: "assistant" | "user" }>
  >([]);
  const [currentQuestionAnswered, setCurrentQuestionAnswered] =
    createSignal(false);

  const handleRefresh = () => {
    setLoading(true);
    refetchAssignments().then(() => {
      setLoading(false);
    });
  };

  const handleSendMessage = (message: string) => {
    setMessages([
      ...messages(),
      { id: Date.now().toString(), content: message, role: "user" },
    ]);
    // Here you would typically send the message to your backend and wait for a response
    // For now, we'll just add a dummy response
    setTimeout(() => {
      setMessages([
        ...messages(),
        {
          id: (Date.now() + 1).toString(),
          content: "This is a response from the assistant.",
          role: "assistant",
        },
      ]);
    }, 1000);
  };

  createEffect(() => {
    if (assignments.loading) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  });

  return (
    <>
      <Toaster />
      <TopMenu
        loading={loading()}
        error={error()}
        selectedModuleDataReady={!assignments.loading}
        moduleName={assignmentName()}
        onRefresh={handleRefresh}
      />
      <Conversation messages={messages()} />
      <ChatInput
        currentQuestionAnswered={currentQuestionAnswered()}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default Assignment;

import { useParams } from "@solidjs/router";
import toast, { Toaster } from "solid-toast";
import { cid, fetchAssignments, supabase, userInstitution } from "../index.tsx";
import {
  createEffect,
  createMemo,
  createResource,
  createSignal,
} from "solid-js";
import { TopMenu } from "../components/TopMenu.tsx";
import { Conversation } from "../components/Conversation.tsx";
import ChatInput from "../components/ChatInput.tsx";
import { createStore } from "solid-js/store/types/server.js";

interface Question {
  id: string;
  goal: string;
  question_text: string;
  answer: string;
  assignmentID: string;
  difficulty: "easy" | "medium" | "hard";
  metadata: string;
}

interface QuestionState extends Question {
  isAnswered: boolean;
  conversation: Array<{
    id: string;
    content: string;
    role: "assistant" | "user";
  }>;
}

interface AssignmentState {
  questions: QuestionState[];
  assignmentStarted: boolean;
  selectedAssignmentID: string;
  currentQuestionIndex: number;
}

const fetchSystemMessage = async (assignmentID) => {
  if (!assignmentID) {
    console.error("No assignment ID provided");
    // @ts-ignore
    toast.error("No assignment ID provided");
  }

  const { data, error } = await supabase
    .from("systemMessages")
    .select("*")
    .eq("id", assignmentID);

  if (error) throw error;

  return data[0];
};

const Assignment = () => {
  const params = useParams();

  const [assignments, { refetch: refetchAssignments }] = createResource(() => {
    const institutionId = userInstitution()?.id;
    const courseId = cid();
    return institutionId && courseId ? [institutionId, courseId] : null;
  }, fetchAssignments);

  const [systemMessage] = createResource(
    () => params.assignmentID,
    fetchSystemMessage
  );

  createEffect(() => {
    if (assignments.error) {
      // @ts-ignore
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
  const totalQuestions = createMemo(
    () =>
      assignments()?.find((a) => a.id === params.assignmentID)
        ?.totalNumberOfQuestions || 0
  );
  const state = createStore<AssignmentState>({
    questions: [],
    selectedAssignmentID: params.assignmentID,
    assignmentStarted: false,
    currentQuestionIndex: 0,
  });

  // New signals and functions for child components
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

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

  const handleStartAssignment = () => {
    setAssignmentStarted(true);
    // Add logic for starting the assignment
  };

  const handleResetSession = () => {
    // Add logic for resetting the session
  };

  const handlePreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(totalQuestions() - 1, prev + 1));
  };

  const handleMarkAsAnswered = () => {
    setTotalQuestionsAnswered((prev) => prev + 1);
    setCurrentQuestionAnswered(true);
  };

  const handleSubmitAssignment = () => {
    // Add logic for submitting the assignment
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
        selectedAssignmentDataReady={!assignments.loading}
        assignmentName={assignmentName()}
        currentQuestionIndex={currentQuestionIndex()}
        totalQuestions={totalQuestions()}
        totalQuestionsAnswered={totalQuestionsAnswered()}
        assignmentStarted={assignmentStarted()}
        onStartAssignment={handleStartAssignment}
        onResetSession={handleResetSession}
        onPreviousQuestion={handlePreviousQuestion}
        onNextQuestion={handleNextQuestion}
        onMarkAsAnswered={handleMarkAsAnswered}
        onSubmitAssignment={handleSubmitAssignment}
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

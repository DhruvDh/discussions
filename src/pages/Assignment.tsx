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
import { createStore } from "solid-js/store";
import { produce } from "solid-js/store";

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
  totalQuestionsAnswered: number;
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

  const [state, setState] = createStore<AssignmentState>({
    questions: [],
    assignmentStarted: false,
    selectedAssignmentID: params.assignmentID,
    currentQuestionIndex: 0,
    totalQuestionsAnswered: 0,
  });

  // New signals and functions for child components
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  const handleSendMessage = (message: string) => {
    setState(
      produce((s) => {
        const currentQuestion = s.questions[s.currentQuestionIndex];
        if (currentQuestion) {
          currentQuestion.conversation.push({
            id: Date.now().toString(),
            content: message,
            role: "user",
          });
        } else {
          console.error("No current question found");
          // @ts-ignore
          toast.error("No current question found");
        }
      })
    );

    // Simulated response (replace with actual API call)
    setTimeout(() => {
      setState(
        produce((s) => {
          const currentQuestion = s.questions[s.currentQuestionIndex];
          if (currentQuestion) {
            currentQuestion.conversation.push({
              id: (Date.now() + 1).toString(),
              content: "This is a response from the assistant.",
              role: "assistant",
            });
          } else {
            console.error("No current question found");
            // @ts-ignore
            toast.error("No current question found");
          }
        })
      );
    }, 1000);
  };

  const handleStartAssignment = () => {
    setState("assignmentStarted", true);
  };

  const handleResetSession = () => {
    setState(
      produce((s) => {
        s.questions = [];
        s.currentQuestionIndex = 0;
        s.totalQuestionsAnswered = 0;
        s.assignmentStarted = false;
      })
    );
  };

  const handlePreviousQuestion = () => {
    setState("currentQuestionIndex", (prev) => Math.max(0, prev - 1));
  };

  const handleNextQuestion = () => {
    setState("currentQuestionIndex", (prev) =>
      Math.min(totalQuestions() - 1, prev + 1)
    );
  };

  const handleMarkAsAnswered = () => {
    setState(
      produce((s) => {
        s.totalQuestionsAnswered++;
        if (s.questions[s.currentQuestionIndex]) {
          s.questions[s.currentQuestionIndex].isAnswered = true;
        }
      })
    );
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

  createEffect(() => {
    if (assignments.error) {
      // @ts-ignore
      toast.error("Failed to fetch assignments");
    }
  });

  createEffect(() => {
    refetchAssignments();
  });

  return (
    <>
      <Toaster />
      <TopMenu
        loading={loading()}
        error={error()}
        selectedAssignmentDataReady={!assignments.loading}
        assignmentName={assignmentName()}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={totalQuestions()}
        totalQuestionsAnswered={state.totalQuestionsAnswered}
        assignmentStarted={state.assignmentStarted}
        onStartAssignment={handleStartAssignment}
        onResetSession={handleResetSession}
        onPreviousQuestion={handlePreviousQuestion}
        onNextQuestion={handleNextQuestion}
        onMarkAsAnswered={handleMarkAsAnswered}
        onSubmitAssignment={handleSubmitAssignment}
      />
      <Conversation
        messages={
          state.questions[state.currentQuestionIndex]?.conversation || []
        }
      />
      <ChatInput
        currentQuestionAnswered={
          state.questions[state.currentQuestionIndex]?.isAnswered || false
        }
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default Assignment;

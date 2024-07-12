import { useParams } from "@solidjs/router";
import toast, { Toaster } from "solid-toast";
import { supabase, updateUserSession } from "../index.tsx";
import { createEffect, createMemo, createResource, onMount } from "solid-js";
import { TopMenu } from "../components/TopMenu.tsx";
import { Conversation } from "../components/Conversation.tsx";
import ChatInput from "../components/ChatInput.tsx";
import { createStore, produce } from "solid-js/store";

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
  isAsked: boolean;
  conversation: Array<{
    content: string;
    role: "assistant" | "user";
    timestamp: number;
  }>;
}

interface PersistentData {
  assignmentID: string;
  assignmentName: string;
  questions: Question[];
  systemMessage: string;
  totalQuestions: number;
}

interface AssignmentState {
  assignmentStarted: boolean;
  currentQuestionIndex: number;
  questionStates: QuestionState[];
}

const fetchAssignment = async (assignmentID: string) => {
  const { data, error } = await supabase
    .from("assignments")
    .select("id, moduleName, totalNumberOfQuestions")
    .eq("id", assignmentID)
    .single();

  if (error) throw error;
  return data;
};

const fetchQuestions = async (assignmentID: string) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("assignmentID", assignmentID);

  if (error) throw error;
  return data;
};

const fetchSystemMessage = async (assignmentID: string) => {
  const { data, error } = await supabase
    .from("systemMessages")
    .select("content")
    .filter("assignmentIDs", "cs", `"${assignmentID}"`);

  if (error) throw error;
  if (!data || data.length === 0)
    return "No system message found for this assignment.";
  return data[0].content;
};

const fetchAIResponse = async (
  conversation: Array<{ role: string; content: string }>,
  systemMessage: string
) => {
  const messages = [
    { role: "system", content: systemMessage },
    ...conversation.map(({ role, content }) => ({ role, content })),
  ];

  const response = await fetch("https://dhruvdh-groq-deno.deno.dev/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0]?.text || data.choices[0].message.content;
};

const generateSystemMessage = (
  baseSystemMessage: string,
  question: QuestionState,
  questionIndex: number,
  totalQuestions: number
) => {
  return `${baseSystemMessage}

- Current question: ${question.question_text}
- Goal: ${question.goal}
- Difficulty: ${question.difficulty}
- Question ${questionIndex + 1} of ${totalQuestions}

Additional context: ${question.metadata}`;
};

const Assignment = () => {
  updateUserSession();
  const params = useParams();

  const [state, setState] = createStore<AssignmentState>({
    assignmentStarted: false,
    currentQuestionIndex: 0,
    questionStates: [],
  });

  const [persistentData, setPersistentData] = createStore<PersistentData>({
    assignmentID: params.assignmentID,
    assignmentName: "",
    questions: [],
    systemMessage: "",
    totalQuestions: 0,
  });

  const [assignment] = createResource(
    () => params.assignmentID,
    fetchAssignment
  );
  const [questions] = createResource(() => params.assignmentID, fetchQuestions);
  const [systemMessage] = createResource(
    () => params.assignmentID,
    fetchSystemMessage
  );

  createEffect(() => {
    if (assignment()) {
      setPersistentData({
        assignmentName: assignment()!.moduleName,
        totalQuestions: assignment()!.totalNumberOfQuestions,
      });
    }
  });

  createEffect(() => {
    if (questions()) {
      setPersistentData("questions", questions()!);

      // Initialize questionStates based on fetched questions
      setState(
        "questionStates",
        questions()!.map((q) => ({
          ...q,
          isAnswered: false,
          conversation: [],
        }))
      );
    }
  });

  createEffect(() => {
    if (systemMessage()) {
      setPersistentData("systemMessage", systemMessage()!);
    }
  });

  createEffect(() => {
    if (questions()) {
      const allQuestions = questions()!;
      const totalQuestions =
        assignment()?.totalNumberOfQuestions || persistentData.totalQuestions;

      // Shuffle the questions
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());

      // Select questions based on difficulty
      const easyQuestions = shuffled
        .filter((q) => q.difficulty === "easy")
        .slice(0, Math.ceil(totalQuestions / 3));
      const mediumQuestions = shuffled
        .filter((q) => q.difficulty === "medium")
        .slice(0, Math.ceil(totalQuestions / 3));
      const hardQuestions = shuffled
        .filter((q) => q.difficulty === "hard")
        .slice(0, Math.ceil(totalQuestions / 3));

      const selectedQuestions = [
        ...easyQuestions,
        ...mediumQuestions,
        ...hardQuestions,
      ].slice(0, totalQuestions);

      setPersistentData("questions", selectedQuestions);
      setPersistentData("totalQuestions", selectedQuestions.length);

      setState(
        "questionStates",
        selectedQuestions.map((q) => ({
          ...q,
          isAnswered: false,
          conversation: [],
        }))
      );
    }
  });
  const showPlaceholderMessage = () => {
    setState(
      produce((s) => {
        s.questionStates[s.currentQuestionIndex].conversation.push({
          content: '<span class="loading loading-dots loading-md"></span>',
          role: "assistant",
          timestamp: Date.now(),
        });
      })
    );
  };

  const hidePlaceholderMessage = () => {
    setState(
      produce((s) => {
        s.questionStates[s.currentQuestionIndex].conversation =
          s.questionStates[s.currentQuestionIndex].conversation.filter(
            (m) =>
              m.content !==
              '<span class="loading loading-dots loading-md"></span>'
          );
      })
    );
  };

  const currentQuestion = createMemo(
    () => state.questionStates[state.currentQuestionIndex] || null
  );

  const currentQuestionAnswered = createMemo(
    () => currentQuestion()?.isAnswered || false
  );

  const totalQuestionsAnswered = createMemo(
    () => state.questionStates.filter((q) => q.isAnswered).length
  );

  const loading = createMemo(
    () => assignment.loading || questions.loading || systemMessage.loading
  );

  const error = createMemo(
    () => assignment.error || questions.error || systemMessage.error
  );

  const askQuestion = () => {
    if (!systemMessage()) {
      // @ts-ignore
      toast.error(
        "Failed to fetch system message. Cannot start the assignment."
      );
      return;
    }

    if (!questions() || questions().length === 0) {
      // @ts-ignore
      toast.error(
        "Failed to fetch questions or no questions found. Cannot start the assignment."
      );
      return;
    }

    const currentQuestion = state.questionStates[state.currentQuestionIndex];
    if (currentQuestion && !currentQuestion.isAsked) {
      handleSendMessage("Please start following your instructions!").then(
        () => {
          setState(
            produce((s) => {
              s.questionStates[s.currentQuestionIndex].isAsked = true;
            })
          );
        }
      );
    }
  };

  const handleStartAssignment = () => {
    askQuestion();
    setState("assignmentStarted", true);
  };

  const handleNextQuestion = () => {
    if (!state?.assignmentStarted) {
      // @ts-ignore
      toast.error("Assignment not started. Please start the assignment first.");
      return;
    }

    if (state.currentQuestionIndex < persistentData.totalQuestions - 1) {
      setState("currentQuestionIndex", (prev) => prev + 1);
      askQuestion();
    } else {
      // @ts-ignore
      toast.error("You've reached the last question.");
    }
  };

  const handlePreviousQuestion = () => {
    if (!state?.assignmentStarted) {
      // @ts-ignore
      toast.error("Assignment not started. Please start the assignment first.");
      return;
    }

    if (state.currentQuestionIndex > 0) {
      setState("currentQuestionIndex", (prev) => prev - 1);
    } else {
      // @ts-ignore
      toast.error("You're already at the first question.");
    }
  };

  const handleMarkAsAnswered = () => {
    if (!state?.assignmentStarted) {
      // @ts-ignore
      toast.error("Assignment not started. Please start the assignment first.");
      return;
    }

    setState(
      produce((s) => {
        if (s.questionStates[s.currentQuestionIndex]) {
          s.questionStates[s.currentQuestionIndex].isAnswered = true;
        }
      })
    );

    handleNextQuestion();
  };

  const handleResetSession = () => {
    if (!state?.assignmentStarted) {
      // @ts-ignore
      toast.error("Assignment not started. Cannot reset session.");
      return;
    }

    setState({
      assignmentStarted: false,
      currentQuestionIndex: 0,
      questionStates: persistentData.questions.map((q) => ({
        ...q,
        isAnswered: false,
        isAsked: false,
        conversation: [],
      })),
    });

    // @ts-ignore
    toast.success("Session has been reset.");
  };

  const handleSubmitAssignment = async () => {
    if (!state.assignmentStarted) {
      // @ts-ignore
      toast.error("Assignment not started. Please start the assignment first.");
      return;
    }

    const numQuestionsCompleted = state.questionStates.filter(
      (q) => q.isAnswered
    ).length;

    const content = state.questionStates.map((q) => ({
      questionId: q.id,
      conversation: q.conversation,
    }));

    const timeTakenPerQuestion = state.questionStates.map((q) => ({
      questionId: q.id,
      timeTaken:
        q.conversation.length > 0
          ? (q.conversation[q.conversation.length - 1].timestamp -
              q.conversation[0].timestamp) /
            1000
          : 0,
    }));

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase.from("submissions").insert({
        uid: userData.user.id,
        assignmentID: persistentData.assignmentID,
        content: content,
        grade: 0,
        outOf: persistentData.totalQuestions,
        numQuestionsCompleted: numQuestionsCompleted,
        timeTakenPerQuestion: timeTakenPerQuestion,
      });

      if (error) throw error;

      // @ts-ignore
      toast.success("Assignment submitted successfully!");
      // Optionally, you can reset the session or redirect the user after submission
      // handleResetSession();
      // or
      // window.location.assign('/dashboard');
    } catch (error) {
      console.error("Error submitting assignment:", error);
      // @ts-ignore
      toast.error("Failed to submit assignment. Please try again.");
    }
  };

  const handleSendMessage = async (message: string) => {
    if (message.trim() !== "") {
      setState(
        produce((s) => {
          const currentQuestion = s.questionStates[s.currentQuestionIndex];
          if (currentQuestion) {
            currentQuestion.conversation.push({
              timestamp: Date.now(),
              content: message,
              role: "user",
            });
          }
        })
      );
    }

    try {
      const currentQuestion = state.questionStates[state.currentQuestionIndex];
      const systemMessage = generateSystemMessage(
        persistentData.systemMessage,
        currentQuestion,
        state.currentQuestionIndex,
        persistentData.totalQuestions
      );

      const messages = currentQuestion.conversation.map(
        ({ role, content }) => ({
          role,
          content,
        })
      );
      showPlaceholderMessage();

      const aiResponse = await fetchAIResponse(messages, systemMessage);
      setState(
        produce((s) => {
          const currentQuestion = s.questionStates[s.currentQuestionIndex];
          if (currentQuestion) {
            currentQuestion.conversation.push({
              content: aiResponse,
              role: "assistant",
              timestamp: Date.now(),
            });
          }
        })
      );
    } catch (error) {
      console.error(error);
      // @ts-ignore
      toast.error("Failed to fetch AI response. Please try again.");
    }

    hidePlaceholderMessage();
  };

  onMount(() => {
    updateUserSession();
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) {
        window.location.assign(`/login`);
      }
    });
  });

  return (
    <>
      <Toaster />
      <TopMenu
        loading={loading()}
        error={error()}
        selectedAssignmentDataReady={!loading()}
        assignmentName={persistentData.assignmentName}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={persistentData.totalQuestions}
        totalQuestionsAnswered={totalQuestionsAnswered()}
        assignmentStarted={state.assignmentStarted}
        onStartAssignment={handleStartAssignment}
        onResetSession={handleResetSession}
        onPreviousQuestion={handlePreviousQuestion}
        onNextQuestion={handleNextQuestion}
        onMarkAsAnswered={handleMarkAsAnswered}
        onSubmitAssignment={handleSubmitAssignment}
      />
      <Conversation messages={currentQuestion()?.conversation || []} />
      <ChatInput
        currentQuestionAnswered={currentQuestionAnswered()}
        onSendMessage={handleSendMessage}
      />
    </>
  );
};

export default Assignment;

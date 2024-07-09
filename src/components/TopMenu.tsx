import { Show, createSignal } from "solid-js";
import { Modal } from "./Modal.tsx";

interface TopMenuProps {
  loading: boolean;
  error: string | null;
  selectedAssignmentDataReady: boolean;
  assignmentName: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  totalQuestionsAnswered: number;
  assignmentStarted: boolean;
  onStartAssignment: () => void;
  onResetSession: () => void;
  onPreviousQuestion: () => void;
  onNextQuestion: () => void;
  onMarkAsAnswered: () => void;
  onSubmitAssignment: () => void;
}

export const TopMenu = (props: TopMenuProps) => {
  const [showSubmitDialog, setShowSubmitDialog] = createSignal(false);
  const [showResetSessionDialog, setShowResetSessionDialog] =
    createSignal(false);

  const handleSubmitAssignment = () => {
    if (props.assignmentStarted) {
      setShowSubmitDialog(true);
      setTimeout(() => setShowSubmitDialog(false), 6000);
    } else {
      // You might want to show a toast here
      console.error(
        "Assignment not started. Please start the assignment first."
      );
    }
  };

  const handleResetSession = () => {
    setShowResetSessionDialog(true);
    setTimeout(() => setShowResetSessionDialog(false), 6000);
  };

  return (
    <>
      <div class="m-6">
        <ul class="menu bg-base-100 menu-horizontal border-black rounded-xl join join-horizontal flex justify-center">
          <li class="menu-item prose max-h-fit">
            <h3>
              ITSC 2214 -<span class="text-2xl">{props.assignmentName}</span>
            </h3>
          </li>
          <li class="menu-item min-h-full">
            <div class="text-center min-h-full flex justify-around">
              <a class="pi pi-fw pi-play" onClick={props.onStartAssignment} />
              <a class="menu-content" onClick={props.onStartAssignment}>
                Start Assignment
              </a>
            </div>
          </li>
          <li class="menu-item min-h-full">
            <div class="text-center min-h-full flex justify-around">
              <a class="pi pi-fw pi-refresh" onClick={handleResetSession} />
              <a class="menu-content" onClick={handleResetSession}>
                Reset Session
              </a>
            </div>
          </li>
          <li class="menu-item min-h-full">
            <div class="text-center min-h-full flex justify-around">
              <a
                class="pi pi-angle-double-left"
                onClick={props.onPreviousQuestion}
              />
            </div>
          </li>
          <li class="menu-item min-h-full">
            <div class="text-center min-h-full flex justify-around">
              <a class="menu-content">
                Question {props.currentQuestionIndex + 1} of{" "}
                {props.totalQuestions}
              </a>
            </div>
          </li>
          <li class="menu-item min-h-full">
            <div class="text-center min-h-full flex justify-around">
              <a
                class="pi pi-angle-double-right"
                onClick={props.onNextQuestion}
              />
            </div>
          </li>
          <li class="menu-item min-h-full">
            <div class="text-center min-h-full flex justify-around">
              <a class="pi pi-check-circle" onClick={props.onMarkAsAnswered} />
              <a class="menu-content" onClick={props.onMarkAsAnswered}>
                Mark as Answered
              </a>
            </div>
          </li>
          <li class="menu-item min-h-full">
            <div class="text-center min-h-full flex justify-around">
              <a class="pi pi-fw pi-upload" onClick={handleSubmitAssignment} />
              <a class="menu-content" onClick={handleSubmitAssignment}>
                Submit Assignment
              </a>
            </div>
          </li>
        </ul>
      </div>

      <Modal
        isOpen={showSubmitDialog()}
        onClose={() => setShowSubmitDialog(false)}
        title="Confirm Submission"
      >
        <p class="py-4">
          Are you sure you want to submit your current progress?
        </p>
        <p class="py-4">
          You have completed {props.totalQuestionsAnswered} out of{" "}
          {props.totalQuestions} questions.
        </p>
        <div class="modal-action">
          <button class="btn" onClick={() => setShowSubmitDialog(false)}>
            Cancel
          </button>
          <button
            class="btn btn-primary"
            onClick={() => {
              props.onSubmitAssignment();
              setShowSubmitDialog(false);
            }}
          >
            Submit
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={showResetSessionDialog()}
        onClose={() => setShowResetSessionDialog(false)}
        title="Reset Session"
      >
        <p class="py-4">
          Are you sure you want to Reset Current Session? Any unsubmitted
          progress will be lost.
        </p>
        <div class="modal-action">
          <button class="btn" onClick={() => setShowResetSessionDialog(false)}>
            Cancel
          </button>
          <button
            class="btn btn-primary"
            onClick={() => {
              props.onResetSession();
              setShowResetSessionDialog(false);
            }}
          >
            Reset
          </button>
        </div>
      </Modal>
    </>
  );
};

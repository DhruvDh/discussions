import { createEffect, onCleanup, Show } from "solid-js";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  closeOnBackdrop?: boolean;
  onClose: () => void;
  children: any;
}

export const Modal = (props: ModalProps) => {
  let dialogRef: HTMLDialogElement | undefined;

  createEffect(() => {
    if (props.isOpen) {
      dialogRef?.showModal();
    } else {
      dialogRef?.close();
    }
  });

  const closeModal = () => {
    props.onClose();
  };

  const onBackdropClick = (event: MouseEvent) => {
    if (props.closeOnBackdrop && event.target === dialogRef) {
      closeModal();
    }
  };

  onCleanup(() => {
    dialogRef?.close();
  });

  return (
    <dialog ref={dialogRef} class="modal rounded-3xl" onClick={onBackdropClick}>
      <div class="modal-box">
        <Show when={props.title}>
          <h3 class="font-bold text-lg">{props.title}</h3>
        </Show>
        {props.children}
        <div class="modal-action">
          {props.children.actions || (
            <button class="btn" onClick={closeModal}>
              Close
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
};

import { Show, createEffect } from "solid-js";
import { Toaster } from "solid-toast";

interface TopMenuProps {
  loading: boolean;
  error: string | null;
  selectedModuleDataReady: boolean;
  moduleName: string;
  onRefresh: () => void;
}

export const TopMenu = (props: TopMenuProps) => {
  return (
    <>
      <Toaster />
      <Show
        when={!props.loading && !props.error}
        fallback={
          <Show
            when={props.loading}
            fallback={
              <div class="flex justify-center items-center">
                <div class="alert alert-error shadow-lg">
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="stroke-current flex-shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{props.error}</span>
                  </div>
                </div>
              </div>
            }
          >
            <div class="flex justify-center items-center h-screen">
              <span class="loading loading-spinner loading-lg"></span>
            </div>
          </Show>
        }
      >
        <div class="navbar bg-base-100">
          <div class="flex-1">
            <a class="btn btn-ghost normal-case text-xl">
              {props.selectedModuleDataReady ? props.moduleName : "Loading..."}
            </a>
          </div>
          <div class="flex-none">
            <button class="btn btn-square btn-ghost" onClick={props.onRefresh}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-5 h-5 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </Show>
    </>
  );
};

import { onMount, Show, createSignal, type Component } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  iid,
  supabase,
  updateUserSession,
  userInstitution,
  userStore,
} from "../index.tsx";
import { useSearchParams, A } from "@solidjs/router";

const Welcome: Component = () => {
  const [searchParams, _] = useSearchParams();
  const [errorCode, setErrorCode] = createSignal<string | null>(null);
  const [errorDescription, setErrorDescription] = createSignal<string | null>(
    null
  );

  onMount(() => {
    if (searchParams.error_code) {
      setErrorCode(searchParams.error_code);
      setErrorDescription(
        searchParams.error_description || "An error occurred."
      );
    }

    if (updateUserSession()) {
      const authToken = JSON.parse(
        localStorage.getItem("sb-oxrtehafaszdaaqejbwo-auth-token")
      );

      supabase
        .from("userData")
        .select("*")
        .eq("id", authToken?.user?.id || "")
        .then(({ data, error }) => {
          if (error) {
            console.error(error);
            return;
          }

          if (data.length === 0) {
            supabase.from("userData").insert({
              iid: iid(),
              uid: authToken?.user?.id,
            });
          }
        });

      window.location.assign("/");
    }
  });

  return (
    <div class="min-h-screen bg-amber-100 flex flex-col justify-center items-center p-4">
      <MetaProvider>
        <Title>Prep Work - {userInstitution()?.name || "Welcome"}</Title>
      </MetaProvider>

      <div class="w-full max-w-2xl bg-white shadow-xl rounded-lg p-6">
        <Show
          when={errorCode()}
          fallback={
            <div class="text-center">
              <h1 class="text-3xl font-bold mb-4">
                Welcome {userStore?.user_metadata?.email}!
              </h1>
              <p class="mb-4">We're glad to have you here.</p>
            </div>
          }
        >
          <h1 class="text-3xl font-bold mb-4 text-center">
            Error: {errorCode()}
          </h1>
          <div
            class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
            role="alert"
          >
            <p class="font-bold">Error</p>
            <p>{errorDescription()}</p>
          </div>
        </Show>

        <div class="flex justify-center mt-6">
          <A href={`/login`} class="btn btn-primary">
            Go to Homepage
          </A>
        </div>
      </div>
    </div>
  );
};

export default Welcome;

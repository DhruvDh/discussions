import { Component, createSignal, onMount, Show, useContext } from "solid-js";
import {
  InstitutionContext,
  InstitutionProvider,
} from "../providers/InstitutionProvider.tsx";
import { MetaProvider, Title } from "@solidjs/meta";
import { useNavigate, useSearchParams } from "@solidjs/router";
import { iid, supabase, updateUserSession, userStore } from "../index.tsx";

const Login: Component = () => {
  onMount(() => updateUserSession());

  const institution = useContext(InstitutionContext);
  supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (!error) {
      if (iid() ? iid() : institution.id) {
        const navigate = useNavigate();
        navigate(`/${iid() ? iid() : institution.id}`);
      }
    }
  });

  const [email, setEmail] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const redirectModule = searchParams.module || null;

  const isValidEmail = (email: string) => {
    return email.endsWith(
      `@${institution.domainName}.${institution.topDomain}`
    );
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!isValidEmail(email())) {
      setError(
        `Please enter a valid @${institution.domainName}.${institution.topDomain} email address.`
      );
      return;
    }

    setIsLoading(true);
    supabase.auth
      .signInWithOtp({
        email: email(),
      })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setSuccess(true);
        }
        setIsLoading(false);
        return data;
      });
  };

  return (
    <InstitutionProvider>
      <MetaProvider>
        <div class="Home">
          <Title>Login - Prep Work - {institution.name}</Title>
        </div>
      </MetaProvider>

      <div class="min-h-screen bg-amber-100 flex flex-col justify-center items-center py-12 px-4">
        <div class="card bg-base-100 max-w-2xl shadow-xl">
          <div class="card-body">
            <h2 class="card-title text-center">
              Please verify your @{institution.domainName}.
              {institution.topDomain} email address
            </h2>

            <form onSubmit={handleSubmit}>
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text">Email address</span>
                </label>
                <label class="input input-bordered flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    class="h-4 w-4 opacity-70"
                  >
                    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                  </svg>
                  <input
                    type="email"
                    class="grow"
                    placeholder={`Enter your @${institution.domainName}.${institution.topDomain} email`}
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    required
                  />
                </label>
              </div>

              <Show when={error()}>
                <div class="alert alert-error mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6"
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
                  <span>{error()}</span>
                </div>
              </Show>

              <Show when={success()}>
                <div class="alert alert-success mt-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>
                    Magic link sent! Check your email for further instructions.
                  </span>
                </div>
              </Show>

              <div class="card-actions justify-end mt-6">
                <button
                  type="submit"
                  class="btn btn-primary w-full"
                  disabled={isLoading()}
                >
                  {isLoading() ? "Sending..." : "Send Magic Link"}
                </button>
              </div>
            </form>

            <div class="mt-4 text-sm text-gray-600">
              <p>What to expect:</p>
              <ul class="list-disc list-inside mt-2">
                <li>
                  You'll recieve an email within a few minutes with a magic
                  link.
                </li>
                <li>
                  Click the link in the email to log in instantly - no password
                  needed!
                </li>
                <li>The link expires after 15 minutes for security.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </InstitutionProvider>
  );
};

export default Login;

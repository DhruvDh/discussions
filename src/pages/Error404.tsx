import {
  Component,
  createSignal,
  createResource,
  For,
  useContext,
  Show,
} from "solid-js";
import { A, useSearchParams } from "@solidjs/router";
import { MetaProvider, Title } from "@solidjs/meta";
import { setUserStore, supabase } from "../index.tsx";

interface Institution {
  id: number;
  name: string;
  domainName: string;
  topDomain: string;
}

const fetchInstitutions = async () => {
  let { data: institutions, error } = await supabase
    .from("institutions")
    .select("*");

  if (error) {
    throw error;
  }
  return institutions as Institution[];
};

const Error404: Component = () => {
  supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (!error) {
      setUserStore(user);
    }
  });
  const [searchParams, setSearchParams] = useSearchParams();

  const [institutions] = createResource(fetchInstitutions);
  const [selectedInstitution, setSelectedInstitution] = createSignal<
    number | null
  >(null);

  return (
    <>
      <MetaProvider>
        <div class="Home">
          <Title>Not Found - Prep Work</Title>
        </div>
      </MetaProvider>

      <div class="min-h-screen bg-amber-100 flex flex-col justify-center items-center py-12 px-4">
        <div class="card bg-base-100 max-w-2xl shadow-xl">
          <div class="card-body">
            <Show
              when={
                searchParams.error_code &&
                searchParams.error_code.startsWith("4")
              }
              fallback={
                <h2 class="card-title text-3xl mb-4">404 - Page Not Found</h2>
              }
            >
              <h2 class="card-title text-3xl mb-4">
                Error: {searchParams.error_code}
              </h2>
            </Show>

            <div class="alert alert-info mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="stroke-current shrink-0 w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <Show
                when={
                  searchParams.error_code &&
                  searchParams.error_code.startsWith("4")
                }
                fallback={
                  <span>
                    You may have mistyped the address or the page may have
                    moved.
                  </span>
                }
              >
                <span>{searchParams.error_description}</span>
              </Show>
            </div>

            <div class="form-control w-full mb-4">
              <label class="label">
                <span class="label-text">Select your institution</span>
              </label>
              <select
                class="select select-bordered w-full"
                onChange={(e) =>
                  setSelectedInstitution(parseInt(e.currentTarget.value))
                }
                disabled={institutions.loading}
              >
                <option disabled selected>
                  Pick one
                </option>
                <For each={institutions()}>
                  {(institution) => (
                    <option value={institution.id}>{institution.name}</option>
                  )}
                </For>
              </select>
            </div>

            <div class="card-actions justify-center">
              <A
                href={
                  selectedInstitution()
                    ? `/${selectedInstitution()}/login`
                    : "#"
                }
                class="btn btn-primary"
              >
                Go to Homepage
              </A>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Error404;

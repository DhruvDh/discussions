import {
  createContext,
  createEffect,
  createResource,
  Match,
  Switch,
} from "solid-js";
import { useParams } from "@solidjs/router";
import { iid, setIid, supabase, userStore } from "../index.tsx";

export const InstitutionContext = createContext({
  domainName: "charlotte",
  topDomain: "edu",
  name: "UNC Charlotte",
  id: 1,
});

createEffect(() => {
  if (!userStore || !userStore.id) {
    return;
  }

  supabase
    .from("userData")
    .select("*")
    .eq("uid", userStore.id)
    .single()
    .then(({ data, error }) => {
      if (error) {
        return;
      }

      setIid(data.iid);
    });
});

const fetchInstitution = async (id) => {
  let { data: institutions, error } = await supabase
    .from("institutions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  } else {
    return {
      domainName: institutions.domainName,
      topDomain: institutions.topDomain,
      name: institutions.name,
      id: institutions.id,
    };
  }
};

export function InstitutionProvider(props) {
  const [institution] = createResource(
    iid() ? iid() : useParams().institutionID,
    fetchInstitution
  );

  return (
    <Switch>
      <Match when={institution.loading}>
        <div class="min-h-screen bg-amber-100 flex flex-col justify-center items-center py-12 px-4">
          <div class="card bg-base-100 max-w-2xl shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-center">Loading Institution</h2>
              <div class="flex justify-center items-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p class="text-center mt-4">
                Please wait while we load the institution data...
              </p>
            </div>
          </div>
        </div>
      </Match>
      <Match when={institution.error}>
        <div class="min-h-screen bg-amber-100 flex flex-col justify-center items-center py-12 px-4">
          <div class="card bg-base-100 max-w-2xl shadow-xl">
            <div class="card-body">
              <h2 class="card-title text-center">Error Loading Institution</h2>
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
                <span>There was an error loading the institution.</span>
              </div>
              <p class="text-center mt-4">{institution.error.message}</p>
            </div>
          </div>
        </div>
      </Match>
      <Match when={institution()}>
        <InstitutionContext.Provider
          value={{
            domainName: institution().domainName,
            topDomain: institution().topDomain,
            name: institution().name,
            id: institution().id,
          }}
        >
          {props.children}
        </InstitutionContext.Provider>
      </Match>
    </Switch>
  );
}

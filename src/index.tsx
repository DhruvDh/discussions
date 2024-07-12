/* @refresh reload */
import "./index.css";
import "primeicons/primeicons.css";

import { createEffect, createSignal, lazy, onMount } from "solid-js";
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import "solid-devtools";
import { createClient } from "@supabase/supabase-js";
import { createStore } from "solid-js/store";
import { Toaster } from "solid-toast";

export interface Institution {
  id: number;
  name: string;
  domainName: string;
  topDomain: string;
}

export const supabase = createClient(
  "https://oxrtehafaszdaaqejbwo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cnRlaGFmYXN6ZGFhcWVqYndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYxNzk0ODQsImV4cCI6MjAxMTc1NTQ4NH0.OQsCbESP2HVChXWAKx1KjlrdTCocyluA3bFX-GlOwtQ",
  {
    auth: {
      flowType: "pkce",
    },
  }
);

export const [userStore, setUserStore] = createStore(null);
export const [institutionStore, setInstitutionStore] = createStore<
  Institution[]
>([]);
export const [iid, setIid] = createSignal<number>(null);
export const [cid, setCid] = createSignal<number[]>([]);
export const [userInstitution, setUserInstitution] =
  createSignal<Institution>(null);

export const updateUserSession = () => {
  let loggedIn = false;

  const institutions = sessionStorage.getItem("institutions");
  if (institutions) {
    setInstitutionStore(JSON.parse(institutions));
  } else {
    fetchInstitutions();
  }

  const iidStorage = sessionStorage.getItem("iid");
  if (iidStorage) {
    setIid(Number(iidStorage));
  }

  const cid = sessionStorage.getItem("cid");
  if (cid) {
    setCid(JSON.parse(cid));
  }

  const authToken = localStorage.getItem("sb-oxrtehafaszdaaqejbwo-auth-token");

  if (authToken) {
    const authTokenObj = JSON.parse(authToken);

    const localData = JSON.parse(authToken);
    supabase.auth
      .setSession({
        access_token: localData.access_token,
        refresh_token: localData.refresh_token,
      })
      .then(({ data: { user }, error }) => {
        if (error) {
          console.error(error);
          return;
        }

        setUserStore(user);

        if (!iid()) {
          supabase
            .from("userData")
            .select("*")
            .eq("uid", user.id)
            .single()
            .then(({ data: userData, error }) => {
              if (error) {
                console.error(error);
                const institutionDomain = institutionStore.find((institution) =>
                  authTokenObj.user.user_metadata.email.includes(
                    institution.domainName
                  )
                );

                supabase
                  .from("userData")
                  .insert({
                    iid: iid() ? iid() : institutionDomain?.id,
                    uid: authTokenObj?.user?.id,
                  })
                  .then(({ data, error }) => {
                    if (error) {
                      console.error(error);
                    }
                  });

                return;
              }

              setIid(userData.iid);
              sessionStorage.setItem("iid", userData.iid);
              setCid(userData.courses);
              sessionStorage.setItem("cid", JSON.stringify(userData.courses));
              loggedIn = true;
            });
        } else {
          loggedIn = true;
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  return authToken ? true : false;
};

export const fetchInstitutions = () => {
  if (institutionStore.length === 0) {
    supabase
      .from("institutions")
      .select("*")
      .then(({ data: institutions, error }) => {
        if (error) {
          throw error;
        }
        setInstitutionStore(institutions);
        sessionStorage.setItem("institutions", JSON.stringify(institutions));
      });
  }
};

export const fetchAssignments = async ([iid, enrolledCourses]) => {
  if (!iid || !enrolledCourses || enrolledCourses.length === 0) return [];
  const { data, error } = await supabase
    .from("assignments")
    .select("*")
    .eq("iid", iid)
    .in("courseID", enrolledCourses);
  if (error) throw error;
  return data;
};

render(() => {
  createEffect(() => {
    if (iid() && institutionStore.length > 0) {
      setUserInstitution(institutionStore.find((i) => i.id === iid()));
    }
  });

  return (
    <Router>
      <Route path="/" component={lazy(() => import("./pages/App.tsx"))} />
      <Route
        path="/login"
        component={lazy(() => import("./pages/Login.tsx"))}
      />
      <Route
        path="/welcome"
        component={lazy(() => import("./pages/Welcome.tsx"))}
      />
      <Route
        path="/assignment/:assignmentID"
        component={lazy(() => import("./pages/Assignment.tsx"))}
      />
      <Route
        path="*404"
        component={lazy(() => import("./pages/Error404.tsx"))}
      />
    </Router>
  );
}, document.getElementById("root")!);

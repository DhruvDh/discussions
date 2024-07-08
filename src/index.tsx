/* @refresh reload */
import "./index.css";
import { createEffect, createSignal, lazy, onMount } from "solid-js";
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import "solid-devtools";
import { createClient } from "@supabase/supabase-js";
import { createStore } from "solid-js/store";

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
  fetchInstitutions();

  supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (!error) {
      setUserStore(user);
      const localData = JSON.parse(
        localStorage.getItem("sb-oxrtehafaszdaaqejbwo-auth-token")
      );
      supabase.auth.setSession({
        access_token: localData.access_token,
        refresh_token: localData.refresh_token,
      });

      if (iid() === null) {
        supabase
          .from("userData")
          .select("*")
          .eq("uid", user.id)
          .single()
          .then(({ data: userData, error }) => {
            if (error) {
              throw error;
            }

            setIid(userData.iid);
            setCid(userData.courses);
          });
      }
    } else {
      console.error(error);
    }
  });
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
      });
  }
};

render(() => {
  onMount(() => {
    updateUserSession();
  });

  createEffect(() => {
    if (iid() && institutionStore.length > 0) {
      setUserInstitution(institutionStore.find((i) => i.id === iid()));
    }
  });

  return (
    <Router>
      <Route
        path="/:institutionID/"
        component={lazy(() => import("./pages/App.tsx"))}
      />
      <Route
        path="/login"
        component={lazy(() => import("./pages/Login.tsx"))}
      />
      <Route
        path="/welcome"
        component={lazy(() => import("./pages/Welcome.tsx"))}
      />
      <Route
        path="*404"
        component={lazy(() => import("./pages/Error404.tsx"))}
      />
    </Router>
  );
}, document.getElementById("root")!);

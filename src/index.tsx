/* @refresh reload */
import "./index.css";
import { createEffect, createResource, createSignal, lazy } from "solid-js";
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import "solid-devtools";
import { createClient } from "@supabase/supabase-js";
import { createStore } from "solid-js/store";

export const supabase = createClient(
  "https://oxrtehafaszdaaqejbwo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cnRlaGFmYXN6ZGFhcWVqYndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYxNzk0ODQsImV4cCI6MjAxMTc1NTQ4NH0.OQsCbESP2HVChXWAKx1KjlrdTCocyluA3bFX-GlOwtQ",
  {
    auth: {
      flowType: "pkce",
    },
  }
);

const root = document.getElementById("root");
export const [userStore, setUserStore] = createStore(null);

export const updateUserSession = () => {
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
    }
  });
};

updateUserSession();
export const [iid, setIid] = createSignal(null);

render(
  () => (
    <Router>
      <Route
        path="/:institutionID/"
        component={lazy(() => import("./pages/App.tsx"))}
      />
      <Route
        path="/:institutionID/login"
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
  ),
  root!
);

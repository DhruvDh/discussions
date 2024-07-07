/* @refresh reload */
import "./index.css";
import { lazy } from "solid-js";
import { render } from "solid-js/web";
import { Router } from "@solidjs/router";
import "solid-devtools";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://oxrtehafaszdaaqejbwo.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94cnRlaGFmYXN6ZGFhcWVqYndvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTYxNzk0ODQsImV4cCI6MjAxMTc1NTQ4NH0.OQsCbESP2HVChXWAKx1KjlrdTCocyluA3bFX-GlOwtQ"
);

const root = document.getElementById("root");
const routes = [
  {
    path: "/:institutionID/",
    component: lazy(() => import("./pages/App.tsx")),
  },
  {
    path: "/:institutionID/login",
    component: lazy(() => import("./pages/Login.tsx")),
  },
  {
    path: "*404",
    component: lazy(() => import("./pages/Error404.tsx")),
  },
];

render(() => <Router>{routes}</Router>, root!);

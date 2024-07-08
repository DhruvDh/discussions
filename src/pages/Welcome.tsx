import { createEffect, onMount, useContext, type Component } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  iid,
  updateUserSession,
  userInstitution,
  userStore,
} from "../index.tsx";
import { useNavigate } from "@solidjs/router";

const Welcome: Component = () => {
  onMount(() => {
    updateUserSession();
  });

  createEffect(() => {
    if (iid() || userInstitution()) {
      const navigate = useNavigate();
      navigate(`/${iid() ? iid() : userInstitution()?.id}/`);
    }
  });

  return (
    <>
      <MetaProvider>
        <div class="Home">
          <Title>Prep Work - {userInstitution()?.name}</Title>
        </div>
      </MetaProvider>

      <div class="min-h-screen bg-amber-100 flex flex-col justify-center items-center py-12 px-4 prose prose-xl">
        <h1>Welcome {userStore?.user_metadata?.email}!</h1>
      </div>
    </>
  );
};

export default Welcome;

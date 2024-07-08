import { createEffect, onMount, useContext, type Component } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  iid,
  updateUserSession,
  userInstitution,
  userStore,
} from "../index.tsx";

const App: Component = () => {
  onMount(() => {
    updateUserSession();
  });

  createEffect(() => {
    if (iid() && userInstitution()) {
      console.log(iid());
      console.log(userInstitution());
    }
  });

  return (
    <>
      <MetaProvider>
        <div class="Home">
          <Title>Prep Work - {userInstitution()?.name}</Title>
        </div>
      </MetaProvider>

      <p class="text-4xl text-green-700 text-center py-20">
        Hello {userStore?.user_metadata?.email} from {userInstitution()?.name}!
      </p>
    </>
  );
};

export default App;

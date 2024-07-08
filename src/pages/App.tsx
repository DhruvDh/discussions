import { useContext, type Component } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  InstitutionContext,
  InstitutionProvider,
} from "../providers/InstitutionProvider.tsx";
import { updateUserSession, userStore } from "../index.tsx";

const App: Component = () => {
  updateUserSession();

  const institution = useContext(InstitutionContext);

  return (
    <InstitutionProvider>
      <MetaProvider>
        <div class="Home">
          <Title>Prep Work - {institution.name}</Title>
        </div>
      </MetaProvider>

      <p class="text-4xl text-green-700 text-center py-20">
        Hello {userStore?.user_metadata?.email} from {institution.name}!
      </p>
    </InstitutionProvider>
  );
};

export default App;

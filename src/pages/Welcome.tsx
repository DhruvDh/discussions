import { useContext, type Component } from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import {
  InstitutionContext,
  InstitutionProvider,
} from "../providers/InstitutionProvider.tsx";
import { iid, supabase, updateUserSession, userStore } from "../index.tsx";
import { useNavigate } from "@solidjs/router";

const Welcome: Component = () => {
  updateUserSession();

  const institution = useContext(InstitutionContext);

  const navigate = useNavigate();
  navigate(`/${iid() ? iid() : institution.id}/`);

  return (
    <InstitutionProvider>
      <MetaProvider>
        <div class="Home">
          <Title>Prep Work - {institution.name}</Title>
        </div>
      </MetaProvider>

      <div class="min-h-screen bg-amber-100 flex flex-col justify-center items-center py-12 px-4 prose prose-xl">
        <h1>Welcome {userStore?.user_metadata?.email}!</h1>
      </div>
    </InstitutionProvider>
  );
};

export default Welcome;

import { useParams } from "@solidjs/router";

const Assignment = () => {
  const params = useParams();

  return (
    <>
      <article class="prose prose-xl">
        <h1>Assignment: {params.assignmentID}</h1>
      </article>
    </>
  );
};

export default Assignment;

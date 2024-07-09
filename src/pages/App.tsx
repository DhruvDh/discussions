import {
  createEffect,
  createResource,
  For,
  Show,
  onMount,
  type Component,
} from "solid-js";
import { MetaProvider, Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import {
  cid,
  fetchAssignments,
  setCid,
  supabase,
  updateUserSession,
  userInstitution,
  userStore,
} from "../index.tsx";
import toast, { Toaster } from "solid-toast";

const fetchSubmissions = async (uid) => {
  if (!uid) return [];
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("uid", uid);
  if (error) throw error;
  return data;
};

const fetchCourses = async (iid) => {
  if (!iid) return [];
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("iid", iid);
  if (error) throw error;
  return data;
};

const App: Component = () => {
  onMount(() => {
    updateUserSession();
  });

  const [assignments, { refetch: refetchAssignments }] = createResource(
    () => [userInstitution()?.id, cid()],
    fetchAssignments
  );
  const [submissions] = createResource(() => userStore?.id, fetchSubmissions);
  const [courses] = createResource(() => userInstitution()?.id, fetchCourses);

  createEffect(() => {
    // Refetch assignments when cid changes
    refetchAssignments();
  });

  const getSubmissionStatus = (assignmentID) => {
    if (submissions.loading) return "Loading...";
    const submission = submissions()?.find(
      (s) => s.assignmentID === assignmentID
    );
    if (!submission) return "Not submitted";
    return `Submitted`;
  };

  const toggleCourse = async (courseId) => {
    setCid((prev) => {
      const newCid = prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId];

      // Update userData in Supabase
      supabase
        .from("userData")
        .update({ courses: newCid })
        .eq("uid", userStore.id)
        .then(({ error }) => {
          if (error) {
            console.error("Error updating course selections:", error);
            // @ts-ignore
            toast.error("Failed to update course selection");
          } else {
            // @ts-ignore
            toast.success("Course selection updated");
          }
        });

      return newCid;
    });
  };

  return (
    <>
      <Toaster />

      <MetaProvider>
        <div class="Home">
          <Title>Dashboard - Prep Work - {userInstitution()?.name}</Title>
        </div>
      </MetaProvider>

      <div class="min-h-screen bg-amber-100 flex flex-col items-center py-12 px-4">
        <div class="card bg-base-100 max-w-4xl w-full shadow-xl mb-8">
          <div class="card-body">
            <h2 class="card-title text-3xl mb-6">
              Welcome, {userStore?.user_metadata?.email}!
            </h2>
            <p class="text-lg mb-4">Institution: {userInstitution()?.name}</p>

            <Show
              when={!assignments.loading}
              fallback={<div class="loading loading-spinner loading-lg"></div>}
            >
              <h3 class="text-2xl font-bold mb-4">Your Assignments</h3>
              <div class="overflow-x-auto">
                <table class="table w-full">
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>Total Questions</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={assignments()}>
                      {(assignment) => (
                        <tr>
                          <td>{assignment.moduleName}</td>
                          <td>{assignment.totalNumberOfQuestions}</td>
                          <td>{getSubmissionStatus(assignment.id)}</td>
                          <td>
                            <A
                              href={`/assignment/${assignment.id}`}
                              class="btn btn-primary btn-sm"
                              classList={{
                                "btn-disabled":
                                  getSubmissionStatus(assignment.id) ===
                                  "Submitted",
                              }}
                            >
                              {getSubmissionStatus(assignment.id) ===
                              "Not submitted"
                                ? "Start"
                                : "View"}
                            </A>
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
          </div>
        </div>

        <div class="card bg-base-100 max-w-4xl w-full shadow-xl">
          <div class="card-body">
            <h3 class="text-2xl font-bold mb-4">Course Enrollment</h3>
            <Show
              when={!courses.loading}
              fallback={<div class="loading loading-spinner loading-lg"></div>}
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <For each={courses()}>
                  {(course) => (
                    <div class="form-control">
                      <label class="label cursor-pointer">
                        <span class="label-text">
                          {course.courseCode} - {course.courseName}
                        </span>
                        <input
                          type="checkbox"
                          class="toggle toggle-primary"
                          checked={cid().includes(course.id)}
                          onChange={() => toggleCourse(course.id)}
                        />
                      </label>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;

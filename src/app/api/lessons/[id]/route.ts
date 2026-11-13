/** DELETE /api/lessons/:id: deletes one of your AI-generated lessons. */
import { ApiError, api } from "@/server/api";
import { deleteCustomLesson } from "@/server/lessons";

export const DELETE = api<{ id: string }>(async (_request, { id }) => {
  if (!(await deleteCustomLesson(id))) throw new ApiError(404, "Lesson not found.");
  return { ok: true };
});

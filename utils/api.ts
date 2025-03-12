export async function fetchQuestionsFromAPI() {
  const response = await fetch("/api/questions");
  if (!response.ok) {
    throw new Error("Failed to fetch questions");
  }
  return response.json();
}

export async function fetchQuestion(questionId: string) {
  const response = await fetch(`/api/questions/${questionId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch question");
  }
  return response.json();
}

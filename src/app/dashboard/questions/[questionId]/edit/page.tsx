import React from "react";
import { notFound } from "next/navigation";
import { getQuestionDetails } from "@/lib/dal";
import { QuestionFormPanel } from "@/components/dashboard/company/question-form-panel";

interface PageProps {
  params: Promise<{
    questionId: string;
  }>;
}

export default async function EditQuestionPage({ params }: PageProps) {
  const { questionId } = await params;
  const question = await getQuestionDetails(questionId);

  if (!question) {
    notFound();
  }

  return <QuestionFormPanel mode="edit" question={question} />;
}

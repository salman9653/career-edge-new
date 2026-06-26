import React from "react";
import { notFound } from "next/navigation";
import { getQuestionDetails } from "@/lib/dal";
import { CustomQuestionForm } from "@/components/dashboard/company/custom-question-form";

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

  return <CustomQuestionForm mode="edit" question={question} />;
}


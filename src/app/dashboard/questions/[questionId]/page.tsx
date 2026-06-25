import React from "react";
import { notFound } from "next/navigation";
import { getQuestionDetails } from "@/lib/dal";
import { QuestionDetailPanel } from "@/components/dashboard/company/question-detail-panel";

interface PageProps {
  params: Promise<{
    questionId: string;
  }>;
}

export default async function QuestionDetailPage({ params }: PageProps) {
  const { questionId } = await params;
  const question = await getQuestionDetails(questionId);

  if (!question) {
    notFound();
  }

  return <QuestionDetailPanel question={question} />;
}

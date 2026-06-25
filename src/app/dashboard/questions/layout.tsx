import React, { Suspense } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser, getCompanyQuestions } from "@/lib/dal";
import { QuestionBankClient } from "@/components/dashboard/company/question-bank-client";

export default async function QuestionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Role authorization check
  if (!user || user.accountType !== "company") {
    redirect("/dashboard");
  }

  const questions = await getCompanyQuestions(user.id);

  return (
    <Suspense fallback={null}>
      <QuestionBankClient questions={questions} user={user}>
        {children}
      </QuestionBankClient>
    </Suspense>
  );
}

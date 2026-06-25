import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { CandidateProfile, CompanyProfile, User } from "@/types";
import { Db, ObjectId } from "mongodb";

async function findUserByUserId(db: Db, userId: string) {
  if (!userId) return null;
  const queries: any[] = [
    { id: userId },
    { _id: userId }
  ];
  if (ObjectId.isValid(userId)) {
    queries.push({ _id: new ObjectId(userId) });
  }
  return await db.collection("user").findOne({ $or: queries });
}


export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (err) {
    console.error("Failed to retrieve session in DAL:", err);
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session || !session.user) return null;
  return session.user as User;
}

export async function getProfile(
  userId: string,
  accountType: string
): Promise<CandidateProfile | CompanyProfile | null> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collectionName = accountType === "company" ? "company_profiles" : "candidate_profiles";
    const profile = await db.collection(collectionName).findOne({ userId });
    if (!profile) return null;
    return JSON.parse(JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to get profile in DAL:", err);
    return null;
  }
}

export async function getCompaniesWithUsers() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // We fetch all records from company_profiles
    const profiles = await db.collection("company_profiles").find({}).toArray();
    
    // For each profile, fetch the associated user and job count
    const companies = await Promise.all(
      profiles.map(async (profile) => {
        // Fetch user details
        const user = await findUserByUserId(db, profile.userId);
        
        // Fetch job postings count (assumes collection name is "jobs")
        let jobsCount = 0;
        try {
          jobsCount = await db.collection("jobs").countDocuments({ companyId: profile.userId });
        } catch (e) {
          // If collection doesn't exist, it will return 0 or error out
        }
        
        return {
          id: profile._id ? profile._id.toString() : profile.userId,
          userId: profile.userId,
          companyName: profile.companyName || "Unnamed Company",
          industry: profile.industry || "N/A",
          location: profile.location || "N/A",
          websiteUrl: profile.websiteUrl || "",
          companySize: profile.companySize || "N/A",
          companyType: profile.companyType || "Private", // default
          subscription: profile.activePlan || profile.subscription || "Free",
          status: profile.status || "Active",
          jobsPosted: jobsCount,
          memberSince: user?.createdAt || profile.createdAt || new Date(),
          image: user?.image || null,
          email: user?.email || "",
        };
      })
    );
    
    return JSON.parse(JSON.stringify(companies));
  } catch (err) {
    console.error("Failed to get companies with users in DAL:", err);
    return [];
  }
}

export async function getCompanyDetails(companyId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const orQueries: Record<string, unknown>[] = [{ userId: companyId }];
    if (ObjectId.isValid(companyId)) {
      orQueries.push({ _id: new ObjectId(companyId) });
    }
    
    const profile = await db.collection("company_profiles").findOne({ $or: orQueries });
    if (!profile) return null;
    
    const user = await findUserByUserId(db, profile.userId);
    
    // Count actual jobs
    let jobsCount = 0;
    let jobsList: any[] = [];
    try {
      jobsCount = await db.collection("jobs").countDocuments({ companyId: profile.userId });
      jobsList = await db.collection("jobs").find({ companyId: profile.userId }).toArray();
    } catch (e) {
      // Ignored
    }
    
    return JSON.parse(JSON.stringify({
      ...profile,
      subscription: profile.activePlan || profile.subscription || "Free",
      email: user?.email || "",
      image: user?.image || null,
      memberSince: user?.createdAt || profile.createdAt,
      jobsPosted: jobsCount,
      jobs: jobsList,
    }));
  } catch (err) {
    console.error("Failed to get company details in DAL:", err);
    return null;
  }
}

export async function getCandidatesWithUsers() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const profiles = await db.collection("candidate_profiles").find({}).toArray();
    
    const candidates = await Promise.all(
      profiles.map(async (profile) => {
        const user = await findUserByUserId(db, profile.userId);
        
        return {
          id: profile._id ? profile._id.toString() : profile.userId,
          userId: profile.userId,
          name: user?.name || "Unnamed Candidate",
          jobTitle: profile.jobTitle || "Job Seeker",
          experience: profile.experience || "Not Specified",
          status: profile.status || "Active",
          subscription: profile.activePlan || profile.subscription || "Free",
          applicationsCount: 0,
          memberSince: user?.createdAt || profile.createdAt || new Date(),
          image: user?.image || null,
          email: user?.email || "",
        };
      })
    );
    
    return JSON.parse(JSON.stringify(candidates));
  } catch (err) {
    console.error("Failed to get candidates with users in DAL:", err);
    return [];
  }
}

export async function getCandidateDetails(candidateId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const orQueries: Record<string, unknown>[] = [{ userId: candidateId }];
    if (ObjectId.isValid(candidateId)) {
      orQueries.push({ _id: new ObjectId(candidateId) });
    }
    
    const profile = await db.collection("candidate_profiles").findOne({ $or: orQueries });
    if (!profile) return null;
    
    const user = await findUserByUserId(db, profile.userId);
    
    return JSON.parse(JSON.stringify({
      ...profile,
      subscription: profile.activePlan || profile.subscription || "Free",
      id: profile._id ? profile._id.toString() : profile.userId,
      name: user?.name || "Unnamed Candidate",
      email: user?.email || "",
      image: user?.image || null,
      memberSince: user?.createdAt || profile.createdAt,
      applicationsCount: 0,
      applications: [],
    }));
  } catch (err) {
    console.error("Failed to get candidate details in DAL:", err);
    return null;
  }
}

export async function getAdminDetails(adminId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const user = await findUserByUserId(db, adminId);
    if (!user || user.accountType !== "admin") return null;
    
    const candidatesCount = await db.collection("candidate_profiles").countDocuments({});
    const companiesCount = await db.collection("company_profiles").countDocuments({});
    let jobsCount = 0;
    try {
      jobsCount = await db.collection("jobs").countDocuments({});
    } catch (e) {}
    
    return JSON.parse(JSON.stringify({
      id: user.id || user._id ? user._id.toString() : adminId,
      name: user.name,
      email: user.email,
      image: user.image || null,
      memberSince: user.createdAt,
      stats: {
        candidates: candidatesCount,
        companies: companiesCount,
        jobs: jobsCount
      }
    }));
  } catch (err) {
    console.error("Failed to get admin details in DAL:", err);
    return null;
  }
}

export async function getCompanyQuestions(companyId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Find questions for this company
    let questions = await db.collection("questions").find({ companyId }).toArray();
    
    // Seed default questions if none exist
    if (questions.length === 0) {
      // Find company name
      const profile = await db.collection("company_profiles").findOne({ userId: companyId });
      const companyName = profile?.companyName || "Test Company";
      
      const defaultQuestions = [
        {
          companyId,
          question: "Consider the following Dart code snippet:\n\nString? name = null;\nString greeting = name ?? 'Guest';\n\nWhat will be the value of greeting?",
          type: "Mcq",
          difficulty: "Medium",
          categories: ["Dart", "Null Safety"],
          status: "Active",
          createdByName: companyName,
          createdAt: new Date(),
          updatedAt: new Date(),
          mcqOptions: [
            { id: "1", text: "null", isCorrect: false },
            { id: "2", text: "An empty string \"\"", isCorrect: false },
            { id: "3", text: "\"Guest\"", isCorrect: true },
            { id: "4", text: "A compile-time error will occur.", isCorrect: false }
          ]
        },
        {
          companyId,
          question: "What is the correct sequence of the primary lifecycle methods for a StatefulWidget in Flutter?",
          type: "Mcq",
          difficulty: "Medium",
          categories: ["Flutter", "State Management"],
          status: "Active",
          createdByName: companyName,
          createdAt: new Date(),
          updatedAt: new Date(),
          mcqOptions: [
            { id: "1", text: "createState -> initState -> didChangeDependencies -> build", isCorrect: true },
            { id: "2", text: "initState -> build -> didChangeDependencies -> dispose", isCorrect: false },
            { id: "3", text: "createState -> didUpdateWidget -> build -> initState", isCorrect: false },
            { id: "4", text: "initState -> build -> dispose -> didChangeDependencies", isCorrect: false }
          ]
        },
        {
          companyId,
          question: "Which of the following best describes when the useEffect hook runs in React?",
          type: "Mcq",
          difficulty: "Medium",
          categories: ["React.js", "Hooks"],
          status: "Active",
          createdByName: companyName,
          createdAt: new Date(),
          updatedAt: new Date(),
          mcqOptions: [
            { id: "1", text: "Only when the component is unmounted.", isCorrect: false },
            { id: "2", text: "Synchronously after all DOM mutations.", isCorrect: false },
            { id: "3", text: "After every render by default, unless dependency array is specified.", isCorrect: true },
            { id: "4", text: "Only when props change, regardless of dependencies.", isCorrect: false }
          ]
        },
        {
          companyId,
          question: "Which hook from `react-router-dom` is primarily used for programmatic navigation?",
          type: "Mcq",
          difficulty: "Medium",
          categories: ["React.js", "Navigation"],
          status: "Active",
          createdByName: companyName,
          createdAt: new Date(),
          updatedAt: new Date(),
          mcqOptions: [
            { id: "1", text: "useParams", isCorrect: false },
            { id: "2", text: "useNavigate", isCorrect: true },
            { id: "3", text: "useLocation", isCorrect: false },
            { id: "4", text: "useRouteMatch", isCorrect: false }
          ]
        },
        {
          companyId,
          question: "In React.js, which of the following is used to pass data from a parent component to a child component?",
          type: "Mcq",
          difficulty: "Easy",
          categories: ["React.js", "State"],
          status: "Active",
          createdByName: companyName,
          createdAt: new Date(),
          updatedAt: new Date(),
          mcqOptions: [
            { id: "1", text: "State", isCorrect: false },
            { id: "2", text: "Props", isCorrect: true },
            { id: "3", text: "Context", isCorrect: false },
            { id: "4", text: "Redux", isCorrect: false }
          ]
        }
      ];
      
      await db.collection("questions").insertMany(defaultQuestions);
      questions = await db.collection("questions").find({ companyId }).toArray();
    }
    
    return JSON.parse(JSON.stringify(
      questions.map(q => ({
        ...q,
        id: q._id.toString()
      }))
    ));
  } catch (err) {
    console.error("Failed to get company questions in DAL:", err);
    return [];
  }
}

export async function getQuestionDetails(questionId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    if (!ObjectId.isValid(questionId)) return null;
    
    const question = await db.collection("questions").findOne({ _id: new ObjectId(questionId) });
    if (!question) return null;
    
    return JSON.parse(JSON.stringify({
      ...question,
      id: question._id.toString()
    }));
  } catch (err) {
    console.error("Failed to get question details in DAL:", err);
    return null;
  }
}

export async function createQuestion(companyId: string, questionData: any) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const profile = await db.collection("company_profiles").findOne({ userId: companyId });
    const companyName = profile?.companyName || "Test Company";
    
    const now = new Date();
    const doc = {
      ...questionData,
      companyId,
      createdByName: companyName,
      createdAt: now,
      updatedAt: now
    };
    
    const result = await db.collection("questions").insertOne(doc);
    return {
      success: true,
      id: result.insertedId.toString()
    };
  } catch (err) {
    console.error("Failed to create question in DAL:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function updateQuestion(questionId: string, companyId: string, questionData: any) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    if (!ObjectId.isValid(questionId)) {
      return { success: false, error: "Invalid question ID" };
    }
    
    const now = new Date();
    const updates = {
      ...questionData,
      updatedAt: now
    };
    
    const result = await db.collection("questions").updateOne(
      { _id: new ObjectId(questionId), companyId },
      { $set: updates }
    );
    
    if (result.matchedCount === 0) {
      return { success: false, error: "Question not found or unauthorized" };
    }
    
    return { success: true };
  } catch (err) {
    console.error("Failed to update question in DAL:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

export async function deleteQuestion(questionId: string, companyId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    if (!ObjectId.isValid(questionId)) {
      return { success: false, error: "Invalid question ID" };
    }
    
    const result = await db.collection("questions").deleteOne({
      _id: new ObjectId(questionId),
      companyId
    });
    
    if (result.deletedCount === 0) {
      return { success: false, error: "Question not found or unauthorized" };
    }
    
    return { success: true };
  } catch (err) {
    console.error("Failed to delete question in DAL:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}



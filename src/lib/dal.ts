import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import clientPromise from "@/lib/db";
import { CandidateProfile, CompanyProfile, User } from "@/types";
import { Db, ObjectId } from "mongodb";
import { cache } from "react";

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


export const getSession = cache(async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    return session;
  } catch (err) {
    console.error("Failed to retrieve session in DAL:", err);
    return null;
  }
});

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  if (!session || !session.user) return null;
  return session.user as User;
});

export const getProfile = cache(async (
  userId: string,
  accountType: string
): Promise<CandidateProfile | CompanyProfile | null> => {
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
});

export async function getCompaniesWithUsers(searchQuery = "", skip = 0, limit = 20) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const pipeline: any[] = [];

    // 1. Join with users collection
    pipeline.push(
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } }
    );

    // 2. Filter search query
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      pipeline.push({
        $match: {
          $or: [
            { "userData.name": { $regex: regex } },
            { "userData.email": { $regex: regex } },
            { companyName: { $regex: regex } },
            { industry: { $regex: regex } },
            { location: { $regex: regex } },
          ],
        },
      });
    }

    // 3. Count jobs
    pipeline.push(
      {
        $lookup: {
          from: "jobs",
          localField: "userId",
          foreignField: "companyId",
          as: "jobsData",
        },
      }
    );

    // 4. Project mapped fields
    pipeline.push({
      $project: {
        id: { $cond: { if: "$_id", then: { $toString: "$_id" }, else: "$userId" } },
        userId: 1,
        companyName: { $ifNull: ["$companyName", "Unnamed Company"] },
        industry: { $ifNull: ["$industry", "N/A"] },
        location: { $ifNull: ["$location", "N/A"] },
        websiteUrl: { $ifNull: ["$websiteUrl", ""] },
        companySize: { $ifNull: ["$companySize", "N/A"] },
        companyType: { $ifNull: ["$companyType", "Private"] },
        subscription: { $ifNull: ["$activePlan", { $ifNull: ["$subscription", "Free"] }] },
        status: { $ifNull: ["$status", "Active"] },
        jobsPosted: { $size: "$jobsData" },
        memberSince: { $ifNull: ["$userData.createdAt", "$createdAt"] },
        image: { $ifNull: ["$userData.image", null] },
        email: { $ifNull: ["$userData.email", ""] },
      },
    });

    // 5. Pagination
    pipeline.push({ $sort: { companyName: 1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const results = await db.collection("company_profiles").aggregate(pipeline).toArray();
    return JSON.parse(JSON.stringify(results));
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

export async function getCandidatesWithUsers(searchQuery = "", skip = 0, limit = 20) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const pipeline: any[] = [];

    // 1. Join with users collection
    pipeline.push(
      {
        $lookup: {
          from: "user",
          localField: "userId",
          foreignField: "id",
          as: "userData",
        },
      },
      { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } }
    );

    // 2. Filter search query
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      pipeline.push({
        $match: {
          $or: [
            { "userData.name": { $regex: regex } },
            { "userData.email": { $regex: regex } },
            { jobTitle: { $regex: regex } },
            { experience: { $regex: regex } },
          ],
        },
      });
    }

    // 3. Project fields mapping, explicitly leaving out resumeBase64
    pipeline.push({
      $project: {
        id: { $cond: { if: "$_id", then: { $toString: "$_id" }, else: "$userId" } },
        userId: 1,
        name: { $ifNull: ["$userData.name", "Unnamed Candidate"] },
        jobTitle: { $ifNull: ["$jobTitle", "Job Seeker"] },
        experience: { $ifNull: ["$experience", "Not Specified"] },
        status: { $ifNull: ["$status", "Active"] },
        subscription: { $ifNull: ["$activePlan", { $ifNull: ["$subscription", "Free"] }] },
        applicationsCount: { $literal: 0 },
        memberSince: { $ifNull: ["$userData.createdAt", "$createdAt"] },
        image: { $ifNull: ["$userData.image", null] },
        email: { $ifNull: ["$userData.email", ""] },
      },
    });

    // 4. Pagination
    pipeline.push({ $sort: { name: 1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit });

    const results = await db.collection("candidate_profiles").aggregate(pipeline).toArray();
    return JSON.parse(JSON.stringify(results));
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

export async function getCompanyQuestions(companyId: string, searchQuery = "", skip = 0, limit = 20) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const query: Record<string, any> = { companyId };
    
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      query.$or = [
        { question: { $regex: regex } },
        { categories: { $regex: regex } }
      ];
    }
    
    // Find questions for this company
    const questions = await db.collection("questions")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
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



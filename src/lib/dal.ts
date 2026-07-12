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

    const defaultFree = accountType === "company" ? "company-free" : "candidate-free";
    let activePlan = profile.activePlan || defaultFree;
    if (activePlan.toLowerCase() === "free" || activePlan.toLowerCase() === "starter") {
      activePlan = defaultFree;
    }
    profile.activePlan = activePlan;

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
    
    // Query both old schema (companyId string) and new schema (companyIds array)
    const baseQuery: Record<string, any> = {
      $or: [
        { companyId: companyId },
        { companyIds: companyId }
      ]
    };
    
    let query = baseQuery;
    
    if (searchQuery.trim()) {
      const regex = new RegExp(searchQuery, "i");
      query = {
        $and: [
          baseQuery,
          {
            $or: [
              { question: { $regex: regex } },
              { categories: { $regex: regex } }
            ]
          }
        ]
      } as any;
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
      companyIds: [companyId], // link to this company
      isGlobal: false,         // manual custom questions are private by default
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
    
    const objId = new ObjectId(questionId);
    const existing = await db.collection("questions").findOne({ _id: objId });
    if (!existing) {
      return { success: false, error: "Question not found" };
    }
    
    // Check if company has access via creator or link array
    const hasAccess = existing.companyId === companyId || (existing.companyIds && existing.companyIds.includes(companyId));
    if (!hasAccess) {
      return { success: false, error: "Unauthorized" };
    }
    
    const now = new Date();
    
    // Check if the question is shared (isGlobal === true OR used by other companies)
    const isShared = existing.isGlobal === true || (existing.companyIds && existing.companyIds.length > 1);
    
    if (isShared) {
      // Copy-On-Write (COW): Duplicate the question as a private custom question for this company
      const profile = await db.collection("company_profiles").findOne({ userId: companyId });
      const companyName = profile?.companyName || "Test Company";
      
      const newDoc = {
        ...existing,
        ...questionData,
        _id: new ObjectId(), // assign a new ID
        companyId, // creator is this company
        companyIds: [companyId], // private to this company
        isGlobal: false, // not global anymore
        createdByName: companyName,
        createdAt: existing.createdAt || now,
        updatedAt: now
      };
      
      // 1. Insert the cloned custom question
      await db.collection("questions").insertOne(newDoc);
      
      // 2. Remove this company's ID from the original shared question's companyIds list
      await db.collection("questions").updateOne(
        { _id: objId },
        { $pull: { companyIds: companyId } } as any
      );
      
      return { success: true, clonedId: newDoc._id.toString() };
    } else {
      // In-place update (since it is exclusive to this company)
      const updates = {
        ...questionData,
        updatedAt: now
      };
      
      const result = await db.collection("questions").updateOne(
        { _id: objId },
        { $set: updates }
      );
      
      if (result.matchedCount === 0) {
        return { success: false, error: "Failed to update question" };
      }
      
      return { success: true };
    }
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
    
    const objId = new ObjectId(questionId);
    const existing = await db.collection("questions").findOne({ _id: objId });
    if (!existing) {
      return { success: false, error: "Question not found" };
    }
    
    // Check if company has access
    const hasAccess = existing.companyId === companyId || (existing.companyIds && existing.companyIds.includes(companyId));
    if (!hasAccess) {
      return { success: false, error: "Unauthorized" };
    }
    
    // Check if shared
    const isShared = existing.isGlobal === true || (existing.companyIds && existing.companyIds.length > 1);
    
    if (isShared) {
      // Just unlink this company by pulling its ID
      await db.collection("questions").updateOne(
        { _id: objId },
        { $pull: { companyIds: companyId } } as any
      );
      return { success: true };
    } else {
      // Delete the question from DB as it is private to this company
      const result = await db.collection("questions").deleteOne({ _id: objId });
      if (result.deletedCount === 0) {
        return { success: false, error: "Question not found" };
      }
      return { success: true };
    }
  } catch (err) {
    console.error("Failed to delete question in DAL:", err);
    return { success: false, error: err instanceof Error ? err.message : "Database error" };
  }
}

// =========================================================================
// MONETIZATION & TOKEN MANAGEMENT DAL HELPERS
// =========================================================================

// Default plans config fallback in case DB is not seeded yet
const DEFAULT_PLANS_FALLBACK = {
  "company-free": { monthlyTokens: 15, activeJobsLimit: 2, activeAssessmentsLimit: 2 },
  "company-pro": { monthlyTokens: 250, activeJobsLimit: 20, activeAssessmentsLimit: 10 },
  "company-pro-plus": { monthlyTokens: 1000, activeJobsLimit: 50, activeAssessmentsLimit: 9999 },
  "candidate-free": { monthlyTokens: 5, activeJobsLimit: 0, activeAssessmentsLimit: 0 },
  "candidate-pro": { monthlyTokens: 50, activeJobsLimit: 0, activeAssessmentsLimit: 0 },
  "candidate-pro-plus": { monthlyTokens: 200, activeJobsLimit: 0, activeAssessmentsLimit: 0 }
};

/**
 * Check if the company has active tokens remaining.
 */
export async function getCompanyTokenBalance(companyId: string) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const profile = await db.collection("company_profiles").findOne({ userId: companyId });
    if (!profile) return { allocated: 0, purchased: 0, total: 0 };
    
    return profile.aiTokens || { allocated: 0, purchased: 0, total: 0 };
  } catch (err) {
    console.error("Failed to get company token balance:", err);
    return { allocated: 0, purchased: 0, total: 0 };
  }
}

/**
 * Verify if the company is allowed to perform an action based on their subscription limits.
 */
export async function verifyPlanLimit(
  companyId: string,
  limitType: "activeJobs" | "activeAssessments"
): Promise<{ allowed: boolean; limit: number; current: number }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // 1. Fetch company profile
    const profile = await db.collection("company_profiles").findOne({ userId: companyId });
    let activePlan = profile?.activePlan || "company-free";
    if (activePlan.toLowerCase() === "free" || activePlan.toLowerCase() === "starter") {
      activePlan = "company-free";
    }
    
    // 2. Fetch plan config from pricing collection
    let limit = 0;
    const planConfig = await db.collection("pricing").findOne({ id: activePlan });
    
    if (planConfig) {
      limit = limitType === "activeJobs" 
        ? (planConfig.activeJobsLimit ?? 0) 
        : (planConfig.activeAssessmentsLimit ?? 0);
    } else {
      // Fallback
      const fb = DEFAULT_PLANS_FALLBACK[activePlan as keyof typeof DEFAULT_PLANS_FALLBACK] || DEFAULT_PLANS_FALLBACK["company-free"];
      limit = limitType === "activeJobs" ? fb.activeJobsLimit : fb.activeAssessmentsLimit;
    }
    
    // 3. Count current items in DB
    const collectionName = limitType === "activeJobs" ? "jobs" : "assessments";
    const current = await db.collection(collectionName).countDocuments({ 
      companyId 
    });
    
    return {
      allowed: current < limit,
      limit,
      current
    };
  } catch (err) {
    console.error("Failed to verify plan limit in DAL:", err);
    return { allowed: false, limit: 0, current: 0 };
  }
}

/**
 * Deduct AI tokens for an operation. Pulls from monthly allocated first, then purchased.
 */
export async function deductTokens(
  companyId: string,
  amount: number,
  description: string
): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // 1. Fetch profile
    const profile = await db.collection("company_profiles").findOne({ userId: companyId });
    if (!profile) {
      return { success: false, error: "Company profile not found" };
    }
    
    // Ensure tokens schema is initialized
    const aiTokens = profile.aiTokens || { allocated: 0, purchased: 0, total: 0, lastRefilledAt: new Date() };
    
    if (aiTokens.total < amount) {
      return { success: false, error: `Insufficient tokens. Remaining: ${aiTokens.total}, Needed: ${amount}` };
    }
    
    let allocatedDeduction = 0;
    let purchasedDeduction = 0;
    
    if (aiTokens.allocated >= amount) {
      allocatedDeduction = amount;
    } else {
      allocatedDeduction = aiTokens.allocated;
      purchasedDeduction = amount - allocatedDeduction;
    }
    
    const newAllocated = aiTokens.allocated - allocatedDeduction;
    const newPurchased = aiTokens.purchased - purchasedDeduction;
    const newTotal = newAllocated + newPurchased;
    
    // Update DB
    await db.collection("company_profiles").updateOne(
      { userId: companyId },
      {
        $set: {
          "aiTokens.allocated": newAllocated,
          "aiTokens.purchased": newPurchased,
          "aiTokens.total": newTotal,
          updatedAt: new Date()
        }
      }
    );
    
    // Log transaction
    await db.collection("token_transactions").insertOne({
      companyId,
      amount: -amount,
      balanceAfter: newTotal,
      type: "consume",
      description,
      createdAt: new Date()
    });
    
    return {
      success: true,
      newBalance: newTotal
    };
  } catch (err) {
    console.error("Failed to deduct tokens in DAL:", err);
    return { success: false, error: "Database transaction failed" };
  }
}

/**
 * Fetch all pricing configurations.
 */
export const getPricingTiers = cache(async () => {
  try {
    const client = await clientPromise;
    const db = client.db();
    const pricing = await db.collection("pricing").find({}).toArray();
    return JSON.parse(JSON.stringify(pricing));
  } catch (err) {
    console.error("Failed to get pricing tiers in DAL:", err);
    return [];
  }
});

/**
 * Lazy token refill. Resets monthly allocated tokens if 30 days have elapsed.
 */
export async function checkAndRefillTokens(userId: string): Promise<void> {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Find user to know their accountType
    const user = await findUserByUserId(db, userId);
    if (!user) return;
    const accountType = user.accountType;
    if (accountType !== "company" && accountType !== "candidate") return;
    
    const collectionName = accountType === "company" ? "company_profiles" : "candidate_profiles";
    const profile = await db.collection(collectionName).findOne({ userId });
    if (!profile) return;
    
    const defaultFreePlan = accountType === "company" ? "company-free" : "candidate-free";
    const activePlan = profile.activePlan || defaultFreePlan;
    const now = new Date();
    
    // Initialize aiTokens if it doesn't exist
    if (!profile.aiTokens) {
      const planConfig = await db.collection("pricing").findOne({ id: activePlan });
      const defaultAllocated = planConfig?.monthlyTokens ?? 
        (DEFAULT_PLANS_FALLBACK[activePlan as keyof typeof DEFAULT_PLANS_FALLBACK]?.monthlyTokens || (accountType === "company" ? 15 : 5));
        
      await db.collection(collectionName).updateOne(
        { userId },
        {
          $set: {
            activePlan,
            aiTokens: {
              allocated: defaultAllocated,
              purchased: 0,
              total: defaultAllocated,
              lastRefilledAt: now
            },
            updatedAt: now
          }
        }
      );
      
      // Log initial refill transaction
      await db.collection("token_transactions").insertOne({
        companyId: userId,
        amount: defaultAllocated,
        balanceAfter: defaultAllocated,
        type: "refill",
        description: "Initial plan token allocation",
        createdAt: now
      });
      return;
    }
    
    // Check if 30 days have passed since last refill
    const lastRefill = new Date(profile.aiTokens.lastRefilledAt);
    const diffTime = Math.abs(now.getTime() - lastRefill.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays >= 30) {
      const planConfig = await db.collection("pricing").findOne({ id: activePlan });
      const baseAllocated = planConfig?.monthlyTokens ?? 
        (DEFAULT_PLANS_FALLBACK[activePlan as keyof typeof DEFAULT_PLANS_FALLBACK]?.monthlyTokens || (accountType === "company" ? 15 : 5));
      
      const currentPurchased = profile.aiTokens.purchased ?? 0;
      
      // If remaining allocated is less than base plan, top it back up to base plan
      if (profile.aiTokens.allocated < baseAllocated) {
        const refilledAmount = baseAllocated - profile.aiTokens.allocated;
        const newTotal = baseAllocated + currentPurchased;
        
        await db.collection(collectionName).updateOne(
          { userId },
          {
            $set: {
              "aiTokens.allocated": baseAllocated,
              "aiTokens.total": newTotal,
              "aiTokens.lastRefilledAt": now,
              updatedAt: now
            }
          }
        );
        
        // Log refill transaction
        await db.collection("token_transactions").insertOne({
          companyId: userId,
          amount: refilledAmount,
          balanceAfter: newTotal,
          type: "refill",
          description: "Monthly allocated tokens refill",
          createdAt: now
        });
      } else {
        // Just update timestamp if they already have full/excess tokens
        await db.collection(collectionName).updateOne(
          { userId },
          {
            $set: {
              "aiTokens.lastRefilledAt": now,
              updatedAt: now
            }
          }
        );
      }
    }
  } catch (err) {
    console.error("Failed to check/refill tokens in DAL:", err);
  }
}

/**
 * Fetch token transactions for a company.
 */
export async function getCompanyTransactions(companyId: string, skip = 0, limit = 10, billingOnly = false) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const query: any = { companyId };
    if (billingOnly) {
      query.type = { $in: ["upgrade", "purchase"] };
    }
    
    const transactions = await db.collection("token_transactions")
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
      
    const totalCount = await db.collection("token_transactions").countDocuments(query);
    
    return {
      transactions: JSON.parse(JSON.stringify(transactions)),
      totalCount
    };
  } catch (err) {
    console.error("Failed to get transactions in DAL:", err);
    return { transactions: [], totalCount: 0 };
  }
}



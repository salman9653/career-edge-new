"use client";

import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CandidateSkillsTabProps {
  formData: any;
  updateField: (key: string, value: any) => void;
  onSkillsAutoSaved: (updatedSkills: string[]) => void;
}

const RECOMMENDATION_MAP: Record<string, string[]> = {
  // Frontend
  javascript: ["TypeScript", "React", "Next.js", "Redux", "Tailwind CSS", "HTML5", "CSS3", "Vue.js", "Angular", "Jest"],
  typescript: ["JavaScript", "React", "Next.js", "Redux", "Node.js", "GraphQL", "Vite", "Jest"],
  react: ["Next.js", "Redux", "TypeScript", "JavaScript", "Tailwind CSS", "React Native", "GraphQL", "Vite", "Framer Motion"],
  "next.js": ["React", "TypeScript", "Tailwind CSS", "Redux", "GraphQL", "Node.js", "Vercel", "Prisma"],
  redux: ["React", "JavaScript", "TypeScript", "Next.js", "Redux Toolkit", "RTK Query"],
  html5: ["CSS3", "JavaScript", "Tailwind CSS", "Bootstrap", "Sass"],
  css3: ["HTML5", "JavaScript", "Tailwind CSS", "Sass", "Bootstrap", "Framer Motion"],
  "tailwind css": ["React", "Next.js", "HTML5", "CSS3", "TypeScript", "JavaScript"],
  
  // Backend & Databases
  "node.js": ["Express.js", "MongoDB", "PostgreSQL", "TypeScript", "GraphQL", "REST APIs", "Docker", "Redis"],
  "express.js": ["Node.js", "MongoDB", "PostgreSQL", "REST APIs", "JWT", "GraphQL", "TypeScript"],
  mongodb: ["Node.js", "Express.js", "Mongoose", "PostgreSQL", "Redis", "SQL"],
  postgresql: ["Node.js", "Prisma", "SQL", "MongoDB", "Redis", "Docker"],
  sql: ["PostgreSQL", "MySQL", "Oracle", "MongoDB", "Data Analysis", "Python"],
  
  // Python & Data Science & ML
  python: ["Django", "Flask", "Machine Learning", "Data Analysis", "Pandas", "NumPy", "TensorFlow", "PyTorch", "SQL", "Scikit-Learn"],
  django: ["Python", "Flask", "PostgreSQL", "REST APIs", "Docker", "Celery", "SQL"],
  flask: ["Python", "Django", "SQL", "REST APIs", "Docker", "HTML5"],
  "data analysis": ["Python", "Pandas", "NumPy", "SQL", "Excel", "Tableau", "Power BI", "Machine Learning"],
  "machine learning": ["Python", "Deep Learning", "Data Analysis", "Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-Learn", "Computer Vision"],
  tensorflow: ["PyTorch", "Python", "Machine Learning", "Deep Learning", "Keras"],
  pytorch: ["TensorFlow", "Python", "Machine Learning", "Deep Learning"],

  // Languages & enterprise
  java: ["Spring Boot", "Hibernate", "SQL", "JUnit", "Maven", "Kotlin", "C#"],
  "spring boot": ["Java", "Hibernate", "Microservices", "SQL", "REST APIs", "Docker"],
  "c#": ["Java", "SQL", "ASP.NET", "Unity", "C++"],
  "c++": ["C", "Python", "C#", "Algorithms", "Data Structures"],
  php: ["Laravel", "MySQL", "WordPress", "JavaScript", "HTML5", "CSS3"],
  laravel: ["PHP", "MySQL", "JavaScript", "Vue.js", "HTML5"]
};

const getNormalizedSkill = (s: string) => {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
};

const isAlreadyAdded = (skill: string, currentSkills: string[]) => {
  const normSkill = getNormalizedSkill(skill);
  return currentSkills.some(s => {
    const normS = getNormalizedSkill(s);
    if (normSkill === normS) return true;
    if ((normSkill === "html" && normS === "html5") || (normSkill === "html5" && normS === "html")) return true;
    if ((normSkill === "css" && normS === "css3") || (normSkill === "css3" && normS === "css")) return true;
    if ((normSkill === "js" && normS === "javascript") || (normSkill === "javascript" && normS === "js")) return true;
    return false;
  });
};

const getSuggestions = (currentSkills: string[]) => {
  const suggestionsMap: Record<string, number> = {};
  
  currentSkills.forEach(skill => {
    const lowercaseSkill = skill.toLowerCase();
    const recs = RECOMMENDATION_MAP[lowercaseSkill];
    if (recs) {
      recs.forEach(r => {
        if (!isAlreadyAdded(r, currentSkills)) {
          suggestionsMap[r] = (suggestionsMap[r] || 0) + 2;
        }
      });
    }
    
    Object.keys(RECOMMENDATION_MAP).forEach(key => {
      if (key !== lowercaseSkill && (key.includes(lowercaseSkill) || lowercaseSkill.includes(key))) {
        RECOMMENDATION_MAP[key].forEach(r => {
          if (!isAlreadyAdded(r, currentSkills)) {
            suggestionsMap[r] = (suggestionsMap[r] || 0) + 1;
          }
        });
      }
    });
  });

  let sortedSuggestions = Object.keys(suggestionsMap).sort((a, b) => suggestionsMap[b] - suggestionsMap[a]);

  if (sortedSuggestions.length === 0) {
    const popularSkills = [
      "JavaScript", "TypeScript", "React", "Node.js", "Python", 
      "Django", "Flask", "SQL", "Machine Learning", "Java", 
      "Spring Boot", "C#", "Tailwind CSS", "HTML5", "CSS3", "PHP"
    ];
    sortedSuggestions = popularSkills.filter(s => !isAlreadyAdded(s, currentSkills));
  }

  return sortedSuggestions.slice(0, 8);
};

export function CandidateSkillsTab({ formData, updateField, onSkillsAutoSaved }: CandidateSkillsTabProps) {
  const [newSkill, setNewSkill] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  const saveSkillsToDb = async (updatedSkills: string[]) => {
    setSaveStatus("saving");
    try {
      const body = {
        ...formData,
        skills: updatedSkills,
        jobTitle: formData.career.jobTitle || formData.jobTitle
      };
      
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      
      onSkillsAutoSaved(updatedSkills);
      setSaveStatus("saved");
      setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
    } catch (err) {
      console.error("Auto-save skills error:", err);
      setSaveStatus("error");
    }
  };

  const addSkill = (skillName?: string) => {
    const skillToAdd = (skillName || newSkill).trim();
    if (!skillToAdd) return;
    const current = formData.skills || [];
    if (isAlreadyAdded(skillToAdd, current)) return;
    const newSkills = [...current, skillToAdd];
    updateField("skills", newSkills);
    setNewSkill("");
    saveSkillsToDb(newSkills);
  };

  const removeSkill = (skill: string) => {
    const current = formData.skills || [];
    const newSkills = current.filter((s: string) => s !== skill);
    updateField("skills", newSkills);
    saveSkillsToDb(newSkills);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      addSkill();
    }
  };

  const suggestions = getSuggestions(formData.skills || []);

  const displaySuggestions = suggestions;

  return (
    <div className="space-y-6 text-left text-foreground">
      {/* Title & Subtitle */}
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-foreground">Key Skills</h3>
        <p className="text-xs text-muted-foreground font-medium">
          Add skills that best define your expertise.
        </p>
      </div>

      {/* Your Skills Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-foreground/80">Your skills</label>
          {saveStatus !== "idle" && (
            <span className={`text-[10px] font-bold ${
              saveStatus === "saving" ? "text-indigo-500 animate-pulse" :
              saveStatus === "saved" ? "text-emerald-500" :
              "text-rose-500"
            }`}>
              {saveStatus === "saving" ? "Saving to database..." :
               saveStatus === "saved" ? "Saved successfully!" :
               "Failed to save"}
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 min-h-[40px]">
          {(formData.skills || []).length > 0 ? (
            (formData.skills || []).map((s: string) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200/40 dark:border-neutral-800/40 text-xs font-semibold text-foreground"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(s)}
                  className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground font-medium py-1.5">
              No skills added yet.
            </span>
          )}
        </div>
      </div>

      {/* Input Field */}
      <div className="space-y-2">
        <Input
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Add skills and press Enter"
          className="h-10 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-background/50 focus-visible:ring-1 focus-visible:ring-indigo-500 w-full"
        />
      </div>

      {/* Suggested Skills */}
      {displaySuggestions.length > 0 && (
        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-foreground/80">
            Or you can select from the suggested set of skills
          </p>
          <div className="flex flex-wrap gap-2">
            {displaySuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addSkill(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-neutral-50/5 dark:bg-neutral-950/5 hover:bg-neutral-100/20 dark:hover:bg-neutral-900/20 text-foreground cursor-pointer transition-all duration-200"
              >
                <span>{s}</span>
                <Plus className="w-3 h-3 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

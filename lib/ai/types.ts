export interface RecommendationInput {
  ageMonths: number;
  childName: string;
  category: string;
  loggedMilestones: {
    name: string;
    status: string;
    observedDate: string | null;
  }[];
  wordCount?: number;
  phraseCount?: number;
}

export interface RecommendationItem {
  title: string;
  description: string;
  activities: string[];
}

export interface RecommendationOutput {
  recommendations: RecommendationItem[];
}

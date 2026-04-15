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

export interface PredictionInput {
  ageMonths: number;
  childName: string;
  milestones: {
    category: string;
    name: string;
    status: string;
  }[];
  wordCount: number;
  phraseCount: number;
}

export interface PredictionItem {
  category: string;
  title: string;
  description: string;
  timeframe: string;
  signs: string[];
}

export interface PredictionOutput {
  predictions: PredictionItem[];
}

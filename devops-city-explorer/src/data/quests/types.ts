export interface ValidationRule {
  pattern: string;
  message: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface QuestChallenge {
  type: string;
  language?: string;
  initialCode?: string;
  validation?: ValidationRule[];
  hints: string[];
  solutionExample: string;
  questions?: QuizQuestion[];
  sequenceSteps?: string[];
}

export interface QuestReward {
  slaBonus: number;
  credits: number;
  badge: string;
}

export interface QuestDialogue {
  avatar: string;
  name: string;
  lines: string[];
}

export interface QuestDocument {
  title: string;
  theory: string;
}

export interface QuestData {
  id: string;
  zone: string;
  title: string;
  category: string;
  difficulty: string;
  reward: QuestReward;
  npc?: string;
  dialogue?: QuestDialogue;
  document: QuestDocument;
  challenge: QuestChallenge;
  prerequisites?: string[];
  unlocks?: string[];
}
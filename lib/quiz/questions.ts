export interface QuizQuestion {
  id: string;
  category: string;
  minMonths: number;
  maxMonths: number;
  text: string;
  milestoneIfYes: string;
}

export const quizQuestions: QuizQuestion[] = [
  // === LANGUAGE (CDC 2022 revised) ===
  // 2-4 months
  { id: "lang-01", category: "language", minMonths: 2, maxMonths: 5, text: "Does your child coo or make gurgling sounds?", milestoneIfYes: "Cooing and gurgling" },
  { id: "lang-02", category: "language", minMonths: 2, maxMonths: 5, text: "Does your child turn their head toward sounds?", milestoneIfYes: "Turns toward sounds" },
  // 6-8 months
  { id: "lang-03", category: "language", minMonths: 6, maxMonths: 9, text: "Does your child babble (e.g., 'bababa', 'mamama')?", milestoneIfYes: "Babbling consonant sounds" },
  { id: "lang-04", category: "language", minMonths: 6, maxMonths: 9, text: "Does your child respond to their own name?", milestoneIfYes: "Responds to name" },
  // 9-11 months
  { id: "lang-05", category: "language", minMonths: 9, maxMonths: 12, text: "Does your child understand 'no'?", milestoneIfYes: "Understands 'no'" },
  { id: "lang-06", category: "language", minMonths: 9, maxMonths: 12, text: "Does your child wave bye-bye or use other gestures?", milestoneIfYes: "Uses gestures (waving, pointing)" },
  // 12-14 months
  { id: "lang-07", category: "language", minMonths: 12, maxMonths: 15, text: "Does your child say 1-3 words (like 'mama' or 'dada') with meaning?", milestoneIfYes: "First words with meaning" },
  { id: "lang-08", category: "language", minMonths: 12, maxMonths: 15, text: "Does your child point to things they want?", milestoneIfYes: "Points to desired objects" },
  // 15-17 months
  { id: "lang-09", category: "language", minMonths: 15, maxMonths: 18, text: "Does your child say 3 or more words besides 'mama' and 'dada'?", milestoneIfYes: "3+ words in vocabulary" },
  { id: "lang-10", category: "language", minMonths: 15, maxMonths: 18, text: "Does your child follow simple directions (like 'give me the ball')?", milestoneIfYes: "Follows simple directions" },
  // 18-23 months
  { id: "lang-11", category: "language", minMonths: 18, maxMonths: 24, text: "Does your child say 10 or more words?", milestoneIfYes: "10+ word vocabulary" },
  { id: "lang-12", category: "language", minMonths: 18, maxMonths: 24, text: "Does your child point to things in a book when asked (like 'where's the dog?')?", milestoneIfYes: "Points to pictures in books" },
  // 24-35 months
  { id: "lang-13", category: "language", minMonths: 24, maxMonths: 36, text: "Does your child put 2 words together (like 'more milk' or 'go outside')?", milestoneIfYes: "Two-word phrases" },
  { id: "lang-14", category: "language", minMonths: 24, maxMonths: 36, text: "Does your child say 50 or more words?", milestoneIfYes: "50+ word vocabulary" },

  // === GROSS MOTOR (CDC 2022 revised) ===
  // 2-4 months
  { id: "gross-01", category: "gross_motor", minMonths: 2, maxMonths: 5, text: "Can your child hold their head up when on their tummy?", milestoneIfYes: "Head control during tummy time" },
  { id: "gross-02", category: "gross_motor", minMonths: 2, maxMonths: 5, text: "Does your child push up on arms during tummy time?", milestoneIfYes: "Pushes up on arms" },
  // 6-8 months
  { id: "gross-03", category: "gross_motor", minMonths: 6, maxMonths: 9, text: "Can your child sit without support?", milestoneIfYes: "Sitting independently" },
  { id: "gross-04", category: "gross_motor", minMonths: 6, maxMonths: 9, text: "Does your child roll over in both directions?", milestoneIfYes: "Rolling both directions" },
  // 9-11 months
  { id: "gross-05", category: "gross_motor", minMonths: 9, maxMonths: 12, text: "Does your child crawl?", milestoneIfYes: "Crawling" },
  { id: "gross-06", category: "gross_motor", minMonths: 9, maxMonths: 12, text: "Can your child pull themselves up to standing?", milestoneIfYes: "Pulling to stand" },
  // 12-14 months
  { id: "gross-07", category: "gross_motor", minMonths: 12, maxMonths: 15, text: "Does your child walk while holding onto furniture (cruising)?", milestoneIfYes: "Cruising along furniture" },
  { id: "gross-08", category: "gross_motor", minMonths: 12, maxMonths: 15, text: "Can your child take a few steps without holding on?", milestoneIfYes: "First independent steps" },
  // 15-17 months
  { id: "gross-09", category: "gross_motor", minMonths: 15, maxMonths: 18, text: "Does your child walk independently?", milestoneIfYes: "Walking independently" },
  // 18-23 months
  { id: "gross-10", category: "gross_motor", minMonths: 18, maxMonths: 24, text: "Can your child run?", milestoneIfYes: "Running" },
  { id: "gross-11", category: "gross_motor", minMonths: 18, maxMonths: 24, text: "Can your child kick a ball?", milestoneIfYes: "Kicking a ball" },
  // 24-35 months
  { id: "gross-12", category: "gross_motor", minMonths: 24, maxMonths: 36, text: "Can your child jump with both feet off the ground?", milestoneIfYes: "Jumping with both feet" },
  { id: "gross-13", category: "gross_motor", minMonths: 24, maxMonths: 36, text: "Can your child climb on and off furniture without help?", milestoneIfYes: "Climbing furniture independently" },

  // === FINE MOTOR (CDC 2022 revised) ===
  // 2-4 months
  { id: "fine-01", category: "fine_motor", minMonths: 2, maxMonths: 5, text: "Does your child open and close their hands?", milestoneIfYes: "Opening and closing hands" },
  { id: "fine-02", category: "fine_motor", minMonths: 2, maxMonths: 5, text: "Does your child bring hands to mouth?", milestoneIfYes: "Brings hands to mouth" },
  // 6-8 months
  { id: "fine-03", category: "fine_motor", minMonths: 6, maxMonths: 9, text: "Can your child pass a toy from one hand to the other?", milestoneIfYes: "Transfers objects between hands" },
  { id: "fine-04", category: "fine_motor", minMonths: 6, maxMonths: 9, text: "Does your child use a raking grasp to pick up small objects?", milestoneIfYes: "Raking grasp" },
  // 9-11 months
  { id: "fine-05", category: "fine_motor", minMonths: 9, maxMonths: 12, text: "Can your child pick up small things with thumb and finger (pincer grasp)?", milestoneIfYes: "Pincer grasp" },
  { id: "fine-06", category: "fine_motor", minMonths: 9, maxMonths: 12, text: "Does your child bang two objects together?", milestoneIfYes: "Banging objects together" },
  // 12-14 months
  { id: "fine-07", category: "fine_motor", minMonths: 12, maxMonths: 15, text: "Does your child put things in and out of a container?", milestoneIfYes: "Puts objects in/out of containers" },
  { id: "fine-08", category: "fine_motor", minMonths: 12, maxMonths: 15, text: "Can your child stack 2 blocks?", milestoneIfYes: "Stacking 2 blocks" },
  // 15-17 months
  { id: "fine-09", category: "fine_motor", minMonths: 15, maxMonths: 18, text: "Does your child scribble with a crayon?", milestoneIfYes: "Scribbling with crayon" },
  { id: "fine-10", category: "fine_motor", minMonths: 15, maxMonths: 18, text: "Does your child try to use a spoon to feed themselves?", milestoneIfYes: "Attempts self-feeding with spoon" },
  // 18-23 months
  { id: "fine-11", category: "fine_motor", minMonths: 18, maxMonths: 24, text: "Can your child stack 4 or more blocks?", milestoneIfYes: "Stacking 4+ blocks" },
  { id: "fine-12", category: "fine_motor", minMonths: 18, maxMonths: 24, text: "Can your child turn pages of a book (maybe several at a time)?", milestoneIfYes: "Turning book pages" },
  // 24-35 months
  { id: "fine-13", category: "fine_motor", minMonths: 24, maxMonths: 36, text: "Can your child turn door handles?", milestoneIfYes: "Turning door handles" },
  { id: "fine-14", category: "fine_motor", minMonths: 24, maxMonths: 36, text: "Can your child string large beads?", milestoneIfYes: "Stringing large beads" },
];

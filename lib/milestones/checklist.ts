export interface MilestoneMarker {
  name: string;
  minMonths: number;
  maxMonths: number;
}

const grossMotorMarkers: MilestoneMarker[] = [
  { name: "Head control during tummy time", minMonths: 0, maxMonths: 4 },
  { name: "Pushes up on arms", minMonths: 2, maxMonths: 5 },
  { name: "Rolling both directions", minMonths: 4, maxMonths: 7 },
  { name: "Sitting independently", minMonths: 5, maxMonths: 9 },
  { name: "Crawling", minMonths: 7, maxMonths: 12 },
  { name: "Pulling to stand", minMonths: 8, maxMonths: 12 },
  { name: "Cruising along furniture", minMonths: 9, maxMonths: 14 },
  { name: "First independent steps", minMonths: 10, maxMonths: 15 },
  { name: "Walking independently", minMonths: 12, maxMonths: 18 },
  { name: "Running", minMonths: 15, maxMonths: 24 },
  { name: "Kicking a ball", minMonths: 18, maxMonths: 24 },
  { name: "Jumping with both feet", minMonths: 22, maxMonths: 36 },
  { name: "Climbing furniture independently", minMonths: 22, maxMonths: 36 },
  { name: "Walking up stairs with help", minMonths: 18, maxMonths: 30 },
  { name: "Throwing a ball overhand", minMonths: 18, maxMonths: 30 },
];

const fineMotorMarkers: MilestoneMarker[] = [
  { name: "Opening and closing hands", minMonths: 0, maxMonths: 4 },
  { name: "Brings hands to mouth", minMonths: 2, maxMonths: 5 },
  { name: "Reaching for objects", minMonths: 3, maxMonths: 6 },
  { name: "Transfers objects between hands", minMonths: 5, maxMonths: 9 },
  { name: "Raking grasp", minMonths: 6, maxMonths: 9 },
  { name: "Pincer grasp", minMonths: 8, maxMonths: 12 },
  { name: "Banging objects together", minMonths: 8, maxMonths: 12 },
  { name: "Puts objects in/out of containers", minMonths: 10, maxMonths: 15 },
  { name: "Stacking 2 blocks", minMonths: 11, maxMonths: 15 },
  { name: "Scribbling with crayon", minMonths: 12, maxMonths: 18 },
  { name: "Attempts self-feeding with spoon", minMonths: 12, maxMonths: 18 },
  { name: "Stacking 4+ blocks", minMonths: 16, maxMonths: 24 },
  { name: "Turning book pages", minMonths: 16, maxMonths: 24 },
  { name: "Turning door handles", minMonths: 22, maxMonths: 36 },
  { name: "Stringing large beads", minMonths: 24, maxMonths: 36 },
];

const markers: Record<string, MilestoneMarker[]> = {
  gross_motor: grossMotorMarkers,
  fine_motor: fineMotorMarkers,
};

export function getMilestoneChecklist(
  category: string,
  ageMonths: number
): string[] {
  const list = markers[category] || [];
  return list
    .filter((m) => ageMonths >= m.minMonths - 2)
    .map((m) => m.name);
}

export function getAllMarkers(category: string): MilestoneMarker[] {
  return markers[category] || [];
}

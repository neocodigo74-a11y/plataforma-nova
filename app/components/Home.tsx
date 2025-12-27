// @/app/components/Home.tsx (ou o caminho onde sua Home está)

import AllSkillsSections from "./AllSkillsSections";
import LearningCard from "./LearningCard";
export default function Home({ onCourseSelect }) { // 1. Recebe o "bastão" aqui
  return (
    <main className="min-h-screen bg-white space-y-3 pt-2">
      {/* 2. Entrega o "bastão" para o AllSkillsSections */}
      <AllSkillsSections onCourseSelect={onCourseSelect} />
      <LearningCard />
    </main>
  );
}
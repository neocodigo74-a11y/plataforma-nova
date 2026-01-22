"use client";

import AllSkillsSections, { SkillItem } from "./AllSkillsSections";
import ListPost from "./postList";



interface HomeProps {
  onCourseSelect: (course: SkillItem) => void;
}

export default function Home({ onCourseSelect }: HomeProps) {
  return (
    <main className="min-h-screen bg-white space-y-3 pt-1">
      {/* Entrega o "bastão" para o AllSkillsSections 
      <AllSkillsSections onCourseSelect={onCourseSelect} /> */} 
      
     <ListPost /> 
     
      
     
    </main>
  );
}

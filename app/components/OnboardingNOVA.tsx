"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Rocket,
  Users,
  Briefcase,
  CheckCircle,
} from "lucide-react";

type TipoConta =
  | "estudante"
  | "usuario"
  | "consultor"
  | "startup";

/* 🔹 SIMULA USER VINDO DO AUTH */
const user = {
  tipoConta: "estudante" as TipoConta,
};

export default function OnboardingNOVA() {
  const [step, setStep] = useState(1);

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">

        <Progress step={step} total={getTotalSteps(user.tipoConta)} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
          >
            {renderStep(user.tipoConta, step, next, back)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =======================
   RENDER DINÂMICO
======================= */
function renderStep(
  tipo: TipoConta,
  step: number,
  next: () => void,
  back: () => void
) {
  switch (tipo) {
    case "estudante":
      return estudanteSteps(step, next, back);
    case "usuario":
      return usuarioSteps(step, next, back);
    case "consultor":
      return consultorSteps(step, next, back);
    case "startup":
      return startupSteps(step, next, back);
  }
}

/* =======================
   ESTUDANTE
======================= */
function estudanteSteps(step: number, next: () => void, back: () => void) {
  if (step === 1)
    return (
      <Welcome
        title="Bem-vindo, estudante 🎓"
        text="Vamos personalizar sua jornada no NOVA."
        onNext={next}
      />
    );

  if (step === 2)
    return (
      <Objective
        options={[
          { label: "Aprender & Certificar", icon: <GraduationCap /> },
          { label: "Networking acadêmico", icon: <Users /> },
          { label: "Projetos e desafios", icon: <Rocket /> },
        ]}
        onNext={next}
        onBack={back}
      />
    );

  if (step === 3)
    return (
      <FinalStep
        text="Seu perfil de estudante está pronto 🚀"
        onFinish={next}
      />
    );
}

/* =======================
   USUÁRIO
======================= */
function usuarioSteps(step: number, next: () => void, back: () => void) {
  if (step === 1)
    return (
      <Welcome
        title="Bem-vindo ao NOVA"
        text="Descubra oportunidades alinhadas a você."
        onNext={next}
      />
    );

  if (step === 2)
    return (
      <Objective
        options={[
          { label: "Networking profissional", icon: <Users /> },
          { label: "Projetos", icon: <Rocket /> },
        ]}
        onNext={next}
        onBack={back}
      />
    );

  if (step === 3)
    return (
      <FinalStep
        text="Tudo pronto! Comece a explorar 🚀"
        onFinish={next}
      />
    );
}

/* =======================
   CONSULTOR
======================= */
function consultorSteps(step: number, next: () => void, back: () => void) {
  if (step === 1)
    return (
      <Welcome
        title="Bem-vindo, consultor 🧑‍💼"
        text="Vamos conectar você a projetos reais."
        onNext={next}
      />
    );

  if (step === 2)
    return (
      <Objective
        options={[
          { label: "Projetos pagos", icon: <Briefcase /> },
          { label: "Mentorias", icon: <Users /> },
        ]}
        onNext={next}
        onBack={back}
      />
    );

  if (step === 3)
    return (
      <FinalStep
        text="Perfil ativo! Bora trabalhar 💼"
        onFinish={next}
      />
    );
}

/* =======================
   STARTUP
======================= */
function startupSteps(step: number, next: () => void, back: () => void) {
  if (step === 1)
    return (
      <Welcome
        title="Bem-vindo, startup 🚀"
        text="Vamos impulsionar seu crescimento."
        onNext={next}
      />
    );

  if (step === 2)
    return (
      <Objective
        options={[
          { label: "Buscar investimento", icon: <Rocket /> },
          { label: "Montar equipe", icon: <Users /> },
        ]}
        onNext={next}
        onBack={back}
      />
    );

  if (step === 3)
    return (
      <FinalStep
        text="Startup pronta para escalar 🚀"
        onFinish={next}
      />
    );
}

/* =======================
   COMPONENTES
======================= */
function Welcome({ title, text, onNext }: any) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-gray-600">{text}</p>
      <button onClick={onNext} className="btn-primary">
        Começar
      </button>
    </div>
  );
}

function Objective({ options, onNext, onBack }: any) {
  const [selected, setSelected] = useState("");

  return (
    <div className="space-y-4">
      <h2 className="font-semibold">Seu objetivo</h2>

      {options.map((o: any) => (
        <button
          key={o.label}
          onClick={() => setSelected(o.label)}
          className={`w-full flex items-center gap-3 p-4 border rounded-xl
          ${
            selected === o.label
              ? "border-black bg-gray-100"
              : "border-gray-200"
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}

      <Footer
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selected}
      />
    </div>
  );
}

function FinalStep({ text, onFinish }: any) {
  return (
    <div className="text-center space-y-4">
      <CheckCircle size={48} className="mx-auto" />
      <p>{text}</p>
      <button onClick={onFinish} className="btn-primary">
        Entrar na plataforma
      </button>
    </div>
  );
}

function Footer({ onBack, onNext, nextDisabled }: any) {
  return (
    <div className="flex justify-between mt-6">
      <button onClick={onBack} className="text-gray-600">
        Voltar
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="btn-primary disabled:opacity-50"
      >
        Próximo
      </button>
    </div>
  );
}

function Progress({ step, total }: any) {
  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        <span>Onboarding</span>
        <span>
          {step}/{total}
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <motion.div
          className="h-2 bg-black rounded-full"
          animate={{ width: `${(step / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function getTotalSteps(tipo: TipoConta) {
  return 3;
}

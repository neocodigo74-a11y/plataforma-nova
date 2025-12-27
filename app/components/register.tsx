"use client";

import { useState } from "react";
import {
  GraduationCap,
  User,
  Briefcase,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function CadastroStepForm() {
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    tipoConta: "",
    maiorIdade: "",
    primeiroNome: "",
    segundoNome: "",
    nomeCompleto: "",
    email: "",
    escolaridade: "",
    vincularUniversidade: "",
  });

  function updateField(field: string, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function nextStep() {
    setStep((prev) => prev + 1);
  }

  function prevStep() {
    setStep((prev) => prev - 1);
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6 text-center">
        Criar conta
      </h1>

      {/* PASSO 1 — TIPO DE CONTA */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="font-medium">Selecione o tipo de conta</p>

          <Option
            icon={<GraduationCap />}
            label="Estudante"
            active={formData.tipoConta === "estudante"}
            onClick={() => updateField("tipoConta", "estudante")}
          />
          <Option
            icon={<Briefcase />}
            label="Consultor Freelancer"
            active={formData.tipoConta === "consultor"}
            onClick={() => updateField("tipoConta", "consultor")}
          />
          <Option
            icon={<Rocket />}
            label="Startup"
            active={formData.tipoConta === "startup"}
            onClick={() => updateField("tipoConta", "startup")}
          />
          <Option
            icon={<User />}
            label="Usuário"
            active={formData.tipoConta === "usuario"}
            onClick={() => updateField("tipoConta", "usuario")}
          />

          <ButtonNext onClick={nextStep} disabled={!formData.tipoConta} />
        </div>
      )}

      {/* PASSO 2 — MAIOR DE IDADE */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="font-medium">Você é maior de 18 anos?</p>

          <Option
            label="Sim"
            active={formData.maiorIdade === "sim"}
            onClick={() => updateField("maiorIdade", "sim")}
          />
          <Option
            label="Não"
            active={formData.maiorIdade === "nao"}
            onClick={() => updateField("maiorIdade", "nao")}
          />

          <FooterNav
            nextDisabled={formData.maiorIdade !== "sim"}
            onNext={nextStep}
            onBack={prevStep}
          />
        </div>
      )}

      {/* PASSO 3 — DADOS PESSOAIS */}
      {step === 3 && (
        <div className="space-y-4">
          <Input label="Primeiro nome" onChange={(e) => updateField("primeiroNome", e.target.value)} />
          <Input label="Segundo nome" onChange={(e) => updateField("segundoNome", e.target.value)} />
          <Input label="Nome completo" onChange={(e) => updateField("nomeCompleto", e.target.value)} />
          <Input label="Email" type="email" onChange={(e) => updateField("email", e.target.value)} />

          <FooterNav onNext={nextStep} onBack={prevStep} />
        </div>
      )}

      {/* PASSO 4 — ESCOLARIDADE */}
      {(formData.tipoConta === "estudante" ||
        formData.tipoConta === "usuario") &&
        step === 4 && (
          <div className="space-y-4">
            <p className="font-medium">Nível de formação</p>

            <Option
              label="Ensino Médio"
              active={formData.escolaridade === "medio"}
              onClick={() => updateField("escolaridade", "medio")}
            />
            <Option
              label="Universidade"
              active={formData.escolaridade === "universidade"}
              onClick={() => updateField("escolaridade", "universidade")}
            />

            <FooterNav onNext={nextStep} onBack={prevStep} />
          </div>
        )}

      {/* PASSO 5 — VINCULAR UNIVERSIDADE */}
      {formData.tipoConta === "estudante" &&
        formData.escolaridade === "universidade" &&
        step === 5 && (
          <div className="space-y-4">
            <p className="font-medium">
              Deseja vincular-se a uma universidade?
            </p>

            <Option
              label="Vincular agora"
              active={formData.vincularUniversidade === "sim"}
              onClick={() => updateField("vincularUniversidade", "sim")}
            />
            <Option
              label="Agora não"
              active={formData.vincularUniversidade === "nao"}
              onClick={() => updateField("vincularUniversidade", "nao")}
            />

            <FooterNav onNext={() => alert("Fluxo finalizado (UI)")} onBack={prevStep} />
          </div>
        )}
    </div>
  );
}

/* COMPONENTES AUXILIARES */

function Option({ icon, label, active, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 border rounded-xl transition
      ${active ? "border-black bg-gray-100" : "border-gray-200 hover:bg-gray-50"}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function Input({ label, ...props }: any) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full mt-1 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}

function ButtonNext({ onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full mt-4 flex justify-center items-center gap-2 bg-black text-white p-3 rounded-xl disabled:opacity-50"
    >
      Próximo <ArrowRight size={18} />
    </button>
  );
}

function FooterNav({ onNext, onBack, nextDisabled }: any) {
  return (
    <div className="flex justify-between mt-6">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-600">
        <ArrowLeft size={18} /> Voltar
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="flex items-center gap-2 bg-black text-white px-6 py-2 rounded-xl disabled:opacity-50"
      >
        Próximo <ArrowRight size={18} />
      </button>
    </div>
  );
}

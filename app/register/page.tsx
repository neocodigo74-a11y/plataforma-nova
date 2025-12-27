"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  User,
  Briefcase,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

/* =======================
   MOCK UNIVERSIDADES
======================= */
const universidadesMock = [
  "Universidade Agostinho Neto",
  "Universidade Católica de Angola",
  "Universidade Metodista",
  "Universidade Lusíada",
];

/* =======================
   TIPOS
======================= */
interface FormData {
  tipoConta: string;
  maiorIdade: string;
  primeiroNome: string;
  segundoNome: string;
  nomeCompleto: string;
  email: string;
  escolaridade: string;
  vincularUniversidade: string;
}

export default function CadastroStepForm() {
  const router = useRouter();

  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
  const [step, setStep] = useState<number>(1);
  const [openUniversityModal, setOpenUniversityModal] =
    useState<boolean>(false);
  const [universidadeSelecionada, setUniversidadeSelecionada] =
    useState<string>("");

  const [formData, setFormData] = useState<FormData>({
    tipoConta: "",
    maiorIdade: "",
    primeiroNome: "",
    segundoNome: "",
    nomeCompleto: "",
    email: "",
    escolaridade: "",
    vincularUniversidade: "",
  });

  /* =======================
     VERIFICA LOGIN
  ======================= */
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        router.replace("/academia");
        return;
      }

      setLoadingAuth(false);
    };

    checkSession();
  }, [router]);

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Verificando sessão...</p>
      </div>
    );
  }

  function update(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  const step3Valido =
    formData.primeiroNome.length >= 2 &&
    formData.nomeCompleto.length >= 4 &&
    emailValido;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Criar conta
        </h1>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            {/* PASSO 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="font-medium">Tipo de conta</p>

                <Option
                  icon={<GraduationCap />}
                  label="Estudante"
                  active={formData.tipoConta === "estudante"}
                  onClick={() => update("tipoConta", "estudante")}
                />
                <Option
                  icon={<Briefcase />}
                  label="Consultor Freelancer"
                  active={formData.tipoConta === "consultor"}
                  onClick={() => update("tipoConta", "consultor")}
                />
                <Option
                  icon={<Rocket />}
                  label="Startup"
                  active={formData.tipoConta === "startup"}
                  onClick={() => update("tipoConta", "startup")}
                />
                <Option
                  icon={<User />}
                  label="Usuário"
                  active={formData.tipoConta === "usuario"}
                  onClick={() => update("tipoConta", "usuario")}
                />

                <ButtonNext onClick={next} disabled={!formData.tipoConta} />
              </div>
            )}

            {/* PASSO 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="font-medium">Você é maior de 18 anos?</p>

                <Option
                  label="Sim"
                  active={formData.maiorIdade === "sim"}
                  onClick={() => update("maiorIdade", "sim")}
                />
                <Option
                  label="Não"
                  active={formData.maiorIdade === "nao"}
                  onClick={() => update("maiorIdade", "nao")}
                />

                <Footer
                  onBack={back}
                  onNext={next}
                  nextDisabled={formData.maiorIdade !== "sim"}
                />
              </div>
            )}

            {/* PASSO 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <Input
                  label="Primeiro nome"
                  value={formData.primeiroNome}
                  onChange={(e) =>
                    update("primeiroNome", e.target.value)
                  }
                />
                <Input
                  label="Segundo nome"
                  value={formData.segundoNome}
                  onChange={(e) =>
                    update("segundoNome", e.target.value)
                  }
                />
                <Input
                  label="Nome completo"
                  value={formData.nomeCompleto}
                  onChange={(e) =>
                    update("nomeCompleto", e.target.value)
                  }
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    update("email", e.target.value)
                  }
                />

                {!emailValido && formData.email && (
                  <p className="text-sm text-red-500">
                    Email inválido
                  </p>
                )}

                <Footer
                  onBack={back}
                  onNext={next}
                  nextDisabled={!step3Valido}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =======================
   COMPONENTES UI
======================= */
interface OptionProps {
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

function Option({ icon, label, active, onClick }: OptionProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-4 border rounded-xl transition
      ${
        active
          ? "border-black bg-gray-100"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function Input({ label, ...props }: InputProps) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <input
        {...props}
        className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
      />
    </div>
  );
}

interface ButtonNextProps {
  onClick: () => void;
  disabled?: boolean;
}

function ButtonNext({ onClick, disabled }: ButtonNextProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full mt-4 bg-black text-white p-3 rounded-xl flex justify-center items-center gap-2 disabled:opacity-50"
    >
      Próximo <ArrowRight size={18} />
    </button>
  );
}

interface FooterProps {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}

function Footer({ onBack, onNext, nextDisabled }: FooterProps) {
  return (
    <div className="flex justify-between mt-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600"
      >
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

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  User,
  Briefcase,
  Rocket,
  ArrowLeft,
  CalendarCheck,
  Key,
  Mail,
  Users,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

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
  senha: string;
}

/* =======================
   COMPONENTE
======================= */
export default function CadastroStepForm() {
  const router = useRouter();

  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [showSocialStep, setShowSocialStep] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    tipoConta: "",
    maiorIdade: "",
    primeiroNome: "",
    segundoNome: "",
    nomeCompleto: "",
    email: "",
    senha: "",
  });

  /* =======================
     VERIFICA SESSÃO
  ======================= */
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
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
        Verificando sessão...
      </div>
    );
  }

  /* =======================
     FUNÇÕES
  ======================= */
  function update<K extends keyof FormData>(field: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleChange<K extends keyof FormData>(field: K) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      update(field, e.target.value);
    };
  }

  function next() {
    setStep((s) => s + 1);
  }

  function back() {
    setStep((s) => s - 1);
  }

  async function signInWithGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      alert("Erro ao iniciar sessão com Google: " + error.message);
      setLoading(false);
    }
  }

  async function finalizarCadastro() {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.senha,
      options: {
        data: {
          tipo: formData.tipoConta,
          primeiro_nome: formData.primeiroNome,
          segundo_nome: formData.segundoNome,
          nome_completo: formData.nomeCompleto,
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      alert("Erro ao criar usuário");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("usuarios")
      .insert({
        id: userId,
        tipo: formData.tipoConta,
        nome: formData.primeiroNome,
        segundo_nome: formData.segundoNome,
        nome_completo: formData.nomeCompleto,
        email: formData.email,
      });

    if (insertError) {
      alert("Erro ao salvar perfil: " + insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.replace("/academia");
  }

  /* =======================
     VALIDAÇÕES
  ======================= */
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);
  const senhaValida = formData.senha.length >= 6;

  const step3Valido =
    formData.primeiroNome.length >= 2 &&
    formData.nomeCompleto.length >= 4 &&
    emailValido &&
    senhaValida;

  const totalSteps = 3;

  /* =======================
     UI
  ======================= */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">

        {/* BARRA DE PROGRESSO */}
        {!showSocialStep && (
          <div className="mb-6">
            <div className="w-full bg-gray-200 h-2 rounded-full">
              <div
                className="bg-black h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((step + 1) / totalSteps) * 100}%`,
                }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1 text-right">
              Passo {step + 1} de {totalSteps}
            </p>
          </div>
        )}

        <h1 className="text-2xl font-bold text-center mb-6">Criar conta</h1>

        <AnimatePresence mode="wait">
          {showSocialStep ? (
            <motion.div
              key="social"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4 text-center">
                <h2 className="text-xl font-semibold mb-4">
                  Quer iniciar com Google?
                </h2>
                <button
                  onClick={signInWithGoogle}
                  disabled={loading}
                  className="w-full bg-red-500 text-white p-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Users size={20} /> Entrar com Google
                </button>
                <p className="text-gray-500 mt-2">ou continuar com cadastro manual</p>
                <button
                  onClick={() => setShowSocialStep(false)}
                  className="w-full bg-gray-200 text-black p-3 rounded-xl"
                >
                  Continuar
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              {/* PASSO 1 */}
              {step === 0 && (
                <div className="space-y-4">
                  <Option
                    label="Estudante"
                    icon={<GraduationCap />}
                    active={formData.tipoConta === "estudante"}
                    onClick={() => update("tipoConta", "estudante")}
                  />
                  <Option
                    label="Consultor"
                    icon={<Briefcase />}
                    active={formData.tipoConta === "consultor"}
                    onClick={() => update("tipoConta", "consultor")}
                  />
                  <Option
                    label="Startup"
                    icon={<Rocket />}
                    active={formData.tipoConta === "startup"}
                    onClick={() => update("tipoConta", "startup")}
                  />
                  <Option
                    label="Usuário"
                    icon={<User />}
                    active={formData.tipoConta === "usuario"}
                    onClick={() => update("tipoConta", "usuario")}
                  />
                  <ButtonNext onClick={next} disabled={!formData.tipoConta} />
                </div>
              )}

              {/* PASSO 2 */}
              {step === 1 && (
                <div className="space-y-4 text-center">
                  <h2 className="text-lg font-semibold flex items-center justify-center gap-2">
                    <CalendarCheck /> Você é maior de idade?
                  </h2>
                  <div className="flex justify-center gap-4 mt-4">
                    <button
                      onClick={() => update("maiorIdade", "sim")}
                      className={`px-6 py-3 rounded-xl ${
                        formData.maiorIdade === "sim"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => update("maiorIdade", "nao")}
                      className={`px-6 py-3 rounded-xl ${
                        formData.maiorIdade === "nao"
                          ? "bg-black text-white"
                          : "bg-gray-200 text-black"
                      }`}
                    >
                      Não
                    </button>
                  </div>
                  <Footer
                    onBack={back}
                    onNext={next}
                    nextDisabled={formData.maiorIdade !== "sim"}
                  />
                </div>
              )}

              {/* PASSO 3 */}
              {step === 2 && (
                <div className="space-y-4">
                  <Input
                    label="Primeiro nome"
                    icon={<User />}
                    value={formData.primeiroNome}
                    onChange={handleChange("primeiroNome")}
                  />
                  <Input
                    label="Segundo nome"
                    icon={<User />}
                    value={formData.segundoNome}
                    onChange={handleChange("segundoNome")}
                  />
                  <Input
                    label="Nome completo"
                    icon={<Users />}
                    value={formData.nomeCompleto}
                    onChange={handleChange("nomeCompleto")}
                  />
                  <Input
                    label="Email"
                    icon={<Mail />}
                    type="email"
                    value={formData.email}
                    onChange={handleChange("email")}
                  />
                  <Input
                    label="Senha (mín. 6 caracteres)"
                    icon={<Key />}
                    type="password"
                    value={formData.senha}
                    onChange={handleChange("senha")}
                  />

                  {!senhaValida && formData.senha && (
                    <p className="text-sm text-red-500">
                      A senha deve ter no mínimo 6 caracteres
                    </p>
                  )}

                  <Footer
                    onBack={back}
                    onNext={finalizarCadastro}
                    nextDisabled={!step3Valido || loading}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* =======================
   COMPONENTES
======================= */
function Option({
  label,
  active,
  icon,
  onClick,
}: {
  label: string;
  active: boolean;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 border rounded-xl flex items-center gap-3 ${
        active ? "bg-gray-100 border-black" : ""
      }`}
    >
      {icon} {label}
    </button>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string; icon: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm text-gray-600 flex items-center gap-2">
        {props.icon} {props.label}
      </label>
      <input
        {...props}
        className="w-full mt-1 p-3 border rounded-xl focus:ring-2 focus:ring-black outline-none"
      />
    </div>
  );
}

function ButtonNext({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full bg-black text-white p-3 rounded-xl disabled:opacity-50"
    >
      Próximo
    </button>
  );
}

function Footer({
  onBack,
  onNext,
  nextDisabled,
}: {
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
}) {
  return (
    <div className="flex justify-between mt-6">
      <button onClick={onBack} className="text-gray-600 flex items-center gap-2">
        <ArrowLeft size={18} /> Voltar
      </button>
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="bg-black text-white px-6 py-2 rounded-xl disabled:opacity-50"
      >
        {nextDisabled ? "Preencha tudo" : "Criar conta"}
      </button>
    </div>
  );
}

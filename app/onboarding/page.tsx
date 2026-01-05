"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, Rocket, Users, Briefcase, CheckCircle, 
  Search, MapPin, Plus, Tag, Handshake, Clock 
} from "lucide-react";

// Total de passos
const stepsTotal = 6;

export default function OnboardingNOVA() {
  const [step, setStep] = useState(1);
  const [checkingAuth, setCheckingAuth] = useState(true);
const [nomeUsuario, setNomeUsuario] = useState("");

  // Dados do onboarding
  const [tipoConta, setTipoConta] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [funcoesInteresse, setFuncoesInteresse] = useState<string[]>([]);
  const [localizacao, setLocalizacao] = useState("");

  const router = useRouter();

  // 🔹 Verifica login e onboarding
  useEffect(() => {
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    // Primeiro pega perfil da tabela
    const { data: profile } = await supabase
      .from("usuarios")
      .select("onboarded, nome")
      .eq("id", user.id)
      .single();

    if (profile?.onboarded) {
      router.replace("/academia");
      return;
    }

    // 🔹 Pega nome do metadata se vier do Google, senão da tabela
    const nomeDoMetadata = user.user_metadata?.full_name || user.user_metadata?.name;
    if (nomeDoMetadata) {
      setNomeUsuario(nomeDoMetadata);
    } else if (profile?.nome) {
      setNomeUsuario(profile.nome);
    }

    setCheckingAuth(false);
  };

  checkUser();
}, [router]);



  function next() { setStep((s) => Math.min(s + 1, stepsTotal)); }
  function back() { setStep((s) => Math.max(s - 1, 1)); }

  const toggleFuncao = (funcao: string) => {
    setFuncoesInteresse((prev) =>
      prev.includes(funcao)
        ? prev.filter((f) => f !== funcao)
        : [...prev, funcao]
    );
  };

  async function finishOnboarding() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 🔹 Nome do usuário do metadata (Google) ou da variável
  const nomeParaSalvar = nomeUsuario || user.user_metadata?.full_name || user.user_metadata?.name;

  // 1️⃣ Atualiza tabela 'usuarios' com nome e onboarded = true
  const { error: userError } = await supabase
    .from("usuarios")
    .upsert({
      id: user.id,
      nome: nomeParaSalvar,
      onboarded: true,
    });

  if (userError) {
    alert("Erro ao atualizar usuário: " + userError.message);
    return;
  }

  // 2️⃣ Salva dados do onboarding
  const { error: onboardingError } = await supabase
    .from("usuarios_onboarding")
    .upsert({
      id: user.id,
      tipo_conta: tipoConta,
      objetivo,
      funcoes_interesse: funcoesInteresse,
      localizacao,
    });

  if (onboardingError) {
    alert("Erro ao salvar onboarding: " + onboardingError.message);
    return;
  }

  router.replace("/academia");
}


  if (checkingAuth) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-6">
        {/* PROGRESSO */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Onboarding</span>
            <span>{step}/{stepsTotal}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full">
            <motion.div
              className="h-2 bg-black rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(step / stepsTotal) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* PASSO 1 - Bem-vindo */}
            {step === 1 && (
              <div className="text-center space-y-4">
             <h1 className="text-2xl font-bold">
      Bem-vindo ao NOVA{nomeUsuario ? `, ${nomeUsuario}` : ""}
    </h1>
                <p className="text-gray-600">Onde conhecimento validado se conecta a oportunidades reais.</p>
                <div className="text-sm text-gray-500">Aprender → Certificar → Publicar → Conectar → Evoluir</div>
                <button onClick={next} className="btn-primary">Começar</button>
              </div>
            )}

            {/* PASSO 2 - Tipo de conta */}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-semibold">Quem é você no NOVA?</h2>
                <Option icon={<GraduationCap />} label="Estudante" active={tipoConta==="Estudante"} onClick={()=>setTipoConta("Estudante")} />
                <Option icon={<Briefcase />} label="Profissional" active={tipoConta==="Profissional"} onClick={()=>setTipoConta("Profissional")} />
                <Option icon={<Rocket />} label="Startup" active={tipoConta==="Startup"} onClick={()=>setTipoConta("Startup")} />
                <Footer onNext={next} onBack={back} nextDisabled={!tipoConta} />
              </div>
            )}

            {/* PASSO 3 - Objetivo */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="font-semibold text-center text-xl mb-6">Olá! Qual é seu principal objetivo?</h2>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700">Desenvolvimento Pessoal/Carreira</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ImageOption icon={<Rocket size={24}/>} label="Iniciar minha carreira" active={objetivo==="iniciar_carreira"} onClick={()=>setObjetivo("iniciar_carreira")} />
                    <ImageOption icon={<Users size={24}/>} label="Mudar minha carreira" active={objetivo==="mudar_carreira"} onClick={()=>setObjetivo("mudar_carreira")} />
                    <ImageOption icon={<Briefcase size={24}/>} label="Crescer em minha função atual" active={objetivo==="crescer_funcao"} onClick={()=>setObjetivo("crescer_funcao")} />
                    <ImageOption icon={<GraduationCap size={24}/>} label="Explorar tópicos fora do trabalho" active={objetivo==="explorar_topicos"} onClick={()=>setObjetivo("explorar_topicos")} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-700">Oportunidades de Trabalho</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <ImageOption icon={<Clock size={24}/>} label="Estágio e Emprego" active={objetivo==="estagio_emprego"} onClick={()=>setObjetivo("estagio_emprego")} />
                    <ImageOption icon={<Tag size={24}/>} label="Projetos Freelancer" active={objetivo==="freelancer"} onClick={()=>setObjetivo("freelancer")} />
                    <ImageOption icon={<Handshake size={24}/>} label="Consultoria" active={objetivo==="consultoria"} onClick={()=>setObjetivo("consultoria")} />
                    <ImageOption icon={<Briefcase size={24}/>} label="Oportunidades de Projeto" active={objetivo==="oportunidades_projeto"} onClick={()=>setObjetivo("oportunidades_projeto")} />
                  </div>
                </div>

                <Footer onNext={next} onBack={back} nextDisabled={!objetivo} />
              </div>
            )}

            {/* PASSO 4 - Funções de interesse */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="font-bold text-center text-xl">Ótimo! Em qual(is) função(ões) você está interessado?</h2>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input className="input pl-10" placeholder="Encontrar uma função" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["Cientista de dados","Gerente de projetos de TI","Consultor de tecnologia","Informática","Marketing Digital","Gerente de produtos","Designer Gráfico","Analista de dados","Desenvolvedor de Data Warehouse"]
                    .map(f => (
                      <MultiSelectCard 
                        key={f} 
                        label={f} 
                        color="blue" 
                        selected={funcoesInteresse.includes(f)} 
                        onClick={()=>toggleFuncao(f)}
                      />
                  ))}
                </div>

                <button className="text-sm text-gray-600 mt-2 flex items-center gap-1"><Plus size={16}/> Ver mais funções</button>
                <Footer onNext={next} onBack={back} nextDisabled={funcoesInteresse.length===0} />
              </div>
            )}

            {/* PASSO 5 - Localização */}
            {step === 5 && (
              <div className="space-y-4">
                <h2 className="font-semibold">Onde você está localizado?</h2>
                <div className="relative mt-4">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input className="input pl-10" placeholder="Ex: Luanda, Angola" value={localizacao} onChange={(e)=>setLocalizacao(e.target.value)} />
                </div>
                <Footer onNext={next} onBack={back} nextDisabled={!localizacao} />
              </div>
            )}

            {/* PASSO 6 - Finalizar */}
            {step === 6 && (
              <div className="text-center space-y-4">
                <CheckCircle className="mx-auto text-green-500" size={48}/>
                <h2 className="text-xl font-bold">Tudo pronto </h2>
                <p className="text-gray-600">Seu perfil está ativo. O NOVA começa agora.</p>
                <button className="btn-primary" onClick={finishOnboarding}>Entrar na plataforma</button>
                <button onClick={back} className="text-gray-600 block w-full mt-4">Voltar e Revisar</button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* COMPONENTES AUXILIARES */
function Option({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 border rounded-xl ${active?"border-black bg-gray-100":"border-gray-200 hover:bg-gray-50"}`}>
      {icon}<span>{label}</span>
    </button>
  );
}

function ImageOption({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 h-32 text-center rounded-xl transition-all ${active?"border-2 border-blue-600 bg-blue-50 shadow-md text-blue-800":"border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"}`}>
      <div className={`p-2 rounded-full mb-2 ${active?"bg-blue-600 text-white":"bg-gray-200 text-gray-700"}`}>{icon}</div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function MultiSelectCard({ label, color, selected, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-start p-3 border rounded-xl h-28 text-left transition-all relative overflow-hidden ${selected?"border-black ring-2 ring-black bg-gray-100":"border-gray-200 hover:bg-gray-50"}`}>
      <div className="p-1 rounded-full text-white mb-2 bg-blue-600"><Briefcase size={18}/></div>
      <span className={`text-xs font-semibold leading-tight ${selected?"text-black":"text-gray-800"}`}>{label}</span>
      <div className={`absolute top-2 right-2 rounded-full w-5 h-5 flex items-center justify-center border ${selected?"bg-black text-white border-white":"bg-white text-gray-500 border-gray-300"}`}>{selected?<CheckCircle size={14}/>:<Plus size={14}/>}</div>
    </button>
  );
}

function Footer({ onBack, onNext, nextDisabled, nextLabel="Próximo" }: any) {
  return (
    <div className="flex justify-between mt-6">
      <button onClick={onBack} className={`text-gray-600 ${onBack?"":"invisible"}`}>Voltar</button>
      <button onClick={onNext} disabled={nextDisabled} className="btn-primary disabled:opacity-50">{nextLabel} →</button>
    </div>
  );
}

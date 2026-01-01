"use client";

import { useState } from "react";
import {
  Briefcase,
  FileText,
  Users,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Tag,
  Calendar,
  Upload,
  Clock,
} from "lucide-react";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { supabase } from "@/lib/supabase";

/* =====================================================
   TIPOS
===================================================== */
type PostType = "artigo" | "freelancer" | "parceria" | "vaga" | "ajuda";

/* =====================================================
   SCHEMA ÚNICO (ZOD)
===================================================== */
const formSchema = z
  .object({
    postType: z.enum(["artigo", "freelancer", "parceria", "vaga", "ajuda"]),
    titulo: z.string().min(3, "Título obrigatório"),
    descricao: z.string().min(5, "Descrição obrigatória"),

    publicarEm: z.enum(["agora", "agendar"]),
    dataAgendada: z.date().optional(),

    arquivos: z.array(z.instanceof(File)).optional(),
    tags: z.array(z.string()).optional(),

    area: z.string().optional(),
    prazo: z.date().optional(),

    experiencia: z.string().optional(),
    local: z.string().optional(),
    salario: z.string().optional(),

    urgencia: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.publicarEm === "agendar" && !data.dataAgendada) {
      ctx.addIssue({
        path: ["dataAgendada"],
        message: "Data obrigatória",
        code: z.ZodIssueCode.custom,
      });
    }

    if (data.postType === "artigo" && (!data.tags || data.tags.length === 0)) {
      ctx.addIssue({
        path: ["tags"],
        message: "Informe ao menos uma tag",
        code: z.ZodIssueCode.custom,
      });
    }

    if (["freelancer", "parceria"].includes(data.postType)) {
      if (!data.area)
        ctx.addIssue({ path: ["area"], message: "Área obrigatória", code: "custom" });
      if (!data.prazo)
        ctx.addIssue({ path: ["prazo"], message: "Prazo obrigatório", code: "custom" });
    }

    if (data.postType === "vaga") {
      if (!data.area)
        ctx.addIssue({ path: ["area"], message: "Área obrigatória", code: "custom" });
      if (!data.experiencia)
        ctx.addIssue({ path: ["experiencia"], message: "Experiência obrigatória", code: "custom" });
      if (!data.local)
        ctx.addIssue({ path: ["local"], message: "Local obrigatório", code: "custom" });
    }

    if (data.postType === "ajuda" && !data.urgencia) {
      ctx.addIssue({
        path: ["urgencia"],
        message: "Informe a urgência",
        code: "custom",
      });
    }
  });

type FormData = z.infer<typeof formSchema>;

/* =====================================================
   COMPONENTE
===================================================== */
export default function CreatePostWizard() {
  const [step, setStep] = useState(1);
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      publicarEm: "agora",
      tags: [],
      arquivos: [],
    },
    mode: "onBlur",
  });

  const postType = watch("postType");
  const publicarEm = watch("publicarEm");
  const tags = watch("tags") ?? [];

  /* =====================================================
     NAVEGAÇÃO
  ===================================================== */
  const next = async (fields?: (keyof FormData)[]) => {
    if (fields) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((s) => s + 1);
  };

  /* =====================================================
     SUBMIT
  ===================================================== */
  const onSubmit = async (data: FormData) => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return alert("Usuário não autenticado");

    const arquivosUrls: string[] = [];

    if (data.arquivos?.length) {
      for (const file of data.arquivos) {
        const path = `${auth.user.id}/${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
          .from("posts")
          .upload(path, file);

        if (!error) {
          const { data } = supabase.storage.from("posts").getPublicUrl(path);
          arquivosUrls.push(data.publicUrl);
        }
      }
    }

    const { error } = await supabase.from("posts").insert({
      usuario_id: auth.user.id,
      tipo: data.postType,
      titulo: data.titulo,
      descricao: data.descricao,
      tags: data.tags ?? [],
      area: data.area ?? null,
      prazo: data.prazo ?? null,
      experiencia: data.experiencia ?? null,
      local: data.local ?? null,
      salario: data.salario ?? null,
      urgencia: data.urgencia ?? null,
      arquivos: arquivosUrls,
      publicar_em: data.publicarEm,
      data_agendada: data.dataAgendada ?? null,
    });

    if (error) {
      console.error(error);
      alert("Erro ao publicar");
    } else {
      alert("Post publicado com sucesso!");
    }
  };

  /* =====================================================
     RENDER
  ===================================================== */
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow space-y-6"
    >
      <input type="hidden" {...register("postType")} />

      {/* PASSO 1 */}
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold">Tipo de Post</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { id: "artigo", label: "Artigo", icon: FileText },
              { id: "freelancer", label: "Freelancer", icon: Briefcase },
              { id: "parceria", label: "Parceria", icon: Users },
              { id: "vaga", label: "Vaga", icon: Briefcase },
              { id: "ajuda", label: "Ajuda", icon: HelpCircle },
            ].map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => {
                  setValue("postType", t.id as PostType);
                  setStep(2);
                }}
                className="border rounded-xl p-4 flex gap-3 items-center hover:border-blue-600"
              >
                <t.icon className="w-5 h-5 text-blue-600" />
                {t.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* PASSO 2 */}
      {step === 2 && (
        <>
          <input {...register("titulo")} placeholder="Título" className="input" />
          <textarea {...register("descricao")} placeholder="Descrição" className="input h-28" />

          <button type="button" onClick={() => next(["titulo", "descricao"])}>Próximo</button>
        </>
      )}

      {/* PASSO FINAL */}
      {step >= 3 && (
        <>
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl">
            <CheckCircle className="inline w-5 h-5 mr-2" />
            Publicar
          </button>
        </>
      )}
    </form>
  );
}

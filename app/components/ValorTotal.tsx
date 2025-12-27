"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, ChevronRight } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function ValorTotal({ moeda = "AOA" }: { moeda?: string }) {
  const [visible, setVisible] = useState(true);
  const [saldoODSZ, setSaldoODSZ] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const taxaODSZ = 374.95;
  const valorAOA = saldoODSZ * taxaODSZ;

  /* =============================
     Buscar saldo + realtime
  ============================== */
  useEffect(() => {
    let channel: any;

    const buscarSaldo = async () => {
      const { data } = await supabase.auth.getUser();
      const user = data?.user;
      if (!user) return;

      const { data: saldo } = await supabase
        .from("saldos")
        .select("saldo_odsz")
        .eq("usuario_id", user.id)
        .single();

      if (saldo?.saldo_odsz !== undefined) {
        setSaldoODSZ(saldo.saldo_odsz);
      }
      setLoading(false);

      // 🔴 Realtime
      channel = supabase
        .channel("realtime-saldos")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "saldos",
            filter: `usuario_id=eq.${user.id}`,
          },
          (payload) => {
            if (payload.new?.saldo_odsz !== undefined) {
              setSaldoODSZ(payload.new.saldo_odsz);
            }
          }
        )
        .subscribe();
    };

    buscarSaldo();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  /* =============================
     UI
  ============================== */
  return (
    <div
      className="
        bg-white rounded-xl
        px-4 py-3
        shadow-sm
        animate-fade-up
      "
    >
      {/* ===== Label ===== */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Total acumulado ({moeda})
        </span>

        <button onClick={() => setVisible(!visible)}>
          {visible ? (
            <Eye size={16} className="text-gray-400" />
          ) : (
            <EyeOff size={16} className="text-gray-400" />
          )}
        </button>
      </div>

      {/* ===== Valor ===== */}
      <button
        className="flex items-center gap-1 mt-1"
      >
        <span className="text-2xl font-semibold text-black">
          {loading
            ? "—"
            : visible
            ? valorAOA.toFixed(2)
            : "•••••"}
        </span>
        <ChevronRight size={16} className="text-gray-400" />
      </button>

      {/* ===== Card ODSZ ===== */}
      <div className="mt-3 flex items-center justify-between bg-gray-100 rounded-xl p-3">
        <div className="flex items-center gap-3">
          <Image
            src="/images/logoCore.png"
            alt="ODSZ"
            width={32}
            height={32}
          />

          <div>
            <p className="text-sm font-semibold text-gray-800">
              ODSZ
            </p>
            <p className="text-sm font-semibold text-black">
              {visible ? saldoODSZ.toFixed(2) : "•••"}
            </p>
            <p className="text-xs text-gray-500">
              {visible
                ? `≈ ${valorAOA.toFixed(2)} AOA`
                : "••••••"}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-[11px] text-gray-500 italic">
            1 ODSZ = {taxaODSZ} AOA
          </p>
        </div>
      </div>
    </div>
  );
}

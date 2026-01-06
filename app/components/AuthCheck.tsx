"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Lottie from "lottie-react";

import SiteContent from "./SiteContent";
import AppContent from "./AppContent";

export default function AuthCheck() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const start = Date.now();

      const { data } = await supabase.auth.getSession();
      const elapsed = Date.now() - start;

      const MIN_TIME = 1000; // 1 segundo mínimo só para mostrar a logo
      const remaining = Math.max(0, MIN_TIME - elapsed);

      setTimeout(() => {
        if (!isMounted) return;
        setUser(data.session?.user ?? null);
        setLoading(false);
      }, remaining);
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-zinc-950 text-white">
        <Lottie
          animationData={require("/public/nova.json")} // 🔹 usar animationData em vez de path
          loop={false} // 🔹 remove o loop
          autoplay
          className="w-76 h-76"
          speed={0.5} // 🔥 desacelera a animação
        />
       
      </div>
    );
  }

  return user ? <AppContent /> : <SiteContent />;
}

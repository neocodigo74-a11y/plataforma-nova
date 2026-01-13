// src/components/MicroLearningViewer.tsx - APENAS PARA TESTE!
"use client";
import React from 'react';
import { ArrowLeft, Zap } from 'lucide-react';

interface Inscricao {
    id: number;
    titulo: string;
    // ... outras props
}

interface MicroLearningViewerProps {
    micro: Inscricao;
    onBack: () => void;
}

const MicroLearningViewer: React.FC<MicroLearningViewerProps> = ({ micro, onBack }) => {
    return (
        <div className="flex flex-col h-screen bg-pink-100 p-10">
            <button onClick={onBack} className="text-sm font-semibold text-gray-600 hover:text-gray-800 transition flex items-center gap-1 mb-8">
                <ArrowLeft size={16} /> Voltar (Teste)
            </button>
            <h1 className="text-3xl font-extrabold text-pink-700">
                <Zap size={30} className="inline mr-2" /> 
                VISUALIZADOR DE MICROAPRENDIZADO ESTÁ ATIVO!
            </h1>
            <p className="mt-4 text-lg text-pink-600">Conteúdo Carregado: {micro.titulo} (ID: {micro.id})</p>
        </div>
    );
};

export default MicroLearningViewer;
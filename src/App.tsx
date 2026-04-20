/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Node, Edge } from 'reactflow';
import { MindMapCanvas } from './components/MindMapCanvas';
import { FileUpload } from './components/FileUpload';
import { processFile } from './lib/file-processor';
import { generateMindMap, MindMapData } from './lib/gemini';
import { BrainCircuit, BookOpen, AlertCircle, Share2, Download, X, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  const handleFileSelect = async (file: File) => {
    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setShowGuide(false);
    try {
      const content = await processFile(file);
      const data = await generateMindMap(content);
      
      // Auto-layout logic
      const layoutedNodes = layoutNodes(data.nodes);
      
      setNodes(layoutedNodes);
      setEdges(data.edges.map(e => ({
        ...e,
        animated: true,
        style: { stroke: '#94a3b8' }
      })));
      setSummary(data.summary);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro inesperado ao processar o arquivo.');
    } finally {
      setLoading(false);
    }
  };

  const layoutNodes = (rawNodes: MindMapData['nodes']): Node[] => {
    // Basic tree layout: Root at top-center, others spread below
    const verticalGap = 150;
    const horizontalGap = 250;

    // Simple level-based distribution
    return rawNodes.map((node, index) => {
      const isRoot = index === 0;
      
      // Basic spiral/tree distribution for visualization
      let x = 0;
      let y = 0;
      
      if (!isRoot) {
        const level = Math.floor((index + 1) / 4) + 1;
        const subIndex = (index - 1) % 4; // 0, 1, 2, 3
        
        switch(subIndex) {
          case 0: x = horizontalGap * level; y = -verticalGap * 0.5 * level; break; // Right-Up
          case 1: x = horizontalGap * level; y = verticalGap * 0.5 * level; break;  // Right-Down
          case 2: x = -horizontalGap * level; y = -verticalGap * 0.5 * level; break; // Left-Up
          case 3: x = -horizontalGap * level; y = verticalGap * 0.5 * level; break;  // Left-Down
        }
      }

      return {
        id: node.id,
        type: 'custom',
        data: { 
          label: node.label, 
          description: node.description,
          isRoot 
        },
        position: { x, y }
      };
    });
  };

  const tutorialSteps = [
    { title: "Upload", desc: "Arraste PDF, Word, Excel ou Imagens para a lateral." },
    { title: "IA em Ação", desc: "Nossa IA analisa e estrutura os dados automaticamente." },
    { title: "Explore", desc: "Navegue pelo mapa e clique nos nós para ver detalhes." },
    { title: "Ação", desc: "Siga o 'Passo a Passo' gerado pela IA no resumo." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between pointer-events-none fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="bg-[#FFD54F] p-2.5 rounded-xl border-2 border-[#2D2D2D] artistic-shadow">
            <BrainCircuit className="w-6 h-6 text-[#2D2D2D]" />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-[#2D2D2D]">Mindmap Studio</h1>
            <p className="text-[10px] text-[#2D2D2D] font-bold uppercase tracking-widest opacity-60">IA Engine // v2.0</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 pointer-events-auto">
          {nodes.length > 0 && (
            <button className="btn-artistic-outline flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar
            </button>
          )}
          <button 
            className="btn-artistic-outline flex items-center gap-2 bg-white"
            onClick={() => { setSelectedNode(null); setShowGuide(!showGuide); }}
          >
            <HelpCircle className="w-4 h-4" /> Guia
          </button>
          <button className="btn-artistic-primary flex items-center gap-2" onClick={() => window.location.reload()}>
            Novo Resumo +
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar for Input & Summary */}
        <aside className="w-72 bg-white/80 backdrop-blur-md border-r-2 border-[#2D2D2D] flex flex-col p-6 space-y-8 overflow-y-auto shrink-0 z-10 m-6 rounded-2xl artistic-shadow artistic-border">
          <section>
            <h2 className="text-xl font-black mb-4 uppercase tracking-tighter text-[#2D2D2D]">Fontes de Dados</h2>
            <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
          </section>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] font-bold text-red-700 uppercase">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {summary && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-lg font-black mb-4 uppercase tracking-tighter text-[#2D2D2D]">Plano de Ação</h2>
              <div className="bg-white/50 rounded-xl p-4 border border-[#2D2D2D]/10 flex-1 overflow-y-auto">
                <div className="prose prose-slate prose-sm text-[#2D2D2D] leading-relaxed whitespace-pre-wrap font-medium text-[13px]">
                  {summary}
                </div>
              </div>
            </motion.section>
          )}

          {!summary && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-20">
              <BookOpen className="w-10 h-10 text-[#2D2D2D]" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Aguardando Plano de Ação</p>
            </div>
          )}
        </aside>

        {/* Mind Map Area */}
        <section className="flex-1 relative">
          <AnimatePresence mode="wait">
            {nodes.length > 0 ? (
              <motion.div
                key="map"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full"
              >
                <MindMapCanvas nodes={nodes} edges={edges} onNodeClick={(node) => { setShowGuide(false); setSelectedNode(node); }} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full h-full flex flex-col items-center justify-center"
              >
                <div className="max-w-md text-center space-y-8">
                  <div className="w-24 h-24 bg-[#FFD54F] rounded-[40px] artistic-shadow artistic-border flex items-center justify-center mx-auto transform -rotate-3">
                    <BrainCircuit className="w-10 h-10 text-[#2D2D2D]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-[#2D2D2D] uppercase tracking-tighter">Engine Pronta</h3>
                    <p className="text-[13px] text-[#2D2D2D]/60 mt-2 font-medium">
                      Conecte arquivos para gerar o mapeamento visual.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Details Sidebar / Guide Sidebar */}
          <AnimatePresence>
            {(selectedNode || showGuide) && (
              <motion.aside
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="absolute top-24 right-6 bottom-24 w-80 bg-white border-2 border-[#2D2D2D] rounded-2xl artistic-shadow p-6 z-20 flex flex-col"
              >
                <button 
                  onClick={() => { setSelectedNode(null); setShowGuide(false); }}
                  className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5 text-[#2D2D2D]" />
                </button>

                {selectedNode ? (
                  <>
                    <div className="mb-6">
                      <div className={`w-12 h-1 w-1 bg-[#2D2D2D] rounded-full mb-4 ${selectedNode.data.isRoot ? 'bg-[#FFD54F]' : 'bg-[#BBDEFB]'}`} />
                      <h3 className="text-xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-none">
                        {selectedNode.data.label}
                      </h3>
                      <p className="text-[10px] font-bold text-[#2D2D2D]/40 uppercase mt-2">Detalhes do Tópico</p>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      {selectedNode.data.description ? (
                        <div className="prose prose-slate prose-sm text-[#2D2D2D] font-medium leading-relaxed">
                          {selectedNode.data.description}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Sem descrição adicional para este tópico.</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="w-12 h-1 w-1 bg-[#FFD54F] rounded-full mb-4" />
                      <h3 className="text-xl font-black uppercase tracking-tighter text-[#2D2D2D] leading-none">
                        Passo a Passo
                      </h3>
                      <p className="text-[10px] font-bold text-[#2D2D2D]/40 uppercase mt-2">Guia de Utilização</p>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                       {tutorialSteps.map((step, idx) => (
                         <div key={idx} className="relative pl-10 border-l border-[#2D2D2D]/10">
                            <div className="absolute left-[-13px] top-0 w-6 h-6 rounded-full bg-[#2D2D2D] text-white flex items-center justify-center text-[10px] font-bold font-mono">
                               0{idx + 1}
                            </div>
                            <h4 className="font-black text-xs uppercase tracking-tighter text-[#2D2D2D]">{step.title}</h4>
                            <p className="text-[11px] font-medium text-[#2D2D2D]/60 mt-1 leading-relaxed">
                               {step.desc}
                            </p>
                         </div>
                       ))}
                       
                       <div className="pt-4">
                          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 italic text-[11px] text-blue-700 font-medium">
                            "A IA não apenas resume, mas cria um plano de ação real baseado nos seus documentos."
                          </div>
                       </div>
                    </div>
                  </>
                )}

                <div className="mt-6 pt-4 border-t border-[#2D2D2D]/10">
                   <p className="text-[9px] font-mono text-[#2D2D2D]/30 uppercase">
                     {selectedNode ? `ID: ${selectedNode.id}` : 'MINDMAP STUDIO v2.0'}
                   </p>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Bottom Right Watermark */}
          <div className="absolute bottom-8 right-8 text-right pointer-events-none select-none z-0">
             <h1 className="text-5xl font-black italic uppercase leading-[0.8] text-[#2D2D2D] opacity-10">MINDMAP<br />STUDIO</h1>
             <p className="text-[10px] opacity-10 font-mono mt-2 font-bold tracking-[0.2em] text-[#2D2D2D]">v2.0 // IA ENGINE ACTIVATED</p>
          </div>
        </section>
      </main>
    </div>
  );
}


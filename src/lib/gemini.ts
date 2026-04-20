import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MindMapData {
  nodes: { id: string; label: string; description?: string }[];
  edges: { id: string; source: string; target: string; label?: string }[];
  summary: string;
}

export async function generateMindMap(content: string | { mimeType: string; data: string }): Promise<MindMapData> {
  const isVisual = typeof content === 'object';
  
  const prompt = `Analise o conteúdo fornecido e crie um mapa mental estruturado e um Plano de Ação EXAUSTIVO (Passo a Passo) em Português.
Remova qualquer resumo genérico. Concentre-se inteiramente no Plano de Ação.
O mapa mental deve destacar os conceitos principais e suas ramificações.
O Plano de Ação deve listar TODOS os passos necessários, sem pular detalhes, ordenados de forma lógica (o que deve ser feito, como e em que ordem).

Retorne APENAS um JSON válido seguindo este esquema:
{
  "nodes": [{"id": "string", "label": "string", "description": "opcional"}],
  "edges": [{"id": "string", "source": "string", "target": "string", "label": "opcional"}],
  "summary": "Título: Plano de Ação Detalhado. Use Markdown para listar os passos com checklist ou números, sem omitir detalhes técnicos ou processuais."
}

O "id" dos nós deve ser único e simples (ex: "root", "node1"). 
Garanta que haja uma raiz central que conecte aos tópicos principais.`;

  const contents = isVisual 
    ? { parts: [{ inlineData: content }, { text: prompt }] }
    : { parts: [{ text: `Conteúdo: ${content}` }, { text: prompt }] };

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ["id", "label"],
            },
          },
          edges: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                source: { type: Type.STRING },
                target: { type: Type.STRING },
                label: { type: Type.STRING },
              },
              required: ["id", "source", "target"],
            },
          },
          summary: { type: Type.STRING },
        },
        required: ["nodes", "edges", "summary"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "{}") as MindMapData;
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    throw new Error("Erro ao processar resposta da IA.");
  }
}

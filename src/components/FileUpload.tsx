import React, { useRef, useState } from 'react';
import { Upload, FileText, Image as ImageIcon, FileSpreadsheet, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<Props> = ({ onFileSelect, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative w-full h-40 border-2 border-dashed rounded-xl transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group",
        isDragging ? "border-[#FFD54F] bg-[#FFD54F]/10" : "border-[#2D2D2D] bg-white",
        isLoading && "pointer-events-none opacity-60"
      )}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept=".pdf,.docx,.doc,.xlsx,.xls,.html,.png,.jpg,.jpeg,.txt"
      />
      
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center space-y-3"
          >
            <div className="p-4 bg-[#FFD54F] border-2 border-dashed border-[#FFD54F] rounded-lg artistic-shadow text-center">
               <p className="text-[10px] font-bold text-[#2D2D2D] uppercase tracking-wider mb-2">Processando...</p>
               <div className="h-1.5 w-32 bg-[#2D2D2D]/10 rounded-full overflow-hidden">
                 <motion.div 
                    className="h-full bg-[#2D2D2D]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                 />
               </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center space-y-3 text-center px-6"
          >
            <div className="bg-[#2D2D2D] p-2.5 rounded-full text-white shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[#2D2D2D] font-black uppercase text-xs tracking-tighter">Arraste Fontes de Dados</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium uppercase opacity-60">PDF, XLS, DOC, IMG, HTML</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

// Use the worker from a reliable CDN that matches the installed version exactly
// Version 5+ uses .mjs for the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export async function processFile(file: File): Promise<string | { mimeType: string; data: string }> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(extension || '')) {
    const base64 = await fileToBase64(file);
    return {
      mimeType: file.type,
      data: base64.split(',')[1],
    };
  }

  if (extension === 'pdf') {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  }

  if (['xlsx', 'xls'].includes(extension || '')) {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer);
    let fullText = '';
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      fullText += `Sheet: ${sheetName}\n` + XLSX.utils.sheet_to_csv(worksheet) + '\n';
    });
    return fullText;
  }

  if (extension === 'docx') {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  
  if (extension === 'html' || extension === 'txt') {
    return await file.text();
  }

  // Fallback to text reading for unknown but possibly text files
  try {
    return await file.text();
  } catch (e) {
    throw new Error("Tipo de arquivo não suportado ou erro ao ler.");
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

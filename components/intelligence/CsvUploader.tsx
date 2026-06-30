'use client';

import { useState, useRef, useTransition, useCallback } from 'react';
import { read, utils } from 'xlsx';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { importShopeeCSV, type ImportResult } from '@/app/actions/importCsv';

// ── Conversão segura de valores SheetJS para string ──────────────────────────
// Inteiros de 64-bit (ex: IDs Shopee "2223994919436") podem perder precisão com
// String() quando JS os representa em notação científica. toFixed(0) preserva todos os dígitos.
function toSafeString(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    return Number.isInteger(v) ? v.toFixed(0) : String(v);
  }
  return String(v);
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface CsvUploaderProps {
  onSuccess: () => void;
  onClose:   () => void;
}

// ── Constantes ────────────────────────────────────────────────────────────────

// Abas do relatório "Diagnóstico de Produtos" da Shopee
const TARGET_SHEETS = [
  'Otimize Seus ADS',
  'Impulsionar com ADS',
  'Acompanhar Performance dos ADS',
  'Produtos com Melhor Desempenho',
] as const;

const ACCEPT = '.xlsx,.xls,.csv';

// ── Mapeamento para preview de colunas (espelho do COLUMN_MAP no server action) ─

const KNOWN_FIELDS: Record<string, string> = {
  'id do item': 'sku',  // coluna principal do Business Insights
  'sku pai': 'sku', 'sku do produto': 'sku', 'sku': 'sku', 'codigo sku': 'sku',
  'nome do produto': 'product_name', 'nome': 'product_name', 'produto': 'product_name',
  'visualizacoes da pagina do produto': 'organic_views', 'visualizacoes': 'organic_views',
  'visitas ao produto': 'organic_views', 'visitantes': 'organic_views',
  'pedidos': 'organic_conversions', 'total de pedidos': 'organic_conversions',
  'vendas': 'revenue', 'pagamento confirmado (brl)': 'revenue', 'faturamento': 'revenue',
  'taxa de conversao': 'conversion_rate', 'taxa de conversao de pedidos': 'conversion_rate',
  'gastos': 'ads_spend', 'gastos com anuncios': 'ads_spend', 'custo de anuncio': 'ads_spend',
  'pedidos via anuncios': 'ads_conversions', 'pedidos de anuncios': 'ads_conversions',
  'roas': 'roas_score',
  'faturamento via anuncios': 'ads_revenue',
};

const FIELD_LABELS: Record<string, string> = {
  sku:                 'SKU',
  product_name:        'Nome',
  organic_views:       'Views Org.',
  organic_conversions: 'Pedidos Org.',
  revenue:             'Receita',
  conversion_rate:     'Conv. %',
  ads_spend:           'Gasto Ads',
  ads_conversions:     'Conv. Ads',
  roas_score:          'ROAS',
  ads_revenue:         'Receita Ads',
};

// Cores por aba de diagnóstico para o preview
const SHEET_COLORS: Record<string, string> = {
  'Otimize Seus ADS':                  'bg-red-100 text-red-700 border-red-200',
  'Impulsionar com ADS':               'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Acompanhar Performance dos ADS':    'bg-blue-100 text-blue-700 border-blue-200',
  'Produtos com Melhor Desempenho':    'bg-purple-100 text-purple-700 border-purple-200',
};

function normalizeHeader(s: string): string {
  return s.toLowerCase().trim().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ');
}

// ── Tipo para resumo de abas lidas ────────────────────────────────────────────

interface SheetSummary { name: string; count: number; }

// ── Componente ────────────────────────────────────────────────────────────────

type State = 'idle' | 'parsing' | 'preview' | 'uploading' | 'done' | 'error';

export function CsvUploader({ onSuccess, onClose }: CsvUploaderProps) {
  const [state,         setState]         = useState<State>('idle');
  const [dragOver,      setDragOver]      = useState(false);
  const [parsedRows,    setParsedRows]    = useState<Record<string, string>[]>([]);
  const [headers,       setHeaders]       = useState<string[]>([]);
  const [sheetsSummary, setSheetsSummary] = useState<SheetSummary[]>([]);
  const [fileName,      setFileName]      = useState('');
  // Índice da loja (1 ou 2) — o server action resolve o shop_id real via env
  const [shopIndex,     setShopIndex]     = useState<1 | 2>(1);
  const [result,        setResult]        = useState<ImportResult | null>(null);
  const [, startT] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Parse com SheetJS — suporta .xlsx/.xls/.csv ──────────────────────────
  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setState('error');
      setResult({ imported: 0, skipped: 0, columns: [], error: 'Formato não suportado. Use .xlsx, .xls ou .csv exportado pela Shopee.' });
      return;
    }

    setState('parsing');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onerror = () => {
      setState('error');
      setResult({ imported: 0, skipped: 0, columns: [], error: 'Não foi possível ler o arquivo.' });
    };

    reader.onload = (evt) => {
      try {
        const ab = evt.target?.result as ArrayBuffer;
        const workbook = read(ab, { type: 'array' });

        const allRows: Record<string, string>[] = [];
        const summary: SheetSummary[] = [];

        // ── Tenta ler abas específicas do relatório de diagnóstico ────────
        for (const sheetName of TARGET_SHEETS) {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) continue;

          const raw = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: true });
          if (!raw.length) continue;

          const rows: Record<string, string>[] = raw.map(row => ({
            ...Object.fromEntries(
              Object.entries(row).map(([k, v]) => [k, toSafeString(v)]),
            ),
            shopee_diagnosis: sheetName,
          }));

          allRows.push(...rows);
          summary.push({ name: sheetName, count: rows.length });
        }

        // ── Fallback: primeira aba se nenhuma aba-alvo encontrada ─────────
        if (!allRows.length) {
          const sheetName = workbook.SheetNames[0];
          if (sheetName) {
            const sheet = workbook.Sheets[sheetName];
            const raw = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: true });
            const rows: Record<string, string>[] = raw.map(row =>
              Object.fromEntries(
                Object.entries(row).map(([k, v]) => [k, toSafeString(v)]),
              ),
            );
            allRows.push(...rows);
            summary.push({ name: sheetName, count: rows.length });
          }
        }

        if (!allRows.length) {
          setState('error');
          setResult({ imported: 0, skipped: 0, columns: [], error: 'Planilha sem dados. Verifique se as abas corretas estão presentes.' });
          return;
        }

        // Headers sem o campo interno shopee_diagnosis
        const visibleHeaders = Object.keys(allRows[0]).filter(h => h !== 'shopee_diagnosis');

        setSheetsSummary(summary);
        setParsedRows(allRows);
        setHeaders(visibleHeaders);
        setState('preview');

      } catch (err) {
        setState('error');
        setResult({
          imported: 0, skipped: 0, columns: [],
          error: `Erro ao processar arquivo: ${err instanceof Error ? err.message : String(err)}`,
        });
      }
    };

    reader.readAsArrayBuffer(file);
  }, []);

  // ── Drag & Drop ───────────────────────────────────────────────────────────
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); setDragOver(true); }
  function handleDragLeave() { setDragOver(false); }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  // ── Envio para Server Action ───────────────────────────────────────────────
  function handleUpload() {
    if (!parsedRows.length) return;
    setState('uploading');
    startT(async () => {
      const res = await importShopeeCSV(parsedRows, shopIndex);
      setResult(res);
      setState(res.error ? 'error' : 'done');
      if (!res.error) onSuccess();
    });
  }

  function reset() {
    setState('idle'); setDragOver(false);
    setParsedRows([]); setHeaders([]); setSheetsSummary([]);
    setFileName(''); setResult(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const selectClass = 'rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-2">
          <UploadCloud className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-semibold text-gray-800">
            Importar Diagnóstico Shopee (Excel / CSV)
          </span>
        </div>
        <button onClick={onClose} className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="p-5 space-y-4">

        {/* Dica sobre abas */}
        {state === 'idle' && (
          <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 border border-blue-200 px-3.5 py-2.5">
            <Layers className="h-3.5 w-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-700 leading-relaxed">
              <span className="font-semibold">Relatório de Diagnóstico de Produtos</span> — lê automaticamente as abas:<br />
              <span className="font-mono">Otimize Seus ADS</span> · <span className="font-mono">Impulsionar com ADS</span> · <span className="font-mono">Acompanhar Performance dos ADS</span> · <span className="font-mono">Produtos com Melhor Desempenho</span>
            </div>
          </div>
        )}

        {/* Dropzone */}
        {(state === 'idle' || state === 'parsing') && (
          <div
            onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 cursor-pointer transition-colors',
              dragOver ? 'border-orange-400 bg-orange-50' : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/40',
            )}
          >
            {state === 'parsing'
              ? <Loader2 className="h-8 w-8 text-orange-400 animate-spin" />
              : <UploadCloud className={cn('h-8 w-8', dragOver ? 'text-orange-500' : 'text-gray-300')} />
            }
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-700">
                {state === 'parsing' ? 'Lendo planilha…' : 'Arraste o arquivo Excel (.xlsx) ou clique para selecionar'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Suporta .xlsx · .xls · .csv</p>
            </div>
            <input ref={inputRef} type="file" accept={ACCEPT} className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
          </div>
        )}

        {/* Preview */}
        {state === 'preview' && (
          <div className="space-y-4">

            {/* Resumo do arquivo */}
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3">
              <FileText className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-800 truncate">{fileName}</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  {parsedRows.length} linha{parsedRows.length !== 1 ? 's' : ''} no total · {headers.length} colunas
                </p>
              </div>
              <button onClick={reset} className="text-blue-400 hover:text-blue-600"><X className="h-3.5 w-3.5" /></button>
            </div>

            {/* Resumo por aba */}
            {sheetsSummary.length > 0 && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                  Abas lidas ({sheetsSummary.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {sheetsSummary.map(s => (
                    <span key={s.name} className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border',
                      SHEET_COLORS[s.name] ?? 'bg-gray-100 text-gray-600 border-gray-200',
                    )}>
                      {s.name}
                      <span className="opacity-60">({s.count} produtos)</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Colunas detectadas e mapeadas */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">
                Colunas da planilha ({headers.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {headers.map(h => {
                  const mapped = KNOWN_FIELDS[normalizeHeader(h)];
                  return (
                    <span key={h} className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border',
                      mapped ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-400',
                    )}>
                      {mapped && <span className="font-bold">✓</span>}
                      <span className="truncate max-w-[160px]" title={h}>{h}</span>
                      {mapped && <span className="opacity-60">→ {FIELD_LABELS[mapped] ?? mapped}</span>}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Amostra de dados */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-2">Prévia (3 primeiras linhas)</p>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="text-[10px] w-full min-w-max">
                  <thead className="bg-gray-50">
                    <tr>
                      {headers.slice(0, 8).map(h => (
                        <th key={h} className="px-2 py-1.5 text-left font-semibold text-gray-500 whitespace-nowrap max-w-[120px] truncate">{h}</th>
                      ))}
                      {headers.length > 8 && <th className="px-2 py-1.5 text-gray-400">+{headers.length - 8}</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.slice(0, 3).map((row, i) => (
                      <tr key={i}>
                        {headers.slice(0, 8).map(h => (
                          <td key={h} className="px-2 py-1.5 text-gray-700 whitespace-nowrap max-w-[120px] truncate" title={row[h]}>
                            {row[h] || '—'}
                          </td>
                        ))}
                        {headers.length > 8 && <td className="px-2 py-1.5 text-gray-300">…</td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Seletor de loja + confirmar */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-gray-600 whitespace-nowrap">Loja:</label>
                <select
                  value={shopIndex}
                  onChange={e => setShopIndex(Number(e.target.value) as 1 | 2)}
                  className={selectClass}
                >
                  <option value={1}>Shopee Renan (Loja 1)</option>
                  <option value={2}>Shopee Amariti (Loja 2)</option>
                </select>
              </div>
              <div className="flex gap-2 ml-auto">
                <button onClick={reset} className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Trocar arquivo
                </button>
                <button onClick={handleUpload} disabled={!parsedRows.length}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors">
                  <UploadCloud className="h-3.5 w-3.5" />
                  Confirmar Importação ({parsedRows.length} linhas)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {state === 'uploading' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
            <p className="text-sm font-semibold text-gray-700">Salvando {parsedRows.length} linhas no Supabase…</p>
            <p className="text-xs text-gray-400">Cruzando SKUs e atualizando diagnósticos</p>
          </div>
        )}

        {/* Sucesso */}
        {state === 'done' && result && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Importação concluída!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  <strong>{result.imported}</strong> produto{result.imported !== 1 ? 's' : ''} salvos/atualizados
                  {result.skipped > 0 && ` · ${result.skipped} ignorado${result.skipped > 1 ? 's' : ''} (sem SKU)`}
                </p>
                {result.sheets && result.sheets.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {result.sheets.map(s => (
                      <span key={s} className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold border',
                        SHEET_COLORS[s] ?? 'bg-gray-100 text-gray-600 border-gray-200',
                      )}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Importar outro arquivo
              </button>
              <button onClick={onClose} className="px-3 py-2 text-xs font-semibold rounded-lg bg-gray-900 text-white hover:bg-gray-700 transition-colors">
                Fechar
              </button>
            </div>
          </div>
        )}

        {/* Erro */}
        {state === 'error' && result?.error && (
          <div className="space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 px-4 py-4">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-800">Erro na importação</p>
                <p className="text-xs text-red-700 mt-0.5">{result.error}</p>
              </div>
            </div>
            <button onClick={reset} className="px-3 py-2 text-xs font-semibold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors">
              Tentar novamente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

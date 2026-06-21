export interface FunnelStep {
  label: string;
  value: number;
  formatted: string;
  sub: string;
  color: string;
}

export function SalesFunnel({ steps }: { steps: FunnelStep[] }) {
  const max = steps[0]?.value ?? 1;

  return (
    <div className="flex flex-col gap-4 py-2">
      {steps.map((step, i) => {
        const widthPct = Math.max((step.value / max) * 100, 18);
        return (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">{step.label}</span>
              <span className="text-sm font-bold text-gray-900">{step.formatted}</span>
            </div>
            <div className="h-9 bg-gray-100 rounded-lg overflow-hidden">
              <div
                className={`h-full ${step.color} rounded-lg flex items-center px-3 transition-all duration-700`}
                style={{ width: `${widthPct}%` }}
              >
                <span className="text-xs font-semibold text-white/90 truncate">{step.sub}</span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="mt-2 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div>
          <span className="font-medium text-gray-700">CTR</span>
          <p className="text-base font-bold text-gray-900 mt-0.5">
            {steps[0] && steps[1]
              ? ((steps[1].value / steps[0].value) * 100).toFixed(2) + '%'
              : '—'}
          </p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Conv. Rate</span>
          <p className="text-base font-bold text-gray-900 mt-0.5">
            {steps[1] && steps[2]
              ? ((steps[2].value / steps[1].value) * 100).toFixed(2) + '%'
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

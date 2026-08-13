import { useEffect, useState } from "react";
import api from "../lib/axios";

const DEFAULT_SIZE_CHART = [
  { size: "M", chest: "39-41", waist: "33-35", length: "28-29" },
  { size: "L", chest: "42-44", waist: "36-38", length: "29-30" },
  { size: "XL", chest: "45-47", waist: "39-41", length: "30-31" },
  { size: "XXL", chest: "48-50", waist: "42-44", length: "31-32" },
];

function SizeGuideModal({ onClose }) {
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/site-content")
      .then((res) => {
        try {
          setChart(JSON.parse(res.data.size_chart));
        } catch {
          setChart(DEFAULT_SIZE_CHART);
        }
      })
      .catch(() => setChart(DEFAULT_SIZE_CHART))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-ink/40 z-50 flex items-center justify-center p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-offwhite border border-ink/10 rounded-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-ink">Size Guide</h2>
          <button
            onClick={onClose}
            className="text-ink/50 hover:text-ink transition-colors cursor-pointer text-xl leading-none"
          >
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-ink/50">Loading...</p>
        ) : !chart || chart.length === 0 ? (
          <p className="text-sm text-ink/50">Size guide is not available right now.</p>
        ) : (
          <>
            <p className="text-xs text-ink/50 mb-4">
              All measurements are in inches.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-[0.15em] text-ink/50 border-b border-ink/10">
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Chest</th>
                    <th className="py-2 pr-4">Waist</th>
                    <th className="py-2 pr-4">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {chart.map((row) => (
                    <tr key={row.size} className="border-b border-ink/10">
                      <td className="py-2 pr-4 text-ink font-medium">{row.size}</td>
                      <td className="py-2 pr-4 text-ink/70">{row.chest}</td>
                      <td className="py-2 pr-4 text-ink/70">{row.waist}</td>
                      <td className="py-2 pr-4 text-ink/70">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SizeGuideModal;
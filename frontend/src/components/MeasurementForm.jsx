import { useState } from "react";

const MEASUREMENTS_STORAGE_KEY = "onfleek_saved_measurements";

const SHIRT_FIELDS = [
  ["shirtLength", "Length"],
  ["shirtBack", "Back"],
  ["shirtSleeve", "Sleeve"],
  ["shirtBody", "Body"],
  ["shirtChest", "Chest"],
  ["shirtNeck", "Neck"],
  ["shirtArmpits", "Armpits"],
];

const TROUSER_FIELDS = [
  ["trouserLength", "Length"],
  ["trouserWaist", "Waist"],
  ["trouserHips", "Hips"],
  ["trouserLaps", "Laps"],
];

const ALL_FIELDS = [...SHIRT_FIELDS, ...TROUSER_FIELDS];

export function loadSavedMeasurements() {
  try {
    const saved = localStorage.getItem(MEASUREMENTS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function emptyMeasurements() {
  return ALL_FIELDS.reduce((acc, [key]) => ({ ...acc, [key]: "" }), {});
}

function MeasurementForm({ initialValues, onSubmit, onCancel, submitLabel = "Save Measurements" }) {
  const [values, setValues] = useState(
    () => initialValues || loadSavedMeasurements() || emptyMeasurements(),
  );
  const [saveForNextTime, setSaveForNextTime] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  function updateField(key, value) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function isValid() {
    return ALL_FIELDS.every(([key]) => String(values[key]).trim());
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid()) {
      setShowErrors(true);
      return;
    }
    if (saveForNextTime) {
      try {
        localStorage.setItem(MEASUREMENTS_STORAGE_KEY, JSON.stringify(values));
      } catch {
        // localStorage unavailable — ignore, form still works
      }
    }
    onSubmit(values);
  }

  function renderField(key, label) {
    const isEmpty = showErrors && !String(values[key]).trim();
    return (
      <div key={key}>
        <label className="block text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
          {label} <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={values[key]}
          onChange={(e) => updateField(key, e.target.value)}
          className={`w-full border px-4 py-2 text-sm ${
            isEmpty ? "border-red-600" : "border-ink/20"
          }`}
          required
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section>
        <h3 className="font-serif text-lg text-ink mb-4">Shirt</h3>
        <div className="grid grid-cols-2 gap-4">
          {SHIRT_FIELDS.map(([key, label]) => renderField(key, label))}
        </div>
      </section>

      <section>
        <h3 className="font-serif text-lg text-ink mb-4">Trouser</h3>
        <div className="grid grid-cols-2 gap-4">
          {TROUSER_FIELDS.map(([key, label]) => renderField(key, label))}
        </div>
      </section>

      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input
          type="checkbox"
          checked={saveForNextTime}
          onChange={(e) => setSaveForNextTime(e.target.checked)}
        />
        Save these measurements for next time
      </label>

      {showErrors && !isValid() && (
        <p className="text-sm text-red-600">
          Please fill in all measurements — they're needed to make the cloth.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="flex-1 bg-ink text-offwhite text-sm uppercase tracking-[0.2em] py-4 hover:bg-charcoal transition-colors cursor-pointer"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 text-sm uppercase tracking-[0.2em] text-ink/60 hover:text-ink border border-ink/20"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default MeasurementForm;
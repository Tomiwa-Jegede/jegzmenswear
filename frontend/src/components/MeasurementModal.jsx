import MeasurementForm from "./MeasurementForm";

function MeasurementModal({ open, onClose, onSubmit, initialValues, submitLabel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close"
        className="absolute inset-0 bg-ink/40 cursor-pointer"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-offwhite shadow-2xl">
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10 sticky top-0 bg-offwhite">
          <p className="text-xs uppercase tracking-[0.25em] text-ink/60">
            Measurements
          </p>
          <button
            onClick={onClose}
            className="text-ink/60 hover:text-ink text-sm cursor-pointer"
          >
            Close
          </button>
        </div>
        <div className="px-6 py-6">
          <MeasurementForm
            initialValues={initialValues}
            onSubmit={onSubmit}
            onCancel={onClose}
            submitLabel={submitLabel}
          />
        </div>
      </div>
    </div>
  );
}

export default MeasurementModal;
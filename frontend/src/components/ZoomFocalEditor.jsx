import { useState, useCallback, useMemo } from "react";
import Cropper from "react-easy-crop";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;

function parseAspect(aspect) {
  const [w, h] = aspect.split("/").map((n) => parseFloat(n.trim()));
  return w && h ? w / h : 1;
}

/**
 * Interactive focal-point + zoom editor (react-easy-crop backed).
 *
 * Public data contract is unchanged from the previous implementation:
 * emits { focalX, focalY, zoom } via onChange, where focalX/focalY are
 * 0-100 (center of the visible crop box, in % of the source image) and
 * zoom is 1-3. Every live page rendering this image must keep using:
 *
 *   objectFit: "cover"
 *   objectPosition: `${focalX}% ${focalY}%`
 *   transform: `scale(${zoom})`
 *   transformOrigin: `${focalX}% ${focalY}%`
 *
 * Props:
 *   src            - image URL (or local object URL for a freshly chosen file)
 *   aspect         - CSS aspect-ratio string for the frame, e.g. "1 / 1" or "9 / 16"
 *   label          - small caption shown above the frame
 *   focalX, focalY - current focal point, 0-100 (unused as crop input; kept for interface parity)
 *   zoom           - current zoom, 1-3
 *   onChange       - ({ focalX, focalY, zoom }) => void
 */
function ZoomFocalEditor({
  src,
  aspect = "1 / 1",
  label,
  focalX,
  focalY,
  zoom,
  onChange,
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const aspectRatio = useMemo(() => parseAspect(aspect), [aspect]);

  const handleCropComplete = useCallback(
    (croppedAreaPercent) => {
      onChange({
        focalX: croppedAreaPercent.x + croppedAreaPercent.width / 2,
        focalY: croppedAreaPercent.y + croppedAreaPercent.height / 2,
        zoom,
      });
    },
    [onChange, zoom],
  );

  const handleZoomChange = useCallback(
    (nextZoom) => {
      onChange({ focalX, focalY, zoom: nextZoom });
    },
    [focalX, focalY, onChange],
  );

  return (
    <div>
      {label && (
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
          {label}
        </p>
      )}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 280,
          aspectRatio: aspect,
          background: "#11111522",
          border: "1px solid rgba(17,17,17,0.15)",
        }}
      >
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatio}
          minZoom={ZOOM_MIN}
          maxZoom={ZOOM_MAX}
          onCropChange={setCrop}
          onZoomChange={handleZoomChange}
          onCropComplete={handleCropComplete}
        />
      </div>
      <p className="text-[10px] text-ink/40 mt-1">
        Drag to reposition · scroll or pinch to zoom ({zoom.toFixed(2)}x)
      </p>
    </div>
  );
}

export default ZoomFocalEditor;
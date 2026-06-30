import { useRef, useCallback } from "react";

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const WHEEL_SENSITIVITY = 0.0015;

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Interactive focal-point + zoom editor.
 *
 * Rendering formula (must be mirrored exactly on every live page that
 * displays this image, so what you see here matches the live site):
 *
 *   objectFit: "cover"
 *   objectPosition: `${focalX}% ${focalY}%`
 *   transform: `scale(${zoom})`
 *   transformOrigin: `${focalX}% ${focalY}%`
 *
 * Anchoring the scale's transform-origin at the same point as the
 * object-position means zooming always magnifies *into* the chosen
 * focal point, regardless of the container's aspect ratio — so the
 * same three numbers (focalX, focalY, zoom) look right whether they're
 * rendered in a square admin preview, a full-bleed hero, or a small
 * cart thumbnail.
 *
 * Props:
 *   src          - image URL (or local object URL for a freshly chosen file)
 *   aspect       - CSS aspect-ratio string for the preview frame, e.g. "1 / 1" or "9 / 16"
 *   label        - small caption shown above the frame
 *   focalX, focalY - current focal point, 0–100
 *   zoom         - current zoom, 1–3
 *   onChange     - ({ focalX, focalY, zoom }) => void
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
  const containerRef = useRef(null);
  const imgNaturalRef = useRef({ w: 0, h: 0 });
  const dragRef = useRef(null); // { lastX, lastY } while dragging
  const pinchRef = useRef(null); // { startDist, startZoom } while pinching

  const handleImgLoad = useCallback((e) => {
    imgNaturalRef.current = {
      w: e.currentTarget.naturalWidth || 1,
      h: e.currentTarget.naturalHeight || 1,
    };
  }, []);

  // Convert a pixel pan delta into a focalX/focalY delta, accounting for
  // how much "overflow" the zoomed cover-fit image currently has beyond
  // the container in each axis. See component doc comment for the formula.
  const panByPixels = useCallback(
    (dx, dy) => {
      const container = containerRef.current;
      if (!container) return;
      const { width: cw, height: ch } = container.getBoundingClientRect();
      const { w: iw, h: ih } = imgNaturalRef.current;
      if (!iw || !ih || !cw || !ch) return;

      const coverScale = Math.max(cw / iw, ch / ih);
      const renderedW = iw * coverScale * zoom;
      const renderedH = ih * coverScale * zoom;
      const overflowX = Math.max(renderedW - cw, 0);
      const overflowY = Math.max(renderedH - ch, 0);

      const nextX = overflowX > 0 ? focalX - (100 * dx) / overflowX : focalX;
      const nextY = overflowY > 0 ? focalY - (100 * dy) / overflowY : focalY;

      onChange({
        focalX: clamp(nextX, 0, 100),
        focalY: clamp(nextY, 0, 100),
        zoom,
      });
    },
    [focalX, focalY, zoom, onChange],
  );

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const nextZoom = clamp(
        zoom - e.deltaY * WHEEL_SENSITIVITY,
        ZOOM_MIN,
        ZOOM_MAX,
      );
      onChange({ focalX, focalY, zoom: nextZoom });
    },
    [focalX, focalY, zoom, onChange],
  );

  const handleMouseDown = useCallback((e) => {
    dragRef.current = { lastX: e.clientX, lastY: e.clientY };
  }, []);

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current = { lastX: e.clientX, lastY: e.clientY };
      panByPixels(dx, dy);
    },
    [panByPixels],
  );

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  const touchDist = (touches) => {
    const [a, b] = touches;
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
  };

  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 2) {
        pinchRef.current = { startDist: touchDist(e.touches), startZoom: zoom };
        dragRef.current = null;
      } else if (e.touches.length === 1) {
        dragRef.current = {
          lastX: e.touches[0].clientX,
          lastY: e.touches[0].clientY,
        };
        pinchRef.current = null;
      }
    },
    [zoom],
  );

  const handleTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      if (e.touches.length === 2 && pinchRef.current) {
        const dist = touchDist(e.touches);
        const ratio = dist / pinchRef.current.startDist;
        const nextZoom = clamp(
          pinchRef.current.startZoom * ratio,
          ZOOM_MIN,
          ZOOM_MAX,
        );
        onChange({ focalX, focalY, zoom: nextZoom });
      } else if (e.touches.length === 1 && dragRef.current) {
        const dx = e.touches[0].clientX - dragRef.current.lastX;
        const dy = e.touches[0].clientY - dragRef.current.lastY;
        dragRef.current = {
          lastX: e.touches[0].clientX,
          lastY: e.touches[0].clientY,
        };
        panByPixels(dx, dy);
      }
    },
    [focalX, focalY, onChange, panByPixels],
  );

  const handleTouchEnd = useCallback(() => {
    dragRef.current = null;
    pinchRef.current = null;
  }, []);

  return (
    <div>
      {label && (
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60 mb-2">
          {label}
        </p>
      )}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          width: "100%",
          maxWidth: 280,
          aspectRatio: aspect,
          position: "relative",
          overflow: "hidden",
          cursor: dragRef.current ? "grabbing" : "grab",
          touchAction: "none",
          background: "#11111522",
          border: "1px solid rgba(17,17,17,0.15)",
        }}
      >
        <img
          src={src}
          alt=""
          draggable={false}
          onLoad={handleImgLoad}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: `${focalX}% ${focalY}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${focalX}% ${focalY}%`,
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
        {/* Focal point marker */}
        <div
          style={{
            position: "absolute",
            left: `${focalX}%`,
            top: `${focalY}%`,
            width: 14,
            height: 14,
            marginLeft: -7,
            marginTop: -7,
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 0 0 1px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.5)",
            pointerEvents: "none",
          }}
        />
      </div>
      <p className="text-[10px] text-ink/40 mt-1">
        Drag to reposition · scroll or pinch to zoom ({zoom.toFixed(2)}x)
      </p>
    </div>
  );
}

export default ZoomFocalEditor;

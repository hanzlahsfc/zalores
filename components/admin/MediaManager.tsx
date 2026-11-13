"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/admin-api";

/**
 * Shopify-style media card: drop or browse to upload (many at once), drag to
 * reorder, first image is the main image. Changes are local until the page
 * saves; uploads go straight to Supabase Storage.
 */
export default function MediaManager({
  media,
  onChange,
  onError,
  single,
}: {
  media: string[];
  onChange: (next: string[]) => void;
  onError?: (msg: string) => void;
  single?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [dropOver, setDropOver] = useState(false);

  async function addFiles(files: FileList | File[]) {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    if (list.some((f) => f.size > 10 * 1024 * 1024)) {
      onError?.("Images must be under 10 MB");
      return;
    }
    const take = single ? list.slice(0, 1) : list;
    setUploading((n) => n + take.length);
    const urls: string[] = [];
    for (const f of take) {
      try {
        urls.push(await uploadImage(f));
      } catch (e) {
        onError?.(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (urls.length) onChange(single ? urls.slice(0, 1) : [...media, ...urls]);
  }

  function move(from: number, to: number) {
    if (from === to) return;
    const next = [...media];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  function addUrl() {
    const url = prompt("Image URL (https://…)");
    if (!url) return;
    if (!/^(https?:\/\/|\/)/.test(url.trim())) {
      onError?.("Enter a full image URL");
      return;
    }
    onChange(single ? [url.trim()] : [...media, url.trim()]);
  }

  const picker = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      multiple={!single}
      hidden
      onChange={(e) => {
        if (e.target.files) addFiles(e.target.files);
        e.target.value = "";
      }}
    />
  );

  const dropHandlers = {
    onDragOver: (e: React.DragEvent) => {
      if (e.dataTransfer.types.includes("Files")) {
        e.preventDefault();
        setDropOver(true);
      }
    },
    onDragLeave: () => setDropOver(false),
    onDrop: (e: React.DragEvent) => {
      if (!e.dataTransfer.files.length) return;
      e.preventDefault();
      setDropOver(false);
      addFiles(e.dataTransfer.files);
    },
  };

  if (!media.length && !uploading) {
    return (
      <>
        {picker}
        <div className={`adm-media__empty${dropOver ? " over" : ""}`} onClick={() => input.current?.click()} {...dropHandlers}>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 6 }}>
            <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm">
              Upload new
            </button>
            <button
              type="button"
              className="adm-btn adm-btn--plain"
              onClick={(e) => {
                e.stopPropagation();
                addUrl();
              }}
            >
              Add from URL
            </button>
          </div>
          <span className="adm-help">Accepts images, drag and drop {single ? "one file" : "multiple files"}</span>
        </div>
      </>
    );
  }

  return (
    <>
      {picker}
      <div className={`adm-media${single ? "" : " adm-media--hero"}`} {...dropHandlers}>
        {media.map((url, i) => (
          <div
            key={url + i}
            className={`adm-media__item${dragIdx === i ? " dragging" : ""}${overIdx === i ? " over" : ""}`}
            draggable={!single}
            onDragStart={() => setDragIdx(i)}
            onDragEnter={() => dragIdx !== null && setOverIdx(i)}
            onDragOver={(e) => dragIdx !== null && e.preventDefault()}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            onDrop={(e) => {
              if (dragIdx === null) return;
              e.preventDefault();
              e.stopPropagation();
              move(dragIdx, i);
              setDragIdx(null);
              setOverIdx(null);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" />
            {i === 0 && !single && <span className="adm-media__primary">Main</span>}
            <div className="adm-media__tools">
              {i > 0 && !single && (
                <button type="button" title="Make main image" onClick={() => move(i, 0)}>
                  ★
                </button>
              )}
              <a href={url} target="_blank" rel="noreferrer">
                <button type="button" title="Open">
                  ↗
                </button>
              </a>
              <button type="button" title="Remove" onClick={() => onChange(media.filter((_, j) => j !== i))}>
                ✕
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up${i}`} className="adm-drop">
            Uploading…
          </div>
        ))}
        {(!single || (!media.length && !uploading)) && (
          <div className={`adm-drop${dropOver ? " over" : ""}`} onClick={() => input.current?.click()}>
            <div>
              <strong>Add</strong>
              <span className="adm-help">or drop files</span>
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 12 }}>
        {single && (
          <button type="button" className="adm-btn adm-btn--plain" onClick={() => input.current?.click()}>
            Replace image
          </button>
        )}
        <button type="button" className="adm-btn adm-btn--plain" onClick={addUrl}>
          Add from URL
        </button>
        {!single && media.length > 1 && <span className="adm-help">Drag to reorder. The first image is the main image.</span>}
      </div>
    </>
  );
}

import { ImageResponse } from "next/og";
import { brandMarkDataUri, BRAND_TAGLINE, MARK_VIOLET } from "@/lib/brand";

export const alt = "dertdaş — Dertlerini paylaş, yalnız olmadığını hisset.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          color: "#e9e9f4",
          backgroundImage:
            "linear-gradient(135deg, #1a1740 0%, #0c0d17 52%, #10233f 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandMarkDataUri({ strokeWidth: 2.2 })} width={148} height={148} alt="" />

        <div style={{ display: "flex", fontSize: 92, letterSpacing: -3 }}>
          <span>dert</span>
          <span style={{ color: MARK_VIOLET }}>daş</span>
        </div>

        <div style={{ display: "flex", fontSize: 34, color: "#9a9bb4" }}>
          {BRAND_TAGLINE}
        </div>
      </div>
    ),
    size,
  );
}

import { ImageResponse } from "next/og";
import { brandMarkDataUri, MARK_NAVY } from "@/lib/brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: MARK_NAVY,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={brandMarkDataUri({ strokeWidth: 2.4 })} width={124} height={124} alt="" />
      </div>
    ),
    size,
  );
}

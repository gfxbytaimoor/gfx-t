import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { site } from "@/lib/site";

export const alt = `${site.name} — We Create. We Strategize. We Elevate.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card: the light logo on ink, the three-beat headline, one signal-yellow anchor. */
export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "public/brand/gfxt-logo-paper.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#0b0b0b", color: "#f3f0e8" }}>
        {/* ImageResponse renders plain <img> only; next/image does not work here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={330} height={85} alt="" />
        <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 700, lineHeight: 0.95, letterSpacing: -2 }}>
          <span style={{ color: "#6b6b6b" }}>WE CREATE.</span>
          <span style={{ color: "#6b6b6b" }}>WE STRATEGIZE.</span>
          <span>WE ELEVATE.</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, letterSpacing: 4, color: "#b4b1aa" }}>
          <div style={{ width: 14, height: 14, background: "#ffbf01" }} />
          CREATIVE AGENCY — LAHORE, PAKISTAN — EST. {site.founded}
        </div>
      </div>
    ),
    size,
  );
}

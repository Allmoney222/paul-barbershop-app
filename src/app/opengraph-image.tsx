import { ImageResponse } from "next/og";
import { OgMarkup } from "@/lib/og-markup";

export const runtime = "edge";

export const alt = "2Gether Hair Studio | Buffalo, NY";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(OgMarkup(), { ...size });
}

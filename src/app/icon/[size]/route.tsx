import { ImageResponse } from "next/og";

const SIZES = [192, 512];

export function generateStaticParams() {
  return SIZES.map((s) => ({ size: String(s) }));
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const px = Number((await params).size);
  if (!SIZES.includes(px)) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563eb",
          color: "white",
          fontSize: px * 0.6,
          fontWeight: 800,
        }}
      >
        K
      </div>
    ),
    { width: px, height: px },
  );
}

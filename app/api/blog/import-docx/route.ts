import { NextResponse } from "next/server";
import mammoth from "mammoth";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await mammoth.convertToHtml({
      buffer,
    });

    return NextResponse.json({
      html: result.value,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to parse docx" },
      { status: 500 },
    );
  }
}

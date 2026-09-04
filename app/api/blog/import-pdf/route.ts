import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const parser = new PDFParse({ data: buffer });

    const result = await parser.getText();

    return NextResponse.json({
      text: result.text,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 });
  }
}

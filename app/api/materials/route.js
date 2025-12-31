import dbConnect from "@/lib/db";
import Material from "@/models/Material";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();
  try {
    const materials = await Material.find({});
    return NextResponse.json({ success: true, data: materials });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const body = await request.json();
    const material = await Material.create(body);
    return NextResponse.json(
      { success: true, data: material },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

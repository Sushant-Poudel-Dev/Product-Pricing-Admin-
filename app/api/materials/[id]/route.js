import dbConnect from "@/lib/db";
import Material from "@/models/Material";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const body = await request.json();
    const material = await Material.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    if (!material) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: material });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  await dbConnect();
  const { id } = await params;
  try {
    const material = await Material.findByIdAndDelete(id);
    if (!material) {
      return NextResponse.json(
        { success: false, error: "Material not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

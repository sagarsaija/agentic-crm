import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Test database connection by querying leads
    const { data, error } = await supabase
      .from("leads")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          hint: "Make sure you have run the schema.sql file in Supabase",
        },
        { status: 500 },
      );
    }

    // Test auth connection
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      message: "Database connection successful!",
      tables_accessible: true,
      auth_working: true,
      user_authenticated: !!user,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// app/api/fundamentals/route.js
import yahooFinance from "yahoo-finance2";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  const period1Param = searchParams.get("period1");
  const period2Param = searchParams.get("period2");
  const period1 = period1Param !== null ? period1Param : "";
  const period2 = period2Param !== null ? period2Param : undefined;
  const type = searchParams.get("type") || "quarterly";
  const module = searchParams.get("module") || "all";

  if (!symbol) {
    return new Response(
      JSON.stringify({
        error: "Missing required query parameter: symbol",
      }),
      { status: 400 }
    );
  }

  try {
    const data = await yahooFinance.fundamentalsTimeSeries(symbol, {
      period1: period1 as string | number | Date,
      ...(period2 ? { period2: period2 as string | number | Date } : {}),
      type,
      module,
    });
    return Response.json(data);
  } catch (error) {
    console.error("Error fetching fundamentals data:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch fundamentals data",
        details: (error as Error).message,
      }),
      { status: 500 }
    );
  }
}

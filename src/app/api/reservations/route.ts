import { NextResponse } from "next/server";
import { validateReservation, type ReservationInput } from "@/lib/reservation";

export async function POST(request: Request) {
  let body: Partial<ReservationInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const errors = validateReservation(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // TODO: send the request to the booking system or the restaurant's inbox.
  // Until that is connected, requests are only logged on the server.
  const reference = `GK-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  console.info("Reservation request", reference, body);

  return NextResponse.json({ reference });
}

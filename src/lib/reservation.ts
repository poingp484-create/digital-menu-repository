// Shared by the form and the API route so both validate the same way.

export type Seating = "counter" | "room";

export const seatingOptions: Record<
  Seating,
  { label: string; detail: string; times: string[]; maxGuests: number }
> = {
  counter: {
    label: "Counter omakase",
    detail: "$185 per guest",
    times: ["6:00 pm", "8:30 pm"],
    maxGuests: 4,
  },
  room: {
    label: "Dining room",
    detail: "À la carte",
    times: ["5:30 pm", "6:00 pm", "6:30 pm", "7:00 pm", "7:30 pm", "8:00 pm", "8:30 pm", "9:00 pm", "9:30 pm", "10:00 pm"],
    maxGuests: 8,
  },
};

export type ReservationInput = {
  seating: Seating;
  date: string;
  time: string;
  guests: number;
  name: string;
  email: string;
  phone: string;
  notes: string;
};

export type FieldErrors = Partial<Record<keyof ReservationInput, string>>;

export function validateReservation(input: Partial<ReservationInput>, today = new Date()): FieldErrors {
  const errors: FieldErrors = {};
  const seating = input.seating && seatingOptions[input.seating];

  if (!seating) errors.seating = "Choose the counter or the dining room.";

  if (!input.date) {
    errors.date = "Pick a date.";
  } else {
    const day = new Date(`${input.date}T12:00:00`);
    const start = new Date(today);
    start.setHours(0, 0, 0, 0);
    if (Number.isNaN(day.getTime())) errors.date = "Pick a valid date.";
    else if (day < start) errors.date = "That date has passed.";
    else if ([0, 1].includes(day.getDay())) errors.date = "We are closed on Sundays and Mondays.";
  }

  if (!input.time) errors.time = "Pick a time.";
  else if (seating && !seating.times.includes(input.time)) errors.time = "Pick one of the listed times.";

  const guests = Number(input.guests);
  if (!guests) errors.guests = "How many guests?";
  else if (seating && guests > seating.maxGuests)
    errors.guests = `The ${input.seating === "counter" ? "counter" : "dining room"} seats up to ${seating.maxGuests}.`;

  if (!input.name?.trim()) errors.name = "Enter the name for the booking.";
  if (!input.email?.trim()) errors.email = "Enter an email so we can confirm.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.email = "That email looks incomplete.";
  if (input.phone && !/^[+()\d\s.-]{7,}$/.test(input.phone)) errors.phone = "Use digits, spaces and + only.";
  if ((input.notes ?? "").length > 500) errors.notes = "Keep notes under 500 characters.";

  return errors;
}

// Restaurant details used across the site. Replace the sample address,
// phone, email and hours with the real ones before launch.

export const site = {
  name: "Gokudo",
  description:
    "Omakase at a twelve-seat hinoki counter and robata from the charcoal grill.",
  address: {
    line1: "41 Ash Lane",
    line2: "New York, NY 10013",
    mapsUrl: "https://maps.google.com/?q=41+Ash+Lane+New+York",
  },
  phone: { display: "+1 (212) 555-0148", href: "tel:+12125550148" },
  email: "table@gokudo.example",
  instagram: "https://instagram.com/",
  hours: [
    { days: "Tuesday to Thursday", time: "5:30 pm to 11:00 pm" },
    { days: "Friday and Saturday", time: "5:30 pm to 12:00 am" },
    { days: "Sunday and Monday", time: "Closed" },
  ],
  seatings: ["6:00 pm", "8:30 pm"],
  omakasePrice: 185,
  // Sample chef name, replace with the real one.
  chef: { name: "Ren Okabe", role: "Head chef" },
  privateDining: { guests: 8, from: 150 },
} as const;

export const nav = [
  { href: "/menu", label: "Menu" },
  { href: "/#omakase", label: "Omakase" },
  { href: "/story", label: "Story" },
  { href: "/#visit", label: "Visit" },
] as const;

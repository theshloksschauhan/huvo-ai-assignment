/**
 * simulateBooking — Deterministic mock for site-visit booking.
 *
 * Uses a blackout-day rule ("monday") so failed bookings are reproducible
 * in test cases and demo recordings, rather than random.
 */

const BLACKOUT_DAYS = ["monday"];

export function simulateBooking(date, time) {
  const normalised = (date || "").trim().toLowerCase();

  // Check if the date string contains a blackout day
  const isBlackedOut = BLACKOUT_DAYS.some(day => normalised.includes(day));

  if (isBlackedOut) {
    return {
      status: "failed",
      reason: "slot_unavailable",
      date,
      time
    };
  }

  return {
    status: "confirmed",
    date,
    time
  };
}

import type { BookingSettings, ShopInfo } from "@/types/database";

export const SHOP_TIMEZONE = "America/New_York";

export const DEFAULT_SHOP_INFO: ShopInfo = {
  name: "2Gether Hair Studio",
  tagline: "Where beauty, style, and community come together.",
  address: "1590 Hertel Ave, Buffalo, NY 14216",
  phone: "716-364-6871",
  email: "twogetherhairstudio@yahoo.com",
  timezone: SHOP_TIMEZONE,
  hours: {
    mon: "9:00 AM - 7:00 PM",
    tue: "9:00 AM - 7:00 PM",
    wed: "9:00 AM - 7:00 PM",
    thu: "9:00 AM - 7:00 PM",
    fri: "9:00 AM - 7:00 PM",
    sat: "9:00 AM - 7:00 PM",
    sun: "Closed",
  },
};

export const DEFAULT_BOOKING_SETTINGS: BookingSettings = {
  deposit_enabled: true,
  deposit_amount_cents: 1500,
  buffer_minutes: 0,
  slot_increment_minutes: 15,
};

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DAY_LABELS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const APPOINTMENT_STATUSES = [
  "booked",
  "confirmed",
  "completed",
  "no-show",
  "cancelled",
] as const;

export const SERVICE_CATEGORIES = [
  "Hair",
  "Beard",
  "Color",
  "Nails",
  "Braids",
  "Kids",
  "Other",
];

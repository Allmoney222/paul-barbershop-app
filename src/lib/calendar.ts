function toIcsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function googleCalendarUrl(params: {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
}): string {
  const search = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${toIcsDate(params.start)}/${toIcsDate(params.end)}`,
    details: params.description,
    location: params.location,
  });
  return `https://calendar.google.com/calendar/render?${search.toString()}`;
}

export function generateIcsDataUri(params: {
  title: string;
  description: string;
  location: string;
  start: Date;
  end: Date;
  uid: string;
}): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//2Gether Hair Studio//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(params.start)}`,
    `DTEND:${toIcsDate(params.end)}`,
    `SUMMARY:${escapeIcs(params.title)}`,
    `DESCRIPTION:${escapeIcs(params.description)}`,
    `LOCATION:${escapeIcs(params.location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines)}`;
}

function escapeIcs(value: string): string {
  return value.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
}

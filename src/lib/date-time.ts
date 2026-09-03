import { z } from "zod";

const iso8601DateTimeSchema = z.iso.datetime({ offset: true });

const tokyoDateTimeFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const tokyoDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function isIso8601DateTime(value: unknown): value is string {
  return iso8601DateTimeSchema.safeParse(value).success;
}

export function parseIso8601DateTime(value: unknown): string {
  return iso8601DateTimeSchema.parse(value);
}

export function formatTokyoDateTime(value: string): string {
  return tokyoDateTimeFormatter.format(new Date(parseIso8601DateTime(value)));
}

export function formatTokyoDate(value: string): string {
  return tokyoDateFormatter.format(new Date(parseIso8601DateTime(value)));
}

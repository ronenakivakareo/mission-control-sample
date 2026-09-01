/**
 * Formats a byte count into a human-readable string.
 *
 * Team convention: divide by 1024 and label units KiB/MiB/GiB/...
 * Values under 1024 bytes are labelled "B".
 */

const UNITS = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];

export function formatBytes(bytes) {
  if (bytes === 0) return "0 B";

  const exponent = Math.min(
    Math.floor(Math.log(Math.abs(bytes)) / Math.log(1024)),
    UNITS.length - 1
  );
  const value = bytes / Math.pow(1024, exponent);
  const rounded = Math.round(value * 10) / 10;

  return `${rounded} ${UNITS[exponent]}`;
}

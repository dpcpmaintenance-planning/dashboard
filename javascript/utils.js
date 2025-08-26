function normalize(str) {
  return str?.toLowerCase().replace(/\s+/g, " ").trim();
}

function convertGoogleDriveLink(link) {
  const match = link.match(/\/d\/([^/]+)\//);
  return match ? `https://drive.google.com/thumbnail?id=${match[1]}` : link;
}

function formatImageLink(url) {
  if (!url) return "";
  const safeURL = convertGoogleDriveLink(url);
  return `<a class="image-popup-link" href="${safeURL}">View</a>`;
}

function formatDate(value) {
  if (!value) return "";

  // Handle GViz date objects like "Date(2024,9,3,14,28,6)"
  if (typeof value === "string" && value.startsWith("Date(")) {
    const match = value.match(/Date\((\d+),(\d+),(\d+),?(\d*)?,?(\d*)?,?(\d*)?\)/);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10); // GViz months are 0-based
      const day = parseInt(match[3], 10);
      const hour = parseInt(match[4] || "0", 10);
      const minute = parseInt(match[5] || "0", 10);
      const second = parseInt(match[6] || "0", 10);
      const date = new Date(year, month, day, hour, minute, second);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
    }
  }

  // Handle standard date strings
  const date = new Date(value);
  return isNaN(date)
    ? value
    : date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
}


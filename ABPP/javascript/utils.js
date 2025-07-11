function normalize(str) {
  return str?.toLowerCase().replace(/\s+/g, " ").trim();
}

// ✅ Converts Google Drive link to open in a new tab
function convertGoogleDriveLink(link) {
  if (!link) return "";

  // Match /d/<ID>/ style
  const match = link.match(/\/d\/([^/]+)\//);
  if (match) {
    return `https://drive.google.com/file/d/${match[1]}/view`;
  }

  // Match ?id=<ID> style
  const altMatch = link.match(/id=([^&]+)/);
  if (altMatch) {
    return `https://drive.google.com/file/d/${altMatch[1]}/view`;
  }

  return link; // fallback
}

// ✅ Formats the image cell as a new-tab "View" link
function formatImageLink(url) {
  if (!url) return "";
  const match = url.match(/\/d\/([^/]+)\//);
  const directURL = match
    ? `https://drive.google.com/uc?export=view&id=${match[1]}`
    : url;
  return `<a href="${directURL}" target="_blank" rel="noopener noreferrer">View</a>`;
}


// ✅ Formats dates nicely or returns raw value if invalid
function formatDate(value) {
  const date = new Date(value);
  return isNaN(date)
    ? value
    : date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
}

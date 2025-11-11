document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("chatbot-toggle");
  const chatbot = document.getElementById("chatbot-container");
  const closeBtn = document.getElementById("chatbot-close");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-user-input");
  const messages = document.getElementById("chatbot-messages");

  // Toggle chatbot visibility
  toggleBtn?.addEventListener("click", () => chatbot.classList.toggle("hidden"));
  closeBtn?.addEventListener("click", () => chatbot.classList.add("hidden"));

  // Add message to chat body
  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("chatbot-message", sender);
    msg.innerHTML = text.replace(/\n/g, "<br>"); // Support line breaks
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  // Handle sending message
  sendBtn?.addEventListener("click", handleSend);
  input?.addEventListener("keypress", e => {
    if (e.key === "Enter") handleSend();
  });

  function handleSend() {
    const text = input.value.trim();
    if (!text) return;
    addMessage(`<strong>You:</strong> ${text}`, "user");
    input.value = "";
    processMessage(text);
  }

  // Main chatbot logic
  function processMessage(query) {
    if (!window.equipmentData || equipmentData.length === 0) {
      addMessage("⚠️ Equipment data not loaded yet. Please wait.", "bot");
      return;
    }

    const lower = query.toLowerCase();
    let response =
      "🤔 I'm not sure what you mean. Try asking about a system, equipment, or say 'status summary'.";

    if (lower.includes("status summary") || lower.includes("summary")) {
      const summary = summarizeStatus();
      response = `
        📊 <strong>Current Equipment Summary:</strong><br>
        ✅ Operational: ${summary.operational}<br>
        ♻️ Sustainable: ${summary.sustainable}<br>
        ❌ Breakdown: ${summary.breakdown}
      `;
    } else if (lower.includes("breakdown")) {
      const broken = equipmentData.filter(e => e["Current Status"] === "2");
      if (broken.length > 0) {
        response = `⚠️ <strong>Breakdown Equipment (${broken.length}):</strong><br>${broken
          .map(e => "• " + e["Equipment"])
          .join("<br>")}`;
      } else {
        response = "✅ No equipment is currently in breakdown status.";
      }
    } else {
      // Match by equipment or system name
      const matched = equipmentData.find(
        e =>
          e["Equipment"]?.toLowerCase().includes(lower) ||
          e["System"]?.toLowerCase().includes(lower)
      );

      if (matched) {
        response = `
          🔧 <strong>${matched["Equipment"] || matched["System"]}</strong><br>
          Status: ${parseStatus(matched["Current Status"])}<br>
          🧩 Problem: ${matched["Problem"] || "None"}<br>
          💡 Recommendation: ${matched["Recommendation"] || "None"}
        `;
      }
    }

    // Simulate AI thinking delay
    addMessage("💭 Thinking...", "bot");
    setTimeout(() => {
      // Replace "Thinking..." message with response
      messages.lastChild.remove();
      addMessage(response, "bot");
    }, 700);
  }

  // Helper: Convert numeric code to readable status
  function parseStatus(code) {
    switch (code) {
      case "0":
        return "Operational ✅";
      case "1":
        return "Sustainable ♻️";
      case "2":
        return "Breakdown ❌";
      default:
        return "Unknown";
    }
  }

  // Helper: Summarize status counts
  function summarizeStatus() {
    const summary = { operational: 0, sustainable: 0, breakdown: 0 };
    equipmentData.forEach(item => {
      switch (item["Current Status"]) {
        case "0":
          summary.operational++;
          break;
        case "1":
          summary.sustainable++;
          break;
        case "2":
          summary.breakdown++;
          break;
      }
    });
    return summary;
  }
});

/* ======================================================
   README RENDER SCRIPT
   Fetches real README.md and renders it
====================================================== */

document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("readme-content");

  try {
    const response = await fetch("README.md");
    if (!response.ok) throw new Error("README.md not found");

    const markdown = await response.text();
    container.innerHTML = markdownToHTML(markdown);

  } catch (err) {
    container.innerHTML = `
      <h2>Error</h2>
      <p>Unable to load README.md</p>
      <code>${err.message}</code>
    `;
  }
});

/* ======================================================
   MARKDOWN → HTML PARSER (LIGHTWEIGHT)
====================================================== */
function markdownToHTML(md) {

  // Escape HTML first (basic safety)
  md = md.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Code blocks ```
  md = md.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre><code>${code.trim()}</code></pre>`;
  });

  // Headings
  md = md.replace(/^### (.*$)/gim, "<h3>$1</h3>");
  md = md.replace(/^## (.*$)/gim, "<h2>$1</h2>");
  md = md.replace(/^# (.*$)/gim, "<h1>$1</h1>");

  // Horizontal rule ---
  md = md.replace(/^---$/gim, "<hr>");

  // Bold **text**
  md = md.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");

  // Inline code `code`
  md = md.replace(/`([^`]+)`/gim, "<code>$1</code>");

  // Links [text](url)
  md = md.replace(
    /\[([^\]]+)\]\(([^)]+)\)/gim,
    `<a href="$2" target="_blank">$1</a>`
  );

  // Lists (- or *)
  md = md.replace(/^\s*[-*] (.*)/gim, "<li>$1</li>");
  md = md.replace(/(<li>.*<\/li>)/gims, "<ul>$1</ul>");

  // Paragraphs
  md = md.replace(/\n{2,}/g, "</p><p>");
  md = `<p>${md}</p>`;

  // Clean malformed tags
  md = md.replace(/<p><\/p>/g, "");
  md = md.replace(/<p>(<h[1-3]>)/g, "$1");
  md = md.replace(/(<\/h[1-3]>)<\/p>/g, "$1");
  md = md.replace(/<p>(<ul>)/g, "$1");
  md = md.replace(/(<\/ul>)<\/p>/g, "$1");
  md = md.replace(/<p>(<pre>)/g, "$1");
  md = md.replace(/(<\/pre>)<\/p>/g, "$1");

  return md;
}
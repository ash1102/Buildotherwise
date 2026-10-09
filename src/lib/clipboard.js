/**
 * Copies text for the person. The clipboard is withheld when the page is not
 * focused, so the older route stands in when the modern one is refused.
 */
export async function writeToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const holder = document.createElement("textarea");
    holder.value = text;
    holder.setAttribute("readonly", "");
    holder.className = "fixed left-0 top-0 h-0 w-0 opacity-0";
    document.body.appendChild(holder);
    holder.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(holder);
    return copied;
  }
}
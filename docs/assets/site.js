document.querySelectorAll("[data-copy]").forEach((button) => {
  if (!window.isSecureContext || !navigator.clipboard) return;
  button.hidden = false;
  button.addEventListener("click", async () => {
    const command = document.getElementById(button.dataset.copy);
    const status = button.closest(".command").nextElementSibling;
    try {
      await navigator.clipboard.writeText(command.textContent.trim());
      status.textContent = "Command copied.";
    } catch {
      status.textContent =
        "Copy unavailable. Select the command and copy it manually.";
    }
  });
});

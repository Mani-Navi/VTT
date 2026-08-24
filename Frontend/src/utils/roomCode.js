export function generateRoomCode() {
  const words = ["OWL", "DND", "MAP", "DICE", "DRG", "MAGE", "RUNE", "HELM"];
  const randomWord = words[Math.floor(Math.random() * words.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${randomWord}-${randomNum}`;
}

export function formatRoomCode(code) {
  if (!code) return "";
  return code.trim().toUpperCase();
}

export function validateRoomCode(code) {
  const clean = formatRoomCode(code);
  return clean.length >= 4 && clean.length <= 16;
}
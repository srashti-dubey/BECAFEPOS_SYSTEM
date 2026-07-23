export async function copyToClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
  }
}

export async function readFromClipboard() {
  if (navigator.clipboard?.readText) {
    return navigator.clipboard.readText()
  }

  return null
}

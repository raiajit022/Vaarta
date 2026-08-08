import { toast } from 'sonner';

/**
 * Copy text and confirm with a toast.
 *
 * Replaces the `alert("Copied!")` calls, which blocked the page and looked
 * like a browser error rather than a confirmation.
 */
export async function copyToClipboard(text: string, message = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(message);
  } catch {
    toast.error('Could not copy — your browser blocked clipboard access');
  }
}

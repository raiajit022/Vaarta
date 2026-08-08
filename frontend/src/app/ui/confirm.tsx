import { create } from 'zustand';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Use for irreversible actions — ending a meeting, deleting a record. */
  destructive?: boolean;
}

interface ConfirmState {
  options: ConfirmOptions | null;
  resolve: ((ok: boolean) => void) | null;
  open: (options: ConfirmOptions, resolve: (ok: boolean) => void) => void;
  close: () => void;
}

const useConfirmStore = create<ConfirmState>((set) => ({
  options: null,
  resolve: null,
  open: (options, resolve) => set({ options, resolve }),
  close: () => set({ options: null, resolve: null }),
}));

/**
 * Promise-based replacement for `window.confirm`.
 *
 * Keeps call sites as terse as the native API — `if (await confirm({...}))` —
 * while rendering a themed, accessible dialog.
 */
export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().open(options, resolve);
  });
}

/** Mount once near the app root. */
export function ConfirmHost() {
  const { options, resolve, close } = useConfirmStore();

  if (!options) return null;

  const settle = (ok: boolean) => {
    resolve?.(ok);
    close();
  };

  return (
    <Modal open onClose={() => settle(false)} title={options.title} size="sm">
      <p className="t-body text-ink-2">{options.description}</p>
      <div className="flex items-center justify-end gap-2.5 mt-6">
        <Button variant="ghost" onClick={() => settle(false)}>
          {options.cancelLabel ?? 'Cancel'}
        </Button>
        <Button
          variant={options.destructive ? 'danger' : 'primary'}
          onClick={() => settle(true)}
          autoFocus
        >
          {options.confirmLabel ?? 'Confirm'}
        </Button>
      </div>
    </Modal>
  );
}

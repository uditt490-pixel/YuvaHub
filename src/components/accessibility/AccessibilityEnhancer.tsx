import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getLabel(button: HTMLButtonElement): string | null {
  const title = button.getAttribute('title');
  if (title) return title;

  const text = button.textContent?.trim();
  if (text) return null;

  const svg = button.querySelector('svg');
  const iconName = svg?.getAttribute('data-lucide');
  if (iconName) {
    return iconName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return 'Action';
}

/**
 * Progressive accessibility safety net for legacy UI.
 *
 * New components should still use semantic HTML and explicit ARIA attributes.
 * This enhancer protects existing dialogs and icon buttons while the codebase is
 * incrementally improved.
 */
export default function AccessibilityEnhancer() {
  useEffect(() => {
    let lastFocusedElement: HTMLElement | null = null;
    let activeDialog: HTMLElement | null = null;

    const improveElement = (root: ParentNode) => {
      root.querySelectorAll<HTMLButtonElement>('button').forEach(button => {
        if (!button.hasAttribute('type')) button.type = 'button';

        if (!button.hasAttribute('aria-label') && !button.hasAttribute('aria-labelledby')) {
          const label = getLabel(button);
          if (label) button.setAttribute('aria-label', label);
        }
      });

      root.querySelectorAll<SVGElement>('svg').forEach(svg => {
        if (!svg.closest('[role="img"]') && !svg.hasAttribute('aria-label')) {
          svg.setAttribute('aria-hidden', 'true');
          svg.setAttribute('focusable', 'false');
        }
      });

      root.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]').forEach(dialog => {
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');

        if (!dialog.hasAttribute('aria-label') && !dialog.hasAttribute('aria-labelledby')) {
          const heading = dialog.querySelector<HTMLElement>('h1, h2, h3');
          if (heading) {
            if (!heading.id) heading.id = `dialog-title-${crypto.randomUUID()}`;
            dialog.setAttribute('aria-labelledby', heading.id);
          } else {
            dialog.setAttribute('aria-label', 'Dialog');
          }
        }
      });
    };

    const activateDialog = (dialog: HTMLElement) => {
      if (activeDialog === dialog) return;
      lastFocusedElement = document.activeElement as HTMLElement | null;
      activeDialog = dialog;

      const focusTarget = dialog.querySelector<HTMLElement>('[autofocus], ' + FOCUSABLE);
      window.requestAnimationFrame(() => (focusTarget ?? dialog).focus());
    };

    const findVisibleDialog = () =>
      Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"], [aria-modal="true"]'))
        .find(dialog => dialog.offsetParent !== null) ?? null;

    const syncDialog = () => {
      const visibleDialog = findVisibleDialog();
      if (visibleDialog) {
        if (!visibleDialog.hasAttribute('tabindex')) visibleDialog.tabIndex = -1;
        activateDialog(visibleDialog);
      } else if (activeDialog) {
        activeDialog = null;
        lastFocusedElement?.focus();
        lastFocusedElement = null;
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        const dialog = findVisibleDialog();
        if (dialog) {
          const closeButton = dialog.querySelector<HTMLButtonElement>(
            '[data-dialog-close], [aria-label*="close" i], button[title*="close" i]'
          );
          closeButton?.click();
          return;
        }

        const expandedMenu = document.querySelector<HTMLButtonElement>('[aria-expanded="true"]');
        expandedMenu?.click();
        return;
      }

      if (event.key !== 'Tab') return;
      const dialog = findVisibleDialog();
      if (!dialog) return;

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(element => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    improveElement(document);
    syncDialog();

    const observer = new MutationObserver(records => {
      records.forEach(record => {
        record.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            improveElement(node);
          }
        });
      });
      syncDialog();
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div
      id="yuva-accessibility-announcer"
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    />
  );
}

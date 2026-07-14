import { useState, useCallback } from "react";

/**
 * Generic row selection hook.
 * Not used by UserManagement today but exported for future bulk-action pages.
 */
export function useRowSelection(allIds: string[] = []) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(allIds));
  }, [allIds]);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  return { selectedIds, toggle, selectAll, clear, isSelected };
}

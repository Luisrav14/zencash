import { Plus, X } from "lucide-react";

export function AddToggleButton({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Cerrar formulario" : label}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
    >
      {open ? <X size={16} /> : <Plus size={16} />}
    </button>
  );
}

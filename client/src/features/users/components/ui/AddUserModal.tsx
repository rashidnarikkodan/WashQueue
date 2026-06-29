import { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { ROLE } from "../../../../shared/constants/role.const";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newUser: { name: string; email: string; role: keyof typeof ROLE }) => boolean;
  errorMsg: string;
  setErrorMsg: (msg: string) => void;
}

const AddUserModal = ({
  isOpen,
  onClose,
  onSubmit,
  errorMsg,
  setErrorMsg
}: AddUserModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<keyof typeof ROLE>("CUSTOMER");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onSubmit({ name, email, role });
    if (success) {
      setName("");
      setEmail("");
      setRole("CUSTOMER");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
      <div 
        className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold">Add New User</h3>
            <p className="text-muted-foreground text-xs mt-0.5">Create a new system user profile.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              required
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. john.doe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as keyof typeof ROLE)}
              className="w-full bg-muted/40 border border-border/80 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
            >
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="PROVIDER">Provider</option>
              <option value="CUSTOMER">Customer</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-muted hover:bg-muted/80 text-foreground font-semibold py-2.5 rounded-xl transition-all border border-border/50 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary hover:opacity-90 text-primary-foreground font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-primary/10 text-sm"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;

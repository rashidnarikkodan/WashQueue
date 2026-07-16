type Props = {
  password: string;
};

export default function PasswordStrength({ password }: Props) {
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&#]/.test(password),
  };

  if (!password.length) return null;

  return (
    <div className="text-[11px] space-y-1.5 p-3.5 bg-background/30 rounded-2xl border border-border/40 animate-in fade-in slide-in-from-top-1 duration-200">
      <p className="font-bold text-muted-foreground mb-1">
        Password Requirements
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Rule ok={rules.length}>At least 8 characters</Rule>
        <Rule ok={rules.uppercase}>One uppercase letter</Rule>
        <Rule ok={rules.lowercase}>One lowercase letter</Rule>
        <Rule ok={rules.number}>One number</Rule>
        <Rule ok={rules.special}>One special character</Rule>
      </div>
    </div>
  );
}

function Rule({
  ok,
  children,
}: {
  ok: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`w-1.5 h-1.5 rounded-full transition-colors ${
          ok ? "bg-emerald-400" : "bg-slate-600"
        }`}
      />

      <span
        className={`transition-colors ${
          ok
            ? "text-emerald-400 font-semibold"
            : "text-muted-foreground"
        }`}
      >
        {children}
      </span>
    </div>
  );
}
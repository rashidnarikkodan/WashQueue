interface EmptyStateProps {
  colSpan: number;
  message?: string;
  errorMsg?: string | null;
}

const EmptyState = ({
  colSpan,
  message = "No results found.",
  errorMsg,
}: EmptyStateProps) => (
  <tr>
    <td colSpan={colSpan} className="py-12 px-6 text-center text-muted-foreground font-medium">
      {errorMsg ? (
        <span className="text-rose-400 font-semibold">{errorMsg}</span>
      ) : (
        message
      )}
    </td>
  </tr>
);

export default EmptyState;

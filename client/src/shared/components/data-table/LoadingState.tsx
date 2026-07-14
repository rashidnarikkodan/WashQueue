import Loading from "@/shared/components/ui/Loading";

interface LoadingStateProps {
  text?: string;
  className?: string;
}

const LoadingState = ({
  text = "Loading...",
  className = "py-20 gap-3",
}: LoadingStateProps) => <Loading size="lg" text={text} className={className} />;

export default LoadingState;

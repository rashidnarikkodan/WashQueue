const Loading = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      <p>Loading...</p>
    </div>
  )
};

export default Loading;

export default function PrimaryButton({
  loading,
  onClick,
  children,
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="
      w-full
      mt-10
      py-5
      rounded-2xl
      text-xl
      font-bold
      text-white
      bg-gradient-to-r
      from-blue-600
      via-indigo-600
      to-purple-600
      shadow-xl
      hover:scale-[1.02]
      hover:shadow-2xl
      transition-all
      duration-300
      disabled:opacity-50
      "
    >
      {loading ? "Submitting..." : children}
    </button>
  );
}
export default function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}) {
  return (
    <div
      className={`bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mt-10 transition-all duration-300 hover:shadow-2xl ${className}`}
    >
      {title && (
        <>
          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>

          {subtitle && (
            <p className="text-gray-500 mt-2">
              {subtitle}
            </p>
          )}
        </>
      )}

      <div className={title ? "mt-8" : ""}>
        {children}
      </div>
    </div>
  );
}
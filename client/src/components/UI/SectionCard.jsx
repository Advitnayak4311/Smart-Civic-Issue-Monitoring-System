export default function SectionCard({
  title,
  subtitle,
  children,
}) {
  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 mt-10 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {title}
        </h2>

        {subtitle && (
          <p className="text-gray-500 mt-2">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
import React from "react";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function CategoryCard({
  icon,
  title,
  description,
  onCategoryClick,
}) {
  return (
    <div
      onClick={() => onCategoryClick(title)}
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md hover:border-blue-500 cursor-pointer transition-all duration-200 group flex flex-col justify-between"
    >
      <div>
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center font-bold text-xl mb-4 group-hover:scale-110 transition-transform">
          {icon}
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-blue-900 transition">
          {title}
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-800">
        <span>Select Category</span>
        <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
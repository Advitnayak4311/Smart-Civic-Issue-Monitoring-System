import React from "react";
import { FaArrowRight } from "react-icons/fa";

export default function CategoryCard({
  icon,
  title,
  description,
  gradient,
  onCategoryClick,
}) {
  return (
    <div
      onClick={() => onCategoryClick(title)}
      className={`group relative overflow-hidden rounded-3xl ${gradient}
      cursor-pointer p-8 shadow-lg transition-all duration-500
      hover:-translate-y-3 hover:shadow-2xl`}
    >
      {/* Glow Effect */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/20 blur-2xl group-hover:scale-125 transition duration-500"></div>

      {/* Icon */}
      <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-md text-5xl mx-auto group-hover:rotate-6 transition">
        {icon}
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-white text-center mt-6">
        {title}
      </h2>

      {/* Description */}
      <p className="text-white/90 text-center mt-3 leading-relaxed text-sm">
        {description}
      </p>

      {/* Bottom Button */}
      <div className="flex items-center justify-center gap-2 mt-8 text-white font-semibold">
        Report Now
        <FaArrowRight className="group-hover:translate-x-2 transition" />
      </div>
    </div>
  );
}
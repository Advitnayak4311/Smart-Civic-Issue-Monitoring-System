import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaRoad,
  FaTint,
  FaLightbulb,
  FaTrash,
  FaTree,
  FaArrowLeft,
} from "react-icons/fa";

import CategoryCard from "../components/CategoryCard";
import IssueModal from "../components/IssueModal";
import ComplaintForm from "../components/ComplaintForm";

const categories = [
  {
    title: "Road Issues",
    description: "Potholes, road cracks and damaged roads",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-700",
    icon: <FaRoad className="text-blue-600" />,
  },
  {
    title: "Water & Pipeline",
    description: "Water leakage and pipe burst complaints",
    gradient: "bg-gradient-to-br from-cyan-400 to-blue-500",
    icon: <FaTint className="text-cyan-500" />,
  },
  {
    title: "Street Light",
    description: "Street lights and electrical faults",
    gradient: "bg-gradient-to-br from-yellow-400 to-orange-500",
    icon: <FaLightbulb className="text-yellow-500" />,
  },
  {
    title: "Garbage",
    description: "Waste collection and garbage overflow",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-600",
    icon: <FaTrash className="text-green-600" />,
  },
  {
    title: "Other Issues",
    description: "Trees, drains and miscellaneous issues",
    gradient: "bg-gradient-to-br from-orange-500 to-red-500",
    icon: <FaTree className="text-orange-500" />,
  },
];

export default function RegisterComplaint() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [services, setServices] = useState([]);

  useEffect(() => {
  fetch("http://localhost:8000/api/service-config")
    .then((res) => res.json())
    .then((data) => {
      console.log("API Response:", data);
      console.log("Services from API:", data.services);

      if (data.success) {
        setServices(data.services);
      }
    })
    .catch(console.error);
}, []);

useEffect(() => {
  console.log("Services State:", services);
}, [services]);

  const handleCategoryClick = (title) => {
  console.log("Clicked:", title);
  console.log("Current services:", services);

  const category = categories.find((c) => c.title === title);

  const dynamicIssues = services
    .filter((service) => service.category === title)
    .map((service) => service.subcategory);

  console.log("Dynamic Issues:", dynamicIssues);

  setSelectedCategory({
    ...category,
    issues: dynamicIssues,
  });

  setModalOpen(true);
};

   

  const handleContinue = (issue) => {
    setSelectedIssue(issue);
    setModalOpen(false);
  };

  const handleReset = () => {
    setSelectedCategory(null);
    setSelectedIssue("");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/bakcground----.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 max-w-6xl mx-auto py-10 px-6">
        <Link to="/" className="text-white hover:underline">
          ← Back to Home
        </Link>

        <div className="bg-white rounded-3xl shadow-2xl mt-6 p-10">
          <h1 className="text-4xl font-bold text-center text-blue-700">
            Register Complaint
          </h1>

          {!selectedIssue && (
            <>
              <p className="text-center text-gray-500 mt-3">
                Choose a category to report your issue.
              </p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.title}
                    title={category.title}
                    icon={category.icon}
                    description={category.description}
                    gradient={category.gradient}
                    onCategoryClick={handleCategoryClick}
                  />
                ))}
              </div>
            </>
          )}

          {selectedIssue && (
            <>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-blue-600 font-semibold mb-6 hover:text-blue-800"
              >
                <FaArrowLeft />
                Change Category
              </button>

              <ComplaintForm
                category={selectedCategory.title}
                issue={selectedIssue}
              />
            </>
          )}
        </div>
      </div>

      <IssueModal
        open={modalOpen}
        category={selectedCategory?.title}
        issues={selectedCategory?.issues || []}
        onClose={() => setModalOpen(false)}
        onContinue={handleContinue}
      />
    </div>
  );
}
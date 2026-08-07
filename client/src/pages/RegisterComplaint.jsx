import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FilePlus2,
  ArrowLeft,
  Building2,
  ShieldCheck,
  AlertCircle,
  HelpCircle
} from "lucide-react";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import CategoryCard from "../components/CategoryCard";
import IssueModal from "../components/IssueModal";
import ComplaintForm from "../components/ComplaintForm";

const categories = [
  {
    title: "Roads & Infrastructure",
    description: "Potholes, road cracks, damaged asphalt, missing manhole covers, footpath repair.",
    icon: "🛣️",
    defaultIssues: [
      "Pothole / Road Damage",
      "Broken Footpath / Divider",
      "Damaged Asphalt / Cracks",
      "Missing / Open Manhole Cover",
      "Hazardous Speed Breaker",
      "Other Roads & Infrastructure Issue"
    ]
  },
  {
    title: "Water & Pipeline",
    description: "Water pipe bursts, low supply pressure, contaminated water, sewer leaks.",
    icon: "🚰",
    defaultIssues: [
      "Water Pipe Burst / Leakage",
      "Low Water Pressure",
      "Contaminated Water Supply",
      "No Water Supply in Area",
      "Sewer Line Overflow",
      "Other Water & Pipeline Issue"
    ]
  },
  {
    title: "Street Light & Electrical",
    description: "Non-functional streetlights, electrical pole damage, hanging wires, dark spots.",
    icon: "💡",
    defaultIssues: [
      "Streetlight Non-Functional / Outage",
      "Damaged Electric Pole",
      "Hanging / Loose Electric Wires",
      "Transformer Sparking / Leakage",
      "Dark Alley Safety Hazard",
      "Other Street Light & Electrical Issue"
    ]
  },
  {
    title: "Sanitation & Garbage",
    description: "Overflowing dustbins, uncollected waste, street sweeping, illegal dumping.",
    icon: "🧹",
    defaultIssues: [
      "Overflowing Dustbin / Dump",
      "Uncollected Street Garbage",
      "Irregular Door-to-Door Collection",
      "Public Area Street Sweeping",
      "Dead Animal Disposal",
      "Other Sanitation & Garbage Issue"
    ]
  },
  {
    title: "Drainage & Sewerage",
    description: "Clogged storm drains, waterlogging on streets, open sewage drain hazards.",
    icon: "🌊",
    defaultIssues: [
      "Clogged Stormwater Drain",
      "Rainwater Drainage Overflow",
      "Open Sewage Drain Hazard",
      "Culvert Blockage",
      "Other Drainage & Sewerage Issue"
    ]
  },
  {
    title: "Parks & Environment",
    description: "Fallen trees, park maintenance, overgrown grass, broken playground equipment.",
    icon: "🌳",
    defaultIssues: [
      "Fallen Tree / Heavy Branch Removal",
      "Park Equipment & Playground Repair",
      "Overgrown Grass & Weed Trimming",
      "Park Fence / Lighting Damage",
      "Other Parks & Environment Issue"
    ]
  },
  {
    title: "Stray Animals & Pest Control",
    description: "Stray dog hazards, cattle on road, mosquito fogging requests, pest infestations.",
    icon: "🐕",
    defaultIssues: [
      "Stray Dog Aggression Hazard",
      "Cattle Nuisance on Main Road",
      "Mosquito Fogging Request",
      "Pest & Rodent Infestation",
      "Other Stray Animals & Pest Control Issue"
    ]
  },
  {
    title: "Public Property & Amenities",
    description: "Damaged bus shelters, public toilet hygiene, vandalism, footpath encroachment.",
    icon: "🏢",
    defaultIssues: [
      "Bus Shelter Damage",
      "Public Toilet Maintenance & Sanitation",
      "Vandalism of Public Property",
      "Illegal Footpath Encroachment",
      "Other Public Property & Amenities Issue"
    ]
  },
  {
    title: "Noise & Air Pollution",
    description: "Loudspeakers, industrial noise, dust pollution from construction, garbage burning.",
    icon: "🔊",
    defaultIssues: [
      "Illegal Loudspeaker / Industrial Noise",
      "Dust Pollution from Construction",
      "Open Burning of Garbage / Plastic",
      "Other Noise & Air Pollution Issue"
    ]
  },
  {
    title: "Public Health & Hygiene",
    description: "Unhygienic food stalls, stagnant water breeding grounds, illegal waste dumping.",
    icon: "🏥",
    defaultIssues: [
      "Unhygienic Street Food Vendor",
      "Stagnant Water Breeding Site",
      "Illegal Commercial Waste Disposal",
      "Other Public Health & Hygiene Issue"
    ]
  },
  {
    title: "Other Civic Grievances",
    description: "General municipal complaints, administrative inquiries, officer SLA delays.",
    icon: "📦",
    defaultIssues: [
      "General Civic Complaint",
      "Municipal Administrative Inquiry",
      "Officer SLA Escalation Feedback",
      "Other Uncategorized Civic Grievance"
    ]
  }
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
        if (data && data.success && Array.isArray(data.services)) {
          setServices(data.services);
        } else {
          setServices([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setServices([]);
      });
  }, []);

  const handleCategoryClick = (title) => {
    const categoryObj = categories.find((c) => c.title === title) || {
      title,
      defaultIssues: [`Other ${title} Issue`],
    };

    // Combine default issues with dynamic backend issues and ensure 'Other [Category] Issue' is present
    const safeServices = Array.isArray(services) ? services : [];
    const dynamicIssues = safeServices
      .filter((s) => s && s.category === title)
      .map((s) => s.subcategory)
      .filter(Boolean);

    const mergedIssues = Array.from(
      new Set([
        ...(categoryObj.defaultIssues || []),
        ...dynamicIssues,
        `Other ${title} Issue`
      ])
    );

    setSelectedCategory({
      ...categoryObj,
      issues: mergedIssues,
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
    <div className="min-h-screen flex flex-col justify-between bg-slate-50">
      <div>
        <Navbar />

        {/* Page Header Banner */}
        <div className="bg-slate-900 text-white py-10 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Municipal Grievance Redressal Mechanism</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Lodge a Civic Complaint
              </h1>
              <p className="text-slate-400 text-xs mt-1">
                Official citizen portal for reporting municipal infrastructure issues to local governance officers.
              </p>
            </div>

            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-lg border border-slate-700 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Home
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {!selectedIssue && (
            <div className="space-y-8">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 uppercase tracking-wider">
                  Step 1: Select Category
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  What type of issue would you like to report?
                </h2>
                <p className="text-slate-600 text-xs">
                  Click on any category card below to choose your specific grievance subcategory or specify a custom issue.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.title}
                    title={category.title}
                    icon={category.icon}
                    description={category.description}
                    onCategoryClick={handleCategoryClick}
                  />
                ))}
              </div>
            </div>
          )}

          {selectedIssue && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 text-xs font-bold text-blue-900 hover:text-blue-950 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 transition"
                >
                  <ArrowLeft className="w-4 h-4" /> Select Different Category
                </button>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Active Filing</span>
                  <p className="text-xs font-extrabold text-slate-900">{selectedCategory?.title} &rsaquo; {selectedIssue}</p>
                </div>
              </div>

              <ComplaintForm
                category={selectedCategory?.title || "General"}
                issue={selectedIssue}
              />
            </div>
          )}
        </div>

        <IssueModal
          open={modalOpen}
          category={selectedCategory?.title}
          issues={selectedCategory?.issues || []}
          onClose={() => setModalOpen(false)}
          onContinue={handleContinue}
        />
      </div>

      <Footer />
    </div>
  );
}
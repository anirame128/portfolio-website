"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RightSlopeField from "../../components/RightSlopeField";

export default function ExperiencePage() {
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Start animation after page loads
    const timer = setTimeout(() => {
      setShouldAnimate(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      {/* Right slope field covering the full right side */}
      <RightSlopeField shouldAnimate={shouldAnimate} />
      
      {/* Experience Content with Vertical Scroll */}
      <div className="relative z-10 h-screen overflow-y-auto scrollbar-hide">
        <div className="p-8 pt-20">
          <div className="max-w-6xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white font-bricolage mb-4">
                My Experience
              </h1>
              <p className="text-gray-300 text-lg font-bricolage">
                Professional journey and career milestones
              </p>
            </div>

            {/* Experience Content */}
            <div className="space-y-12">
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-6">
                    Byline Bank
                  </h2>
                  <div className="text-sm text-gray-600 mb-4">Jul 2025 – Present · Schaumburg, IL</div>
                  <h3 className="text-xl font-semibold text-black font-bricolage mb-3">
                    Software Engineer Intern
                  </h3>
                  <ul className="text-gray-600 font-bricolage space-y-2">
                    <li>• Engineered a Copilot Studio agent for HR, IT, and OSS teams serving 1,000+ employees, reducing M365 license costs from $30/user to $0.01/query by leveraging a pay-as-you-go model</li>
                    <li>• Developed a Python script to extract HTML tables from audit documents into Excel, automating a manual copy-paste process and saving hours of repetitive work</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-6">
                    BreatheIT
                  </h2>
                  <div className="text-sm text-gray-600 mb-4">Jan 2025 – Jul 2025 · Remote</div>
                  <h3 className="text-xl font-semibold text-black font-bricolage mb-3">
                    Software Engineer
                  </h3>
                  <ul className="text-gray-600 font-bricolage space-y-2">
                    <li>• Architected and rebuilt enterprise wellness portal backend from monolithic to Node.js microservices architecture, deployed to GCP with tenant-based JWT Authentication, Stripe API integration, WebSocket APIs for real-time score tracking, and PostgreSQL query optimization achieving 50% performance gains</li>
                    <li>• Redesigned enterprise wellness portal frontend using React, Tailwind CSS, and Material-UI with responsive mobile design, implementing Chart.js and Nivo data visualizations for wellness metrics, real-time score aggregation, and custom company branding to support 20+ active employees tracked through mobile app</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-6">
                    Hidden Studios
                  </h2>
                  <div className="text-sm text-gray-600 mb-4">May 2025 – May 2025 · Remote</div>
                  <h3 className="text-xl font-semibold text-black font-bricolage mb-3">
                    Software Engineer
                  </h3>
                  <ul className="text-gray-600 font-bricolage space-y-2">
                    <li>• Engineered comprehensive Fortnite Creative analytics platform with time-series forecasting engine using Holt's double exponential smoothing and seasonal decomposition, achieving 7-day player trend predictions with confidence intervals and IQR-based outlier detection for 1,200+ maps</li>
                    <li>• Built and deployed Playwright web scraping service on Railway collecting real-time CCU data every 2 minutes with 99% uptime, integrated Supabase pipelines for high-frequency data ingestion, and developed React dashboard with Chart.js visualizations featuring dynamic map selection and animated loading states</li>
                  </ul>
                </div>
              </div>
              <div className="flex justify-start pl-4">
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  <h2 className="text-2xl font-semibold text-black font-bricolage mb-6">
                    Butterflo
                  </h2>
                  <div className="text-sm text-gray-600 mb-4">Mar 2025 – May 2025 · Remote</div>
                  <h3 className="text-xl font-semibold text-black font-bricolage mb-3">
                    Software Engineer Intern
                  </h3>
                  <ul className="text-gray-600 font-bricolage space-y-2">
                    <li>• Built comprehensive real estate platform analytics system by implementing PostHog tracking across Next.js TypeScript application to monitor user search behavior and URL parameters with custom event properties, resulting in configured dashboards that informed UI optimization decisions and drove product adoption</li>
                    <li>• Developed interactive county-level heatmap visualization by implementing Azure Maps API with TypeScript polygon-based rendering and zoom-aware performance optimization to display 5+ risk metrics across the United States, resulting in enhanced user experience for the beta platform</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 text-white hover:text-gray-300 transition-colors z-20"
        aria-label="Go back to main page"
      >
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
      </button>
    </div>
  );
}

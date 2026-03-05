import React from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, ClockIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import Topbar from '../components/Topbar';
import KPITile from '../components/KPITile';
import { RemarksCard, StrengthsCard, WeaknessesCard } from '../components/Card';
import ProfilePopover from '../components/ProfilePopover';
import { RefreshCw } from 'lucide-react';
// Results/Report page with KPIs, remarks, and strengths/weaknesses
const ResultsPage = () => {
  const [showProfile, setShowProfile] = React.useState(false);

  const pageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: [0.22, 0.9, 0.33, 1]
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3,
        ease: [0.22, 0.9, 0.33, 1]
      }
    }
  };

  const kpiData = [
    {
      icon: ArrowPathIcon,
      title: "Total rounds",
      value: "3",
      subtitle: "All round completed"
    },
    {
      icon: ClockIcon,
      title: "Total Time",
      value: "30",
      subtitle: "Minutes"
    },
    {
      icon: HandThumbUpIcon,
      title: "Total Score",
      value: "2",
      subtitle: "Weak Score"
    }
  ];

  const strengths = [
    "Good speech",
    "Technologically Strong",
    "etc"
  ];

  const weaknesses = [
    "Bad at follow ups",
    "Pronounciation issues",
    "etc"
  ];

  const remarksContent = (
    <>
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Technical Proficiency:</h4>
        <p>The candidate demonstrated a strong foundational understanding of machine learning principles and the practical application of libraries such as Pandas and Scikit-learn.</p>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Problem-Solving:</h4>
        <p>When presented with complex data normalization or OpenCV pathing issues, the candidate exhibited logical troubleshooting steps and a methodical approach to resolution.</p>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Project Communication:</h4>
        <p>The explanation of personal projects, including the Mockly platform and speech analysis tools, was articulate and showcased a clear vision for AI-driven solutions.</p>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Executive Feedback Summary:</h4>
        <p>The candidate presented a professional and technically competent profile, particularly excelling in the discussion of machine learning frameworks like TensorFlow and OpenCV. Their ability to synthesize complex topics into actionable project goals was seen with their speech analysis model—is a significant strength. While their technical aptitude in Python is clear, consideration to refine their understanding of AWS networking and infrastructure will make them a more versatile candidate for...</p>
      </div>
    </>
  );

  const improvementContent = (
    <>
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Domain Expertise:</h4>
        <p>Demonstrated proficiency in core technologies such as Python-based Machine Learning libraries, specifically Pandas and Scikit-learn, for data manipulation and predictive modeling.</p>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-gray-900 mb-2">Advanced Framework Knowledge:</h4>
        <p>Ability to articulate complex workflows in generative AI using LangChain and building automated agents with tool-calling capabilities.</p>
      </div>
      
      <div>
        <h4 className="font-semibold text-gray-900 mb-2">Software Engineering Fundamentals:</h4>
        <p>Evidence of clean coding practices, efficient data normalization, and the ability to resolve image-processing errors within OpenCV.</p>
      </div>
    </>
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-panel"
    >
      {/* Topbar */}
      <div className="relative">
        <Topbar onProfileClick={() => setShowProfile(!showProfile)} />
        <div className="absolute top-16 right-6">
          <ProfilePopover 
            isOpen={showProfile}
            onClose={() => setShowProfile(false)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hello, Akshat S Malik
          </h1>
          <p className="text-muted">You see your interview report here</p>
        </motion.div>

        {/* KPI Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {kpiData.map((kpi, i) => (
            <KPITile
              key={kpi.title}
              icon={kpi.icon}
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              delay={i * 0.1}
            />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Remarks and Improvements */}
          <div className="lg:col-span-2 space-y-8">
            <RemarksCard>
              {remarksContent}
            </RemarksCard>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 0.9, 0.33, 1] }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Things to Improve</h2>
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-soft">
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed max-h-64 overflow-y-auto">
                  {improvementContent}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Strengths and Weaknesses */}
          <div className="space-y-6">
            <StrengthsCard 
              strengths={strengths}
              className="sticky top-6"
            />
            <WeaknessesCard 
              weaknesses={weaknesses}
              className="sticky top-80"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsPage;
export { ResultsPage };
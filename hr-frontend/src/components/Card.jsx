import React from 'react';
import { motion } from 'framer-motion';

// Reusable card component with pin decoration and animations
const Card = ({ 
  title, 
  children, 
  variant = "default", 
  pinColor = "red", 
  delay = 0, 
  className = "",
  scrollShadow = false 
}) => {
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20, 
      scale: 0.95,
      rotateX: 5
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      rotateX: 0,
      transition: { 
        duration: 0.45,
        delay,
        ease: [0.22, 0.9, 0.33, 1]
      }
    }
  };

  const pinVariants = {
    hidden: { scale: 0, rotate: -45 },
    visible: { 
      scale: 1, 
      rotate: 0,
      transition: { 
        duration: 0.3,
        delay: delay + 0.2,
        ease: [0.5, 1.6, 0.64, 1]
      }
    }
  };

  const variants = {
    default: "bg-surface border-gray-200",
    yellow: "bg-yellow-100 border-yellow-200",
    blue: "bg-blue-50 border-blue-200",
    white: "bg-white border-gray-200"
  };

  const pinColors = {
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    blue: "bg-blue-500",
    green: "bg-green-500"
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ 
        scale: 1.01,
        rotateY: 1,
        transition: { duration: 0.15 }
      }}
      className={`relative p-6 rounded-2xl border shadow-soft hover:shadow-popup transition-shadow ${variants[variant]} ${className}`}
    >
      {/* Pin */}
      <motion.div
        variants={pinVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className={`absolute -top-2 -right-2 w-6 h-6 ${pinColors[pinColor]} rounded-full shadow-soft`}
      />

      {/* Content */}
      <div className={scrollShadow ? 'max-h-64 overflow-y-auto' : ''}>
        {title && (
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        )}
        {children}
      </div>

      {/* Scroll shadow overlay */}
      {scrollShadow && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      )}
    </motion.div>
  );
};

// Specialized cards for different content types
export const RemarksCard = ({ children, className = "" }) => (
  <Card 
    title="Remarks" 
    variant="white" 
    pinColor="blue" 
    scrollShadow={true}
    className={className}
  >
    <div className="space-y-4 text-gray-700 leading-relaxed">
      {children}
    </div>
  </Card>
);

export const StrengthsCard = ({ strengths = [], className = "" }) => (
  <Card 
    title="Points of Strength" 
    variant="yellow" 
    pinColor="red" 
    className={className}
  >
    <ul className="space-y-3">
      {strengths.map((strength, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="flex items-start space-x-2 text-sm text-gray-700"
        >
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
          <span>{strength}</span>
        </motion.li>
      ))}
    </ul>
  </Card>
);

export const WeaknessesCard = ({ weaknesses = [], className = "" }) => (
  <Card 
    title="Points of Weaknesses" 
    variant="yellow" 
    pinColor="red" 
    className={className}
  >
    <ul className="space-y-3">
      {weaknesses.map((weakness, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
          className="flex items-start space-x-2 text-sm text-gray-700"
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0" />
          <span>{weakness}</span>
        </motion.li>
      ))}
    </ul>
  </Card>
);

export default Card;
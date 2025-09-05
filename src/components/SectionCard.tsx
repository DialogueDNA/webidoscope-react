import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionCardProps {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  title?: string;
}

const SectionCard: React.FC<SectionCardProps> = ({
  children,
  className,
  accent = false,
  title
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "creative-card",
        accent && "creative-section-accent",
        className
      )}
    >
      {title && (
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="font-heading text-lg font-medium text-foreground">
            {title}
          </h3>
        </div>
      )}
      {children}
    </motion.div>
  );
};

export default SectionCard;
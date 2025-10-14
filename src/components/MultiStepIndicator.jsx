import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { User, Users, Package, CheckCircle, CreditCard, FileText } from 'lucide-react'; // Import icons

const stepIcons = {
  1: FileText, // CPF
  2: User, // Dados do Responsável
  3: Users, // Dados do(s) Filho(s)
  4: Package, // Escolha do Plano
  5: CheckCircle, // Conclusão
};

const MultiStepIndicator = ({ currentStep, totalSteps, labels }) => {
  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <Progress value={progressValue} className="h-2 mb-4 bg-muted" indicatorClassName="bg-primary transition-all duration-500 ease-out" />
      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        {labels.map((label, index) => {
          const stepNumber = index + 1;
          const Icon = stepIcons[stepNumber];
          const isActive = currentStep === stepNumber;

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "text-center flex-1 flex flex-col items-center gap-1 transition-colors duration-300",
                { "text-primary": isActive }
              )}
            >
              {Icon && <Icon className={cn("h-5 w-5 mb-1", isActive ? "text-primary" : "text-muted-foreground")} />}
              <span className="block text-xs mb-1">Etapa {stepNumber}</span>
              <span className="block text-sm font-semibold">{label}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MultiStepIndicator;
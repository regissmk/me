import React from 'react';
import { motion } from 'framer-motion';
const AuthLayout = ({
  children
}) => {
  return <div className="w-full min-h-screen lg:grid lg:grid-cols-2 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex items-center justify-center py-12 px-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5
      }} className="mx-auto grid w-full max-w-sm gap-6 bg-card p-8 rounded-lg shadow-lg"> {/* Added bg-card, p-8, rounded-lg, shadow-lg */}
          {children}
        </motion.div>
      </div>
      <div className="hidden bg-muted lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-secondary/80 to-background/50" />
        <img className="h-full w-full object-cover" alt="Imagem de apresentação de uma empresa de fotografia escolar" src="https://horizons-cdn.hostinger.com/5e86f915-53fd-4636-878a-8f2fb5e4815b/image-7UdDS.jpg" />
         <div className="absolute inset-0 bg-black/20"></div>
      </div>
    </div>;
};
export default AuthLayout;
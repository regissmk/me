import React from 'react';
import { motion } from 'framer-motion';

const WelcomeMessage = () => {
  return (
    <motion.p
      className='text-center text-2xl md:text-3xl font-display font-bold text-primary max-w-3xl mx-auto mb-8'
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
    >
      ✨ Seja bem-vindo(a) à experiência exclusiva da <span className='text-secondary'>Memory School Fotografia</span>. <br />
      Aqui, cada momento do seu filho se transforma em uma memória única e inesquecível. <br />
      Conclua seu cadastro e descubra tudo o que preparamos para você. 📸🌟
    </motion.p>
  );
};

export default WelcomeMessage;
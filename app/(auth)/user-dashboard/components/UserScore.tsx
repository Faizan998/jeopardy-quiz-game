import React from 'react';
import { motion } from 'framer-motion';

interface UserScoreProps {
  name: string;
  score: number;
}

const UserScore: React.FC<UserScoreProps> = ({ name, score }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-lg p-6 shadow-xl border border-blue-700"
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 md:mb-0"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Welcome, <span className="text-blue-300">{name}</span>!
          </h2>
          <p className="text-blue-200 mt-2 text-lg">Ready to test your knowledge?</p>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-blue-400 to-purple-500 mt-2 rounded-full"
          />
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 15
          }}
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-br from-yellow-400 to-yellow-500 text-blue-900 font-bold text-xl py-4 px-8 rounded-lg shadow-lg border-2 border-yellow-300"
        >
          <div className="text-sm uppercase tracking-wider text-blue-800 font-semibold">Your Score</div>
          <motion.div 
            className="text-4xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.span
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.7,
                type: "spring",
                stiffness: 300,
                damping: 10
              }}
            >
              ${score}
            </motion.span>
            <motion.span
              animate={{ 
                rotate: [0, 10, -10, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                delay: 1,
                duration: 0.5,
                repeat: 1
              }}
              className="ml-2 text-2xl"
            >
              🏆
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default UserScore;
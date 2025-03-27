'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { User, BadgeDollarSign } from 'lucide-react';

type UserProfile = {
  name: string;
  email: string;
  image?: string;
  subscription?: string;
};

export default function ProfilePage() {
  const { data: session } = useSession();

  if (!session?.user) {
    return <p className="text-center text-gray-500">No user data available</p>;
  }

  const user: UserProfile = {
    name: session.user.name || 'Unknown User',
    email: session.user.email || 'No Email',
    image: session.user.image || '',
    subscription: session.user.subscription || 'No Subscription',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <motion.div
        className="max-w-4xl mx-auto bg-white p-10 rounded-lg shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-6">
          {user.image ? (
            <Image
              src={user.image}
              alt="Profile Picture"
              width={100}
              height={100}
              className="rounded-full border border-gray-300"
            />
          ) : (
            <div className="bg-gray-300 p-4 rounded-full inline-block">
              <User className="w-16 h-16 text-gray-600" />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center mt-2 text-gray-700">
              <BadgeDollarSign className="w-5 h-5 text-green-500 mr-2" />
              <span className="font-medium">{user.subscription}</span>
            </div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
        >
          Edit Profile
        </motion.button>
      </motion.div>
    </div>
  );
}
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    // Add your logout logic here
    router.push('/login');
  };

  const navItems = [
    { name: 'Update Blog', href: '/admin/blog' },
    { name: 'Users', href: '/admin/users' },
    { name: 'Q&A Update', href: '/admin/qa' },
  ];

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 shadow-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-white text-2xl font-bold"
          >
            Admin Dashboard
          </motion.div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className="text-white hover:text-purple-200 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-purple-500"
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
            <motion.button
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onClick={handleLogout}
              className="text-white hover:text-red-200 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-red-500"
            >
              Logout
            </motion.button>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className={`md:hidden overflow-hidden ${isOpen ? 'block' : 'hidden'}`}
        >
          <div className="flex flex-col space-y-2 mt-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-white hover:text-purple-200 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-purple-500"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="text-white hover:text-red-200 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-red-500 text-left"
            >
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar; 
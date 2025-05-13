
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">SNEAKR</h3>
            <p className="text-gray-600 max-w-xs">
              Premium sneakers for every style. Find your perfect fit with our curated collection.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/men" className="text-gray-600 hover:text-purple-600 transition-colors">Men</Link></li>
              <li><Link to="/women" className="text-gray-600 hover:text-purple-600 transition-colors">Women</Link></li>
              <li><Link to="/trending" className="text-gray-600 hover:text-purple-600 transition-colors">Trending</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-purple-600 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-purple-600 transition-colors">Contact</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-purple-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-gray-600 hover:text-purple-600 transition-colors">
                <Facebook size={20} />
              </a>
            </div>
            <div className="mt-4">
              <h4 className="font-medium text-sm mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="px-4 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent" 
                />
                <button className="bg-purple-600 text-white px-4 py-2 rounded-r-md hover:bg-purple-700 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} SNEAKR. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

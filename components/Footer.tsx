import React from 'react';
import { Facebook, Twitter, Linkedin, Instagram, BarChart3 } from './Icons';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-8">
          
          {/* Brand Section */}
          <div className="space-y-4 max-w-sm text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-white mb-2">
              <div className="bg-brand-600 p-1.5 rounded-lg">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight">Idea Validator</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI tool that analyzes your business ideas and gives full investor-ready reports in seconds.
            </p>
          </div>

          {/* Support Section - Horizontal Line */}
          <div className="flex flex-wrap justify-center md:justify-end gap-8 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <a href="#" className="hover:text-white transition-colors">FAQs</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            &copy; {new Date().getFullYear()} Idea Validator — All rights reserved.
          </p>
          
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-slate-400 hover:text-white transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-slate-400 hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-slate-400 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-slate-400 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
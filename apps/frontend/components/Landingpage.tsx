"use client"

import React, { useState, useEffect } from 'react';
import { Pencil, Zap, Users, Download, Github, Sparkles } from 'lucide-react';

 function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{
            left: `${mousePosition.x / 20}px`,
            top: `${mousePosition.y / 20}px`,
            transition: 'all 0.3s ease-out'
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className={`flex items-center gap-2 transition-all duration-700 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <Pencil className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            DrawFlow
          </span>
        </div>
        <div className={`flex items-center gap-6 transition-all duration-700 delay-200 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
          <a href="#features" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">Features</a>
          <a href="#about" className="text-gray-700 hover:text-purple-600 transition-colors font-medium">About</a>
          <button className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-20 pb-32 max-w-7xl mx-auto">
        <div className={`text-center transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Free & Open Source</span>
          </div>
          
          <h1 className="text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Sketch Ideas,
            </span>
            <br />
            <span className="text-gray-900">Build Together</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            A powerful, intuitive drawing tool for creating beautiful diagrams, wireframes, 
            and illustrations. Collaborate in real-time with your team.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <button className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 font-semibold text-lg flex items-center gap-2">
              Start Drawing
              <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white text-gray-700 rounded-full hover:shadow-lg transition-all duration-300 font-semibold text-lg border-2 border-gray-200 flex items-center gap-2">
              <Github className="w-5 h-5" />
              View on GitHub
            </button>
          </div>
        </div>

        {/* Interactive Canvas Preview */}
        <div className={`mt-20 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-20 animate-pulse" />
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              {/* Mock toolbar */}
              <div className="flex items-center gap-2 p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex gap-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center hover:bg-purple-200 transition-colors cursor-pointer">
                    <Pencil className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                    <div className="w-5 h-5 border-2 border-gray-600 rounded" />
                  </div>
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                    <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                  </div>
                </div>
                <div className="flex-1" />
                <div className="flex gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <Download className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {/* Mock canvas */}
              <div className="aspect-video bg-gradient-to-br from-gray-50 to-white p-12 flex items-center justify-center">
                <svg viewBox="0 0 400 200" className="w-full max-w-md">
                  {/* Animated drawing */}
                  <rect x="50" y="50" width="100" height="80" fill="none" stroke="#9333ea" strokeWidth="3" className="animate-pulse" />
                  <circle cx="250" cy="90" r="40" fill="none" stroke="#3b82f6" strokeWidth="3" className="animate-pulse delay-300" />
                  <path d="M 150 90 L 210 90" stroke="#8b5cf6" strokeWidth="2" markerEnd="url(#arrowhead)" className="animate-pulse delay-500" />
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                    </marker>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600">Everything you need to bring your ideas to life</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <Zap className="w-8 h-8" />,
              title: "Lightning Fast",
              description: "Instant rendering and smooth performance even with complex drawings"
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: "Real-time Collaboration",
              description: "Work together with your team in real-time, see changes instantly"
            },
            {
              icon: <Download className="w-8 h-8" />,
              title: "Export Anywhere",
              description: "Export to PNG, SVG, or clipboard with one click"
            }
          ].map((feature, i) => (
            <div 
              key={i}
              className="group p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-purple-600">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-16 text-center overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity" />
          <h2 className="text-4xl font-bold text-white mb-4">Ready to start creating?</h2>
          <p className="text-xl text-purple-100 mb-8">Join thousands of creators using DrawFlow</p>
          <button className="px-10 py-4 bg-white text-purple-600 rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg">
            Get Started for Free
          </button>
        </div>
      </section>
    </div>
  );
}
export default LandingPage;
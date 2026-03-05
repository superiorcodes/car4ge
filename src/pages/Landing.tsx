import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Database, Zap, Users, Shield, BarChart3, Wrench, ArrowRight, Code, Lock, Cpu, TrendingUp, Sparkles, CheckCircle2, Flame, Clock, Star, Rocket, Gift, Calendar, Building2, Leaf, AlertCircle, Zap as ZapIcon, Menu, X } from 'lucide-react';

export function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [featureAnimationIndex, setFeatureAnimationIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFeatureAnimationIndex(prev => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-yellow-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-700/50 backdrop-blur-md bg-slate-900/50">
        <div className="flex items-center space-x-2 md:space-x-3">
          <div className="relative">
            <Wrench className="h-7 md:h-8 w-7 md:w-8 text-amber-500 animate-bounce" style={{animationDelay: '0s'}} />
            <div className="absolute inset-0 bg-amber-500/20 blur-lg animate-pulse"></div>
          </div>
          <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            CAR4GE
          </span>
          <div className="ml-2 px-2 py-1 bg-red-500/80 text-white text-xs font-bold rounded-full animate-pulse">
            LIVE
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-lg font-bold transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/50 transform hover:scale-105"
          >
            Start Free →
          </button>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors ml-auto"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-amber-400" />
          ) : (
            <Menu className="h-6 w-6 text-amber-400" />
          )}
        </button>
      </nav>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-sm border-b border-slate-700/50 p-4 space-y-3">
          <button
            onClick={() => {
              navigate('/login');
              setMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 text-amber-400 hover:text-amber-300 font-semibold transition-colors text-left"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              navigate('/login');
              setMobileMenuOpen(false);
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-lg font-bold transition-all duration-200"
          >
            Start Free →
          </button>
        </div>
      )}

      {/* Hero Section - Pattern Interrupt */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-20 max-w-7xl mx-auto text-center">
        {/* Urgency Badge */}
        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 md:px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full animate-pulse text-xs md:text-sm">
          <Rocket className="h-3 md:h-4 w-3 md:w-4 text-red-500 flex-shrink-0" />
          <span className="font-bold text-red-400">5,000+ Garages Already Connected</span>
        </div>

        {/* Main Headline - Curiosity Gap */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 leading-tight">
          What if every{' '}
          <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 bg-clip-text text-transparent animate-pulse">
            garage system
          </span>
          {' '}could
          <br />
          <span className="text-cyan-400">talk to each other?</span>
        </h1>

        {/* Subheading - Value Proposition */}
        <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed px-2">
          One unified database. One powerful API. Infinite possibilities.
          <br />
          <span className="text-amber-400 font-bold">Connect your garage system in minutes, not months.</span>
        </p>

        {/* CTA Buttons - Primary Action */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-12 md:mb-20 px-2">
          <button
            onClick={() => navigate('/login')}
            className="px-6 md:px-10 py-3 md:py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-lg font-black text-base md:text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/50 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 min-h-12 md:min-h-fit touch-friendly"
          >
            <Gift className="h-4 md:h-5 w-4 md:w-5" />
            <span>Unlock Free API Access</span>
            <ArrowRight className="h-4 md:h-5 w-4 md:w-5" />
          </button>
          <button
            onClick={() => document.getElementById('success-stories')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 md:px-10 py-3 md:py-4 border-2 border-amber-500 hover:bg-amber-500/10 rounded-lg font-bold text-base md:text-lg transition-all duration-200 min-h-12 md:min-h-fit"
          >
            See What's Possible
          </button>
        </div>

        {/* Trust Signals - Social Proof */}
        <div className="flex items-center justify-center gap-4 md:gap-8 mb-12 md:mb-20 flex-wrap px-2">
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Star className="h-4 md:h-5 w-4 md:w-5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
            <span className="font-bold">4.9/5 Stars</span>
          </div>
          <div className="hidden sm:block w-px h-4 md:h-6 bg-slate-600"></div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <TrendingUp className="h-4 md:h-5 w-4 md:w-5 text-cyan-400 flex-shrink-0" />
            <span className="font-bold">5,000+ Garages</span>
          </div>
          <div className="hidden sm:block w-px h-4 md:h-6 bg-slate-600"></div>
          <div className="flex items-center gap-2 text-sm md:text-base">
            <Zap className="h-4 md:h-5 w-4 md:w-5 text-amber-400 flex-shrink-0" />
            <span className="font-bold">100% Free API</span>
          </div>
        </div>
      </section>

      {/* Pattern Interrupt - Animated Stats Section */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-16 bg-gradient-to-r from-blue-900/50 to-slate-900/50 border-y border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              { icon: Zap, label: 'API Calls', value: '∞', color: 'amber' },
              { icon: Users, label: 'Garages', value: '5K+', color: 'cyan' },
              { icon: CheckCircle2, label: 'Uptime', value: '99.9%', color: 'green' },
              { icon: Clock, label: 'Setup Time', value: '<5m', color: 'orange' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center transform hover:scale-110 transition-transform duration-300 active:scale-95 p-2 md:p-0">
                <stat.icon className={`h-6 md:h-8 w-6 md:w-8 mx-auto mb-1 md:mb-2 text-${stat.color}-400`} />
                <p className={`text-lg md:text-2xl font-black text-${stat.color}-400`}>{stat.value}</p>
                <p className="text-xs md:text-sm text-gray-400 font-semibold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories - FOMO & Social Proof */}
      <section id="success-stories" className="relative z-10 px-4 md:px-6 py-12 md:py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-8 md:mb-12 text-center">
          <Sparkles className="inline h-6 md:h-8 w-6 md:w-8 text-amber-400 mr-2 animate-spin" />
          Real Garages, Real Results
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 mb-12">
          {[
            {
              name: "Mike's Auto Garage",
              stat: "40% faster",
              detail: "vehicle lookups",
              icon: ZapIcon
            },
            {
              name: "ServiceHub Network",
              stat: "5 locations",
              detail: "unified instantly",
              icon: Building2
            },
            {
              name: "EcoRepair Co",
              stat: "Zero data silos",
              detail: "complete sync",
              icon: Leaf
            }
          ].map((story, idx) => (
            <div
              key={idx}
              className="relative group bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-5 md:p-8 rounded-xl border border-amber-500/20 hover:border-amber-500/50 transition-all duration-300 overflow-hidden active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-600/0 group-hover:from-amber-500/10 group-hover:to-orange-600/10 transition-all duration-300"></div>
              <div className="relative z-10">
                <story.icon className="h-10 md:h-12 w-10 md:w-12 text-amber-400 mb-2 md:mb-4" />
                <p className="font-bold text-amber-400 text-base md:text-lg mb-2">{story.stat}</p>
                <p className="text-xs md:text-sm text-gray-300 mb-3 md:mb-4">{story.detail}</p>
                <p className="text-xs text-gray-500 font-semibold">{story.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Features Section - Gamification & Variable Rewards */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-20 bg-gradient-to-b from-slate-900 to-blue-900/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black mb-2 md:mb-4 text-center">
            Unlock Every Feature
          </h2>
          <p className="text-center text-gray-400 mb-8 md:mb-16 text-base md:text-lg">Everything you need starts at zero cost</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: Database,
                title: "Centralized Data",
                description: "One reliable database for all your garage operations",
                badge: "Included",
                color: "cyan"
              },
              {
                icon: Code,
                title: "Developer Friendly",
                description: "Clean REST API with instant integration",
                badge: "Free",
                color: "amber"
              },
              {
                icon: Shield,
                title: "Secure & Reliable",
                description: "Enterprise-grade security, never lose data",
                badge: "Always",
                color: "green"
              },
              {
                icon: Users,
                title: "Multi-Garage Sync",
                description: "Manage unlimited locations from one place",
                badge: "Unlimited",
                color: "cyan"
              },
              {
                icon: Cpu,
                title: "Real-time Sync",
                description: "Instant data synchronization across all systems",
                badge: "Real-time",
                color: "orange"
              },
              {
                icon: Lock,
                title: "Your Data, Your Rules",
                description: "You own 100% of your data, always portable",
                badge: "Forever",
                color: "amber"
              }
            ].map((feature, idx) => {
              const isHigh = featureAnimationIndex === idx % 3;
              return (
                <div
                  key={idx}
                  className={`relative group bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-5 md:p-8 rounded-xl border border-slate-600 hover:border-amber-500 transition-all duration-300 overflow-hidden transform hover:scale-105 active:scale-95 ${
                    isHigh ? 'ring-2 ring-amber-500 scale-105' : ''
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 to-orange-600/0 group-hover:from-amber-500/20 group-hover:to-orange-600/20 transition-all duration-300"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <feature.icon className={`h-8 md:h-10 w-8 md:w-10 text-${feature.color}-400 flex-shrink-0`} />
                      <div className={`px-2 md:px-3 py-1 bg-${feature.color}-500/20 border border-${feature.color}-500/50 rounded-full text-xs font-bold text-${feature.color}-400 whitespace-nowrap`}>
                        {feature.badge}
                      </div>
                    </div>
                    <h3 className="text-base md:text-lg font-bold mb-2 md:mb-3 text-white">{feature.title}</h3>
                    <p className="text-gray-400 text-xs md:text-sm">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* API Power Section - Curiosity & Progress */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-3 md:px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs md:text-sm">
              <Zap className="h-3 md:h-4 w-3 md:w-4 text-cyan-400 flex-shrink-0" />
              <span className="font-bold text-cyan-400">The Core Power</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight">
              Free API That Actually Works
            </h2>
            <p className="text-gray-300 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
              Our <span className="text-amber-400 font-bold">free API is the entire point</span>. No tricks, no hidden fees. One API call and your garage system is connected to 5,000+ others.
            </p>
            
            {/* Feature Checklist with Progress Feel */}
            <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
              {[
                "Unlimited API requests (seriously)",
                "Real-time data synchronization",
                "Webhooks for intelligent automation",
                "JSON format (simple, standard)",
                "API Keys with role-based access",
                "24/7 support from our team"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 md:gap-3 group hover:translate-x-2 transition-transform p-2 -mx-2 rounded active:bg-slate-700/30">
                  <div className="flex-shrink-0 w-5 md:w-6 h-5 md:h-6 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <CheckCircle2 className="h-3 md:h-4 w-3 md:w-4 text-white" />
                  </div>
                  <span className="text-xs md:text-base text-gray-300 group-hover:text-amber-400 transition-colors">{item}</span>
                  <div className="ml-auto text-xs text-gray-600 flex items-center gap-1 flex-shrink-0"><span className="text-amber-400">{idx + 1}</span></div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => navigate('/login')}
              className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg font-black text-base md:text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-cyan-500/50 transform hover:scale-105 active:scale-95 min-h-12"
            >
              Get Free API Access Now
            </button>
          </div>
          
          {/* Code Block - Reward/Instant Gratification */}
          <div className="relative group mt-8 md:mt-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            <div className="relative bg-slate-900 border border-cyan-500/30 p-4 md:p-6 rounded-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-2xl"></div>
              <pre className="text-xs md:text-sm text-cyan-300 overflow-x-auto relative z-10 font-mono">
{`// 3 lines to connect
const client = createCarGage(
  'YOUR_API_KEY_HERE'
);

// Access everything
const vehicles = await client
  .vehicles
  .list();

// It's that simple.`}
              </pre>
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-700 text-xs text-gray-500 flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3 text-green-400 flex-shrink-0" />
                <span>Live, working example</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Power Section - Visual Feedback */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-20 bg-gradient-to-b from-blue-900/30 to-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            {/* Visual Element */}
            <div className="relative h-48 md:h-80 rounded-lg overflow-hidden group mt-6 md:mt-0">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-orange-600/20 group-hover:from-amber-500/30 group-hover:to-orange-600/30 transition-all duration-300"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="space-y-4">
                  <BarChart3 className="h-24 w-24 text-amber-400 animate-pulse" />
                  <p className="text-center text-gray-400 text-sm">Real-time Dashboard</p>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-3 md:px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-full text-xs md:text-sm">
                <AlertCircle className="h-3 md:h-4 w-3 md:w-4 text-orange-400 flex-shrink-0" />
                <span className="font-bold text-orange-400">Built-In Tools</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-6 leading-tight">
                Dashboard Included
              </h2>
              <p className="text-gray-300 mb-6 md:mb-8 text-base md:text-lg leading-relaxed">
                Beyond the API, we give you a <span className="text-amber-400 font-bold">complete garage management dashboard</span>. Manage vehicles, schedule maintenance, track services, and grow your business.
              </p>
              
              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
                {[
                { icon: Database, label: 'Vehicle Mgmt' },
                { icon: Wrench, label: 'Maintenance' },
                { icon: Calendar, label: 'Scheduling' },
                { icon: Users, label: 'Team Access' },
                { icon: BarChart3, label: 'Analytics' },
                { icon: AlertCircle, label: 'Alerts' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors group active:bg-slate-600 min-h-10">
                  <item.icon className="h-4 md:h-5 w-4 md:w-5 text-amber-400 group-hover:scale-125 transition-transform flex-shrink-0" />
                    <span className="text-xs md:text-sm font-semibold text-gray-300 group-hover:text-amber-400">{item.label}</span>
                  </div>
                ))}
              </div>
              
              <button
                onClick={() => navigate('/login')}
                className="w-full px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 rounded-lg font-black text-base md:text-lg transition-all duration-200 hover:shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 active:scale-95 min-h-12"
              >
                Explore Full Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Urgency & Final Conversion */}
      <section className="relative z-10 px-4 md:px-6 py-12 md:py-24 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 mb-4 md:mb-6 px-3 md:px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full animate-pulse text-xs md:text-sm">
          <Clock className="h-3 md:h-4 w-3 md:w-4 text-red-500 flex-shrink-0" />
          <span className="font-bold text-red-400">Join the Movement</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-tight">
          Your Garage System's
          <br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
            Next Evolution
          </span>
          <br />
          Starts Here
        </h2>
        
        <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-8 md:mb-12 leading-relaxed max-w-2xl mx-auto px-2">
          Join 5,000+ garages already using CAR4GE. Connect for free. Grow forever. No locked-in contracts. Pure freedom.
        </p>

        {/* Dual CTA with Visual Hierarchy */}
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12 px-2">
          <button
            onClick={() => navigate('/login')}
            className="pulse-button px-6 md:px-12 py-3 md:py-5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 rounded-xl font-black text-base md:text-xl transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 md:gap-3 min-h-12"
          >
            <Rocket className="h-4 md:h-6 w-4 md:w-6 flex-shrink-0" />
            <span>Get Started Free Right Now</span>
            <ArrowRight className="h-4 md:h-6 w-4 md:w-6 flex-shrink-0" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-6 md:px-12 py-3 md:py-5 border-2 md:border-3 border-amber-500 hover:bg-amber-500/5 rounded-xl font-black text-base md:text-lg transition-all duration-200 min-h-12"
          >
            Book a Demo
          </button>
        </div>

        {/* Risk Reversal */}
        <div className="text-center">
          <p className="text-xs md:text-sm text-gray-400 mb-2 md:mb-4 space-y-2">
            <span className="flex items-center justify-center gap-2 flex-wrap\">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 md:h-4 w-3 md:w-4 text-green-400 flex-shrink-0" /><span>Free forever tier available</span></span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center justify-center gap-2 flex-wrap">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 md:h-4 w-3 md:w-4 text-green-400 flex-shrink-0" /><span>No credit card required</span></span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center justify-center gap-2 flex-wrap">
              <span className="flex items-center gap-1"><CheckCircle2 className="h-3 md:h-4 w-3 md:w-4 text-green-400 flex-shrink-0" /><span>Cancel anytime</span></span>
            </span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-700/50 py-8 md:py-12 px-4 md:px-6 text-center text-gray-400">
        <div className="max-w-7xl mx-auto">
          <p className="mb-3 md:mb-4 text-xs md:text-sm">&copy; 2026 CAR4GE. Building the future of garage systems.</p>
          <div className="flex items-center justify-center gap-3 md:gap-6 text-xs md:text-sm flex-wrap">
            <button className="hover:text-amber-400 transition-colors">Privacy Policy</button>
            <span className="hidden sm:inline">•</span>
            <button className="hover:text-amber-400 transition-colors">Terms of Service</button>
            <span className="hidden sm:inline">•</span>
            <button className="hover:text-amber-400 transition-colors">API Docs</button>
          </div>
        </div>
      </footer>

      {/* CSS for animations and mobile improvements */}
      <style jsx>{`
        @keyframes pulse-animation {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(245, 158, 11, 0);
          }
        }
        
        .pulse-button {
          animation: pulse-animation 2s infinite;
        }
        
        .delay-700 {
          animation-delay: 700ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        .touch-friendly {
          min-height: 48px;
        }
        
        /* Improve touch targets on mobile */
        @media (max-width: 768px) {
          button {
            min-height: 44px;
            min-width: 44px;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
}

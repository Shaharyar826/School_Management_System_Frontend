import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../config/axios';

const Header = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            EduFlow Pro
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-900">Login</button>
          <button onClick={() => navigate('/signup')} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Start Free Trial
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">E</span>
          </div>
          <h1 className="text-xl font-bold">EduFlow Pro</h1>
        </div>
        <p className="text-gray-400 mb-4">Empowering educational institutions worldwide</p>
        <p className="text-gray-500 text-sm">© 2024 EduFlow Pro. All rights reserved.</p>
      </div>
    </footer>
  );
};

export { Header, Footer };

const EduFlowLanding = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [signupData, setSignupData] = useState({
    subdomain: '',
    institutionName: '',
    adminEmail: '',
    adminPassword: '',
    adminFirstName: '',
    adminLastName: '',
    institutionType: 'education'
  });
  const navigate = useNavigate();

  const plans = {
    starter: { 
      name: 'Starter', 
      price: 29, 
      users: 100, 
      instructors: 5, 
      features: ['Basic Attendance', 'Simple Fee Management', 'Email Support', 'Mobile Access'] 
    },
    professional: { 
      name: 'Professional', 
      price: 79, 
      users: 500, 
      instructors: 25, 
      features: ['Advanced Analytics', 'Bulk Operations', 'Parent Portal', 'SMS Notifications', 'API Access'] 
    },
    enterprise: { 
      name: 'Enterprise', 
      price: 199, 
      users: 'Unlimited', 
      instructors: 'Unlimited', 
      features: ['Custom Branding', 'SSO Integration', 'Dedicated Support', 'Advanced Security', 'Custom Reports'] 
    },
    district: { 
      name: 'District', 
      price: 499, 
      users: 'Unlimited', 
      instructors: 'Unlimited', 
      features: ['Multi-Campus', 'White-label Solution', 'Custom Integrations', 'On-premise Option', 'Priority Support'] 
    }
  };

  const verticals = [
    { id: 'education', name: 'Educational Institutions', icon: '🎓', desc: 'K-12 Schools, Colleges, Universities' },
    { id: 'training', name: 'Training Centers', icon: '📚', desc: 'Professional Training, Skill Development' },
    { id: 'corporate', name: 'Corporate Learning', icon: '🏢', desc: 'Employee Training, HR Management' },
    { id: 'coaching', name: 'Coaching Institutes', icon: '🎯', desc: 'Test Prep, Competitive Exams' }
  ];

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/onboarding/signup', {
        ...signupData,
        plan: selectedPlan
      });
      
      localStorage.setItem('token', response.data.token);
      window.location.href = `https://${signupData.subdomain}.eduflowpro.com/dashboard`;
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Header />

      {/* Hero Section */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4">
          <h2 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            The Complete
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Educational </span>
            Management Platform
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Streamline operations, enhance productivity, and drive growth for educational institutions worldwide. 
            Trusted by 10,000+ institutions across 50+ countries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/signup')} 
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
            >
              Start 14-Day Free Trial
            </button>
            <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:border-gray-400 transition-all">
              Watch Demo
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-4">No credit card required • Setup in 5 minutes</p>
        </div>
      </section>

      {/* Industry Verticals */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-4">Built for Every Educational Institution</h3>
          <p className="text-xl text-gray-600 text-center mb-12">Flexible platform that adapts to your unique needs</p>
          <div className="grid md:grid-cols-4 gap-8">
            {verticals.map((vertical) => (
              <div key={vertical.id} className="text-center p-6 rounded-xl hover:shadow-lg transition-all cursor-pointer border border-gray-100">
                <div className="text-4xl mb-4">{vertical.icon}</div>
                <h4 className="text-xl font-semibold mb-2">{vertical.name}</h4>
                <p className="text-gray-600">{vertical.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-12">Everything You Need to Succeed</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Learner Management', desc: 'Complete learner lifecycle management with advanced analytics', icon: '👥' },
              { title: 'Instructor Portal', desc: 'Powerful tools for instructors to manage courses and track progress', icon: '🎓' },
              { title: 'Financial Operations', desc: 'Automated fee collection, payment processing, and financial reporting', icon: '💰' },
              { title: 'Communication Hub', desc: 'Multi-channel communication with learners, parents, and staff', icon: '📱' },
              { title: 'Analytics & Insights', desc: 'Real-time dashboards and predictive analytics for better decisions', icon: '📊' },
              { title: 'Process Automation', desc: 'Workflow automation to reduce manual work and increase efficiency', icon: '⚡' }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold mb-3">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h3>
          <p className="text-xl text-gray-600 text-center mb-12">Choose the plan that fits your institution's size and needs</p>
          <div className="grid md:grid-cols-4 gap-8">
            {Object.entries(plans).map(([key, plan]) => (
              <div key={key} className={`border-2 rounded-xl p-8 relative ${selectedPlan === key ? 'border-blue-500 bg-blue-50 shadow-lg' : 'border-gray-200 hover:border-gray-300'} transition-all`}>
                {key === 'professional' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <h4 className="text-2xl font-bold mb-2">{plan.name}</h4>
                <div className="text-4xl font-bold mb-1">${plan.price}<span className="text-lg text-gray-500">/month</span></div>
                <p className="text-gray-600 mb-6">Billed annually</p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Up to {plan.users} learners</li>
                  <li className="flex items-center"><span className="text-green-500 mr-2">✓</span>Up to {plan.instructors} instructors</li>
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center"><span className="text-green-500 mr-2">✓</span>{feature}</li>
                  ))}
                </ul>
                <button 
                  onClick={() => setSelectedPlan(key)} 
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    selectedPlan === key 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedPlan === key ? 'Selected Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section id="signup" className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h3 className="text-3xl font-bold mb-2 text-center">Start Your Free Trial Today</h3>
            <p className="text-gray-600 text-center mb-8">Join thousands of institutions already using EduFlow Pro</p>
            
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Institution Name" 
                  value={signupData.institutionName} 
                  onChange={(e) => setSignupData({...signupData, institutionName: e.target.value})} 
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
                <select
                  value={signupData.institutionType}
                  onChange={(e) => setSignupData({...signupData, institutionType: e.target.value})}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {verticals.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
              </div>
              
              <div className="flex">
                <input 
                  type="text" 
                  placeholder="subdomain" 
                  value={signupData.subdomain} 
                  onChange={(e) => setSignupData({...signupData, subdomain: e.target.value})} 
                  className="flex-1 p-4 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
                <span className="bg-gray-100 p-4 border-t border-b border-r border-gray-300 rounded-r-lg text-gray-600">
                  .eduflowpro.com
                </span>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Admin First Name" 
                  value={signupData.adminFirstName} 
                  onChange={(e) => setSignupData({...signupData, adminFirstName: e.target.value})} 
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
                <input 
                  type="text" 
                  placeholder="Admin Last Name" 
                  value={signupData.adminLastName} 
                  onChange={(e) => setSignupData({...signupData, adminLastName: e.target.value})} 
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  required 
                />
              </div>
              
              <input 
                type="email" 
                placeholder="Admin Email" 
                value={signupData.adminEmail} 
                onChange={(e) => setSignupData({...signupData, adminEmail: e.target.value})} 
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
              
              <input 
                type="password" 
                placeholder="Admin Password" 
                value={signupData.adminPassword} 
                onChange={(e) => setSignupData({...signupData, adminPassword: e.target.value})} 
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                required 
              />
              
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg text-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Start Free Trial - {plans[selectedPlan].name} Plan
              </button>
            </form>
            
            <p className="text-sm text-gray-500 text-center mt-6">
              14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EduFlowLanding;
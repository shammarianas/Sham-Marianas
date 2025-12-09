import React, { useState } from 'react';
import { useUser } from "../Context/UserProvider";
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const { userProfile, currentUser } = useUser();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('individual');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [teamMembers, setTeamMembers] = useState(2);

  const plans = {
    individual: {
      name: 'Individual',
      price: billingCycle === 'monthly' ? '$16.50' : '$198',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      popular: false,
      description: 'Start now',
      features: [
        { text: 'Unlimited downloads of 26+ million premium assets & templates', included: true },
        { text: 'Full AI stack: video, image, and audio gen', included: true },
        { text: 'Lifetime commercial license', included: true },
        { text: 'Easy cancellation', included: true },
      ],
      buttonText: 'Start now',
      buttonVariant: 'primary',
      priceValue: billingCycle === 'monthly' ? 16.50 : 198
    },
    team: {
      name: 'Team',
      price: billingCycle === 'monthly' ? '$29' : '$348',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      popular: true,
      // description: '2 members',
      // savings: billingCycle === 'monthly' ? 'Save up to 34%' : 'Save 34%',
      features: [
        { text: 'Everything in Individual, plus:', included: true, isHeader: true },
        { text: 'Teams save up to 34%', included: true },
        { text: 'Scale and change members at any time', included: true },
        { text: 'One central location for all downloads', included: true },
        { text: 'Easy cancellation', included: true },
      ],
      buttonText: 'Start now',
      buttonVariant: 'primary',
      priceValue: billingCycle === 'monthly' ? 29 : 348,
      showMembersDropdown: true
    },
    enterprise: {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      popular: false,
      description: 'Tailored plans for teams of any size with dedicated account management',
      features: [
        { text: 'Everything in Teams, plus:', included: true, isHeader: true },
        { text: 'Custom licensing', included: true },
        { text: 'AI tools available only on the Ultimate Plan', included: true },
        { text: 'Tailored indemnification', included: true },
        { text: 'SSO for more secure, scalable access', included: true },
      ],
      buttonText: 'Contact sales',
      buttonVariant: 'outline',
      isCustom: true
    }
  };

  const handleSubscription = async (plan) => {
    if (plan === 'enterprise') {
      // Open contact sales page or modal
      window.open('https://examplements.envelope.com/adjustment-exploring-envelope-plack/pandering-reinvestable-2', '_blank');
      return;
    }
    
    try {
      console.log('Processing subscription for:', plan);
      
      // Create subscription item for checkout
      const subscriptionItem = {
        id: `sub_${plan}_${billingCycle}`,
        name: `${plans[plan].name} Plan - ${billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}`,
        price: plans[plan].priceValue,
        type: 'subscription',
        plan: plan,
        billingCycle: billingCycle,
        teamMembers: plan === 'team' ? teamMembers : 1,
        description: `Subscribe to ${plans[plan].name} plan`
      };

      // Store subscription data in localStorage or context for checkout page
      localStorage.setItem('pendingSubscription', JSON.stringify(subscriptionItem));
      
      // Navigate to checkout page
      navigate('/checkout', { 
        state: { 
          subscriptionItem: subscriptionItem,
          fromSubscription: true
        }
      });
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error processing subscription. Please try again.');
    }
  };

  const handleFreeTrial = () => {
    // Navigate to checkout with free trial option
    navigate('/checkout', { 
      state: { 
        freeTrial: true,
        plan: 'individual'
      }
    });
  };

  const isCurrentPlan = (plan) => {
    // Add your logic to check if this is the user's current plan
    return false;
  };

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleTeamMembersChange = (e) => {
    const members = parseInt(e.target.value);
    setTeamMembers(members);
    // You can add logic to adjust price based on team size
  };

  return (
    <div className="subscription-page section-padding">
      <div className="container-xxl">
        {/* Header Section */}
        <div className="sec-head text-center mb-80">
          <h6 className="sub-title text-uppercase tracking-wider text-sm mb-15">PRICING PLANS</h6>
          <h1 className="text-5xl md-text-6xl font-bold mb-6">Choose Your Plan</h1>
          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Access millions of premium assets with our flexible pricing plans
          </p>
          
          {/* Billing Toggle */}
          <div className="billing-toggle mt-12 flex items-center justify-center space-x-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
            <button 
              onClick={toggleBillingCycle}
              className="billing-toggle-btn"
            >
              <div className={`billing-toggle-slider ${billingCycle === 'monthly' ? 'monthly' : 'yearly'}`} />
            </button>
            <span className={`text-sm ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-400'}`}>
              Yearly <span className="text-green-400 ml-1">Save up to 34%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          <div className="row justify-center">
            {/* Individual Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div className={`pricing-card individual-plan ${isCurrentPlan('individual') ? 'current-plan' : ''}`}>
                {isCurrentPlan('individual') && (
                  <div className="current-badge">
                    CURRENT PLAN
                  </div>
                )}
                
                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.individual.name}</h3>
                  <div className="price-from">From</div>
                  <div className="price-display mb-2">
                    <span className="price text-white">{plans.individual.price}</span>
                    {plans.individual.period && (
                      <span className="period text-gray-400">/{plans.individual.period}</span>
                    )}
                  </div>
                  <p className="plan-description text-gray-400">{plans.individual.description}</p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.individual.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <div className={`feature-icon ${feature.included ? 'included' : 'not-included'}`}>
                        <i className={`fas ${feature.included ? 'fa-check' : 'fa-times'}`}></i>
                      </div>
                      <span className={`feature-text ${feature.included ? 'text-gray-300' : 'text-gray-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`action-btn individual-btn ${isCurrentPlan('individual') ? 'current' : ''}`}
                  onClick={() => handleSubscription('individual')}
                  disabled={isCurrentPlan('individual')}
                >
                  {isCurrentPlan('individual') ? 'Current Plan' : plans.individual.buttonText}
                </button>
              </div>
            </div>

            {/* Team Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div className={`pricing-card team-plan featured ${plans.team.popular ? 'popular' : ''}`}>
                {plans.team.popular && (
                  <div className="popular-badge">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.team.name}</h3>
                  <div className="price-from">From</div>
                  <div className="price-display mb-2">
                    <span className="price team-price">{plans.team.price}</span>
                    {plans.team.period && (
                      <span className="period text-gray-400">/{plans.team.period}</span>
                    )}
                  </div>
                  {plans.team.showMembersDropdown && (
                    <div className="team-members mt-4">
                      <select 
                        value={teamMembers}
                        onChange={handleTeamMembersChange}
                        className="members-dropdown"
                      >
                        <option value="2">2 members</option>
                        <option value="3">3 members</option>
                        <option value="5">5 members</option>
                        <option value="10">10 members</option>
                        <option value="20">20 members</option>
                      </select>
                    </div>
                  )}
                  {plans.team.savings && (
                    <div className="savings-tag mt-3">
                      {plans.team.savings}
                    </div>
                  )}
                  <p className="plan-description text-gray-400">{plans.team.description}</p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.team.features.map((feature, index) => (
                    <li key={index} className={`feature-item ${feature.isHeader ? 'feature-header' : ''}`}>
                      <div className={`feature-icon team-feature ${feature.included ? 'included' : 'not-included'}`}>
                        <i className={`fas ${feature.included ? 'fa-check' : 'fa-times'}`}></i>
                      </div>
                      <span className={`feature-text ${feature.isHeader ? 'text-lg font-semibold' : ''} ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="action-btn team-btn"
                  onClick={() => handleSubscription('team')}
                >
                  {plans.team.buttonText}
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div className="pricing-card enterprise-plan">
                <div className="value-badge">
                  ENTERPRISE GRADE
                </div>
                
                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.enterprise.name}</h3>
                  {plans.enterprise.isCustom ? (
                    <div className="custom-price-display">
                      <span className="custom-price">Custom Pricing</span>
                    </div>
                  ) : (
                    <div className="price-display mb-2">
                      <span className="price enterprise-price">{plans.enterprise.price}</span>
                      {plans.enterprise.period && (
                        <span className="period text-gray-400">/{plans.enterprise.period}</span>
                      )}
                    </div>
                  )}
                  <p className="plan-description text-gray-400 mt-4">{plans.enterprise.description}</p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.enterprise.features.map((feature, index) => (
                    <li key={index} className={`feature-item ${feature.isHeader ? 'feature-header' : ''}`}>
                      <div className={`feature-icon enterprise-feature ${feature.included ? 'included' : 'not-included'}`}>
                        <i className={`fas ${feature.included ? 'fa-check' : 'fa-times'}`}></i>
                      </div>
                      <span className={`feature-text ${feature.isHeader ? 'text-lg font-semibold' : ''} ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="action-btn enterprise-btn"
                  onClick={() => handleSubscription('enterprise')}
                >
                  {plans.enterprise.buttonText}
                </button>
                
                <div className="mt-4 text-center">
                  <a 
                    href="https://examplements.envelope.com/adjustment-exploring-envelope-plack/pandering-reinvestable-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="learn-more-link"
                  >
                    Learn more
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-section">
          <div className="trust-border">
            <p className="trust-text">Trusted by 10,000+ designers and developers worldwide</p>
            <div className="trust-badges">
              <div className="trust-badge">
                <i className="fas fa-shield-alt text-green-400"></i>
                <span className="trust-badge-text">Secure Payment</span>
              </div>
              <div className="trust-badge">
                <i className="fas fa-sync-alt text-blue-400"></i>
                <span className="trust-badge-text">Cancel Anytime</span>
              </div>
              <div className="trust-badge">
                <i className="fas fa-headset text-purple-400"></i>
                <span className="trust-badge-text">24/7 Support</span>
              </div>
              <div className="trust-badge">
                <i className="fas fa-check-circle text-green-400"></i>
                <span className="trust-badge-text">30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section">
          <div className="sec-head text-center mb-12">
            <h3 className="faq-title">Frequently Asked Questions</h3>
            <p className="faq-subtitle">Everything you need to know about our plans</p>
          </div>
          
          <div className="faq-container">
            {[
              {
                question: "Can I switch between plans?",
                answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the charges."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans."
              },
              {
                question: "Is there a free trial for paid plans?",
                answer: "Yes, all paid plans come with a 14-day free trial. No credit card required to start."
              },
              {
                question: "How does team pricing work?",
                answer: "Team plans start at 2 members and you can add or remove members at any time. Price scales based on the number of members."
              }
            ].map((faq, index) => (
              <div key={index} className="faq-item">
                <button 
                  className={`faq-header ${activeAccordion === index ? 'active' : ''}`}
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="faq-question">{faq.question}</span>
                  <i className={`fas fa-chevron-down ${activeAccordion === index ? 'rotate' : ''}`}></i>
                </button>
                <div className={`faq-content ${activeAccordion === index ? 'active' : ''}`}>
                  <p className="faq-answer">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section">
          <div className="cta-box">
            <h3 className="cta-title">Ready to Get Started?</h3>
            <p className="cta-subtitle">
              Join thousands of creators and teams who trust our platform for their design assets
            </p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={handleFreeTrial}>
                Start Free Trial
              </button>
              <button className="cta-btn secondary" onClick={() => handleSubscription('enterprise')}>
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
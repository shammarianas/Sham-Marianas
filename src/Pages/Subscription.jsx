import React, { useState } from 'react';
import { useUser } from "../Context/UserProvider";
import { useNavigate } from 'react-router-dom';

const Subscription = () => {
  const { userProfile, currentUser } = useUser();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [activeAccordion, setActiveAccordion] = useState(null);

  const plans = {
    free: {
      name: 'Starter',
      price: '$0',
      period: 'forever',
      popular: false,
      features: [
        { text: '5 asset downloads per month', included: true },
        { text: 'Basic quality assets', included: true },
        { text: 'Standard support', included: true },
        { text: 'Community access', included: true },
        { text: 'Limited templates', included: true },
        { text: 'Commercial license', included: false },
        { text: 'Priority support', included: false },
        { text: 'Advanced templates', included: false }
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline'
    },
    pro: {
      name: 'Professional',
      price: billingCycle === 'monthly' ? '$19' : '$190',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      popular: true,
      features: [
        { text: 'Unlimited asset downloads', included: true },
        { text: 'High quality assets', included: true },
        { text: 'Priority support', included: true },
        { text: 'Advanced templates', included: true },
        { text: 'Commercial license', included: true },
        { text: 'Cancel anytime', included: true },
        { text: 'Early access to new assets', included: false },
        { text: 'Dedicated account manager', included: false }
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary',
      savings: billingCycle === 'yearly' ? 'Save $38' : '',
      priceValue: billingCycle === 'monthly' ? 19 : 190
    },
    premium: {
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? '$49' : '$490',
      period: billingCycle === 'monthly' ? 'month' : 'year',
      popular: false,
      features: [
        { text: 'Unlimited asset downloads', included: true },
        { text: 'Highest quality assets', included: true },
        { text: '24/7 priority support', included: true },
        { text: 'All premium templates', included: true },
        { text: 'Commercial license', included: true },
        { text: 'Early access to new assets', included: true },
        { text: 'Dedicated account manager', included: true },
        { text: 'Custom asset requests', included: true }
      ],
      buttonText: 'Go Enterprise',
      buttonVariant: 'primary',
      savings: billingCycle === 'yearly' ? 'Save $98' : '',
      priceValue: billingCycle === 'monthly' ? 49 : 490
    }
  };

  const handleSubscription = async (plan) => {
    if (plan === 'free') return;
    
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
        plan: 'pro'
      }
    });
  };

  const isCurrentPlan = (plan) => {
    return plan === 'free';
  };

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="subscription-page section-padding">
      <div className="container-xxl">
        {/* Header Section */}
        <div className="sec-head text-center mb-80">
          <h6 className="sub-title text-uppercase tracking-wider text-sm mb-15">PRICING PLANS</h6>
          <h1 className="text-5xl md-text-6xl font-bold mb-6">Choose Your Plan</h1>
          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Start with our free plan and upgrade when you need more power and advanced features
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
              Yearly <span className="text-green-400 ml-1">Save up to 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          <div className="row justify-center">
            {/* Free Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div className={`pricing-card free-plan ${isCurrentPlan('free') ? 'current-plan' : ''}`}>
                {isCurrentPlan('free') && (
                  <div className="current-badge">
                    CURRENT PLAN
                  </div>
                )}
                
                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.free.name}</h3>
                  <div className="price-display mb-2">
                    <span className="price text-white">{plans.free.price}</span>
                    <span className="period text-gray-400">/{plans.free.period}</span>
                  </div>
                  <p className="plan-description text-gray-400">Perfect for getting started</p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.free.features.map((feature, index) => (
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
                  className={`action-btn free-btn ${isCurrentPlan('free') ? 'current' : ''}`}
                  onClick={() => handleSubscription('free')}
                  disabled={isCurrentPlan('free')}
                >
                  {isCurrentPlan('free') ? 'Current Plan' : plans.free.buttonText}
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div className={`pricing-card pro-plan featured ${plans.pro.popular ? 'popular' : ''}`}>
                {plans.pro.popular && (
                  <div className="popular-badge">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.pro.name}</h3>
                  <div className="price-display mb-2">
                    <span className="price pro-price">{plans.pro.price}</span>
                    <span className="period text-gray-400">/{plans.pro.period}</span>
                  </div>
                  {plans.pro.savings && (
                    <div className="savings-tag">
                      {plans.pro.savings}
                    </div>
                  )}
                  <p className="plan-description text-gray-400">Best for professionals & teams</p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.pro.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <div className={`feature-icon pro-feature ${feature.included ? 'included' : 'not-included'}`}>
                        <i className={`fas ${feature.included ? 'fa-check' : 'fa-times'}`}></i>
                      </div>
                      <span className={`feature-text ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="action-btn pro-btn"
                  onClick={() => handleSubscription('pro')}
                >
                  {plans.pro.buttonText}
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div className="pricing-card premium-plan">
                <div className="value-badge">
                  ENTERPRISE GRADE
                </div>
                
                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.premium.name}</h3>
                  <div className="price-display mb-2">
                    <span className="price premium-price">{plans.premium.price}</span>
                    <span className="period text-gray-400">/{plans.premium.period}</span>
                  </div>
                  {plans.premium.savings && (
                    <div className="savings-tag">
                      {plans.premium.savings}
                    </div>
                  )}
                  <p className="plan-description text-gray-400">For large teams & organizations</p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.premium.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <div className={`feature-icon premium-feature ${feature.included ? 'included' : 'not-included'}`}>
                        <i className={`fas ${feature.included ? 'fa-check' : 'fa-times'}`}></i>
                      </div>
                      <span className={`feature-text ${feature.included ? 'text-white' : 'text-gray-500'}`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="action-btn premium-btn"
                  onClick={() => handleSubscription('premium')}
                >
                  {plans.premium.buttonText}
                </button>
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
                question: "Do you offer discounts for students or non-profits?",
                answer: "Yes, we offer 50% discount for students and verified non-profit organizations."
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
              <button className="cta-btn secondary">
                Schedule a Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
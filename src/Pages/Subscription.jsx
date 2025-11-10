import React, { useState } from 'react';
import { useUser } from "../Context/UserProvider";

const Subscription = () => {
  const { userProfile, currentUser } = useUser();
  const [selectedPlan, setSelectedPlan] = useState('pro');

  const plans = {
    free: {
      name: 'Free',
      price: '$0',
      period: 'forever',
      popular: false,
      features: [
        '5 asset downloads per month',
        'Basic quality assets',
        'Standard support',
        'Community access',
        'Limited templates'
      ],
      buttonText: 'Current Plan',
      buttonVariant: 'outline'
    },
    pro: {
      name: 'Pro',
      price: '$9.99',
      period: 'month',
      popular: true,
      features: [
        'Unlimited asset downloads',
        'High quality assets',
        'Priority support',
        'Advanced templates',
        'Commercial license',
        'Cancel anytime'
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary'
    },
    premium: {
      name: 'Premium',
      price: '$99.99',
      period: 'year',
      popular: false,
      features: [
        'Unlimited asset downloads',
        'Highest quality assets',
        '24/7 priority support',
        'All premium templates',
        'Commercial license',
        'Early access to new assets',
        'Save 20% yearly',
        'Cancel anytime'
      ],
      buttonText: 'Go Premium',
      buttonVariant: 'primary'
    }
  };

  const handleSubscription = async (plan) => {
    if (plan === 'free') return;
    
    try {
      console.log('Processing subscription for:', plan);
      alert(`Successfully subscribed to ${plans[plan].name} plan!`);
      window.location.href = '/';
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error processing subscription. Please try again.');
    }
  };

  const isCurrentPlan = (plan) => {
    // You can implement logic to check if this is user's current plan
    return plan === 'free'; // Example logic
  };

  return (
    <div className="subscription-page section-padding">
      <div className="container-xxl">
        {/* Header Section */}
        <div className="sec-head text-center mb-80">
          <h6 className="sub-title mb-15">CHOOSE YOUR PLAN</h6>
          <h1 className="fz-60">Flexible Pricing Plans</h1>
          <p className="p-color mt-20 fz-18">
            Start free, upgrade when you need more power and features
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          <div className="row justify-content-center">
            {/* Free Plan */}
            <div className="col-lg-4 col-md-6 mb-30">
              <div className={`pricing-card radius-20 sub-bg bord-thin p-40 position-relative h-100 ${isCurrentPlan('free') ? 'current-plan' : ''}`}>
                {isCurrentPlan('free') && (
                  <div className="current-badge main-colorbg text-u ls1 fz-12">
                    CURRENT PLAN
                  </div>
                )}
                
                <div className="text-center mb-40">
                  <h3 className="mb-15">{plans.free.name}</h3>
                  <div className="price-display">
                    <span className="price fz-60 fw-700">{plans.free.price}</span>
                    <span className="period p-color ml-10">/{plans.free.period}</span>
                  </div>
                  <p className="p-color mt-10 fz-14">Perfect for getting started</p>
                </div>

                <ul className="features-list rest mb-40">
                  {plans.free.features.map((feature, index) => (
                    <li key={index} className="d-flex align-items-center mb-15">
                      <div className="check-icon circle-30 text-center mr-20 bord-thin">
                        <i className="fas fa-check fz-12"></i>
                      </div>
                      <span className="p-color">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`action-btn butn butn-full radius-10 py-20 w-100 ${
                    plans.free.buttonVariant === 'primary' ? 'butn-bg main-colorbg' : 'butn-bord'
                  } ${isCurrentPlan('free') ? 'current' : ''}`}
                  onClick={() => handleSubscription('free')}
                  disabled={isCurrentPlan('free')}
                >
                  <span className="text-u ls2 fz-14">
                    {isCurrentPlan('free') ? 'Current Plan' : plans.free.buttonText}
                  </span>
                </button>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="col-lg-4 col-md-6 mb-30">
              <div className={`pricing-card radius-20 sub-bg2 bord-thin p-40 position-relative h-100 featured ${
                plans.pro.popular ? 'popular' : ''
              }`}>
                {plans.pro.popular && (
                  <div className="popular-badge main-colorbg text-u ls1 fz-12">
                    MOST POPULAR
                  </div>
                )}
                
                <div className="text-center mb-40">
                  <h3 className="mb-15">{plans.pro.name}</h3>
                  <div className="price-display">
                    <span className="price main-color fz-60 fw-700">{plans.pro.price}</span>
                    <span className="period p-color ml-10">/{plans.pro.period}</span>
                  </div>
                  <p className="p-color mt-10 fz-14">Best for professionals</p>
                </div>

                <ul className="features-list rest mb-40">
                  {plans.pro.features.map((feature, index) => (
                    <li key={index} className="d-flex align-items-center mb-15">
                      <div className="check-icon main-colorbg circle-30 text-center mr-20">
                        <i className="fas fa-check fz-12"></i>
                      </div>
                      <span className="p-color">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="action-btn butn butn-full butn-bg main-colorbg radius-10 py-20 subscribe-btn"
                  onClick={() => handleSubscription('pro')}
                >
                  <span className="text-u ls2 fz-14">{plans.pro.buttonText}</span>
                </button>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="col-lg-4 col-md-6 mb-30">
              <div className="pricing-card radius-20 sub-bg bord-thin p-40 position-relative h-100">
                <div className="value-badge main-colorbg2 text-u ls1 fz-12">
                  BEST VALUE
                </div>
                
                <div className="text-center mb-40">
                  <h3 className="mb-15">{plans.premium.name}</h3>
                  <div className="price-display">
                    <span className="price main-color fz-60 fw-700">{plans.premium.price}</span>
                    <span className="period p-color ml-10">/{plans.premium.period}</span>
                  </div>
                  <p className="p-color mt-10 fz-14">Perfect for power users</p>
                  
                  {/* Savings Calculation */}
                  <div className="savings-tag main-color mt-15 fz-12 text-u">
                    Save $19.89 yearly
                  </div>
                </div>

                <ul className="features-list rest mb-40">
                  {plans.premium.features.map((feature, index) => (
                    <li key={index} className="d-flex align-items-center mb-15">
                      <div className="check-icon main-colorbg circle-30 text-center mr-20">
                        <i className="fas fa-check fz-12"></i>
                      </div>
                      <span className="p-color">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className="action-btn butn butn-full butn-bg main-colorbg radius-10 py-20 subscribe-btn"
                  onClick={() => handleSubscription('premium')}
                >
                  <span className="text-u ls2 fz-14">{plans.premium.buttonText}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Comparison Table */}
        <div className="plan-comparison mt-100 pt-80 bord-top-grd">
          <div className="sec-head text-center mb-60">
            <h3 className="fz-40">Plan Comparison</h3>
            <p className="p-color mt-20">See how our plans stack up against each other</p>
          </div>
          
          <div className="comparison-table radius-15 sub-bg bord-thin overflow-hidden">
            <div className="table-header sub-bg2 p-30 bord-thin-bottom">
              <div className="row">
                <div className="col-md-4">
                  <h6 className="mb-0">Features</h6>
                </div>
                <div className="col-md-2 text-center">
                  <h6 className="mb-0 fz-14">Free</h6>
                </div>
                <div className="col-md-3 text-center">
                  <h6 className="mb-0 fz-14 main-color">Pro</h6>
                </div>
                <div className="col-md-3 text-center">
                  <h6 className="mb-0 fz-14 main-color">Premium</h6>
                </div>
              </div>
            </div>
            
            <div className="table-body">
              {[
                { feature: 'Asset Downloads', free: '5/month', pro: 'Unlimited', premium: 'Unlimited' },
                { feature: 'Asset Quality', free: 'Basic', pro: 'High', premium: 'Highest' },
                { feature: 'Commercial License', free: '❌', pro: '✅', premium: '✅' },
                { feature: 'Priority Support', free: '❌', pro: '✅', premium: '24/7' },
                { feature: 'Premium Templates', free: 'Limited', pro: 'Advanced', premium: 'All Access' },
                { feature: 'Early Access', free: '❌', pro: '❌', premium: '✅' },
                { feature: 'Cancel Anytime', free: '✅', pro: '✅', premium: '✅' }
              ].map((row, index) => (
                <div key={index} className="table-row p-25 bord-thin-bottom">
                  <div className="row align-items-center">
                    <div className="col-md-4">
                      <span className="fz-14">{row.feature}</span>
                    </div>
                    <div className="col-md-2 text-center">
                      <span className="fz-14 p-color">{row.free}</span>
                    </div>
                    <div className="col-md-3 text-center">
                      <span className="fz-14 p-color">{row.pro}</span>
                    </div>
                    <div className="col-md-3 text-center">
                      <span className="fz-14 p-color">{row.premium}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section mt-100 pt-80 bord-top-grd">
          <div className="sec-head text-center mb-60">
            <h3 className="fz-40">Why Upgrade?</h3>
            <p className="p-color mt-20">Get more value with our premium plans</p>
          </div>
          
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="benefit-item text-center mb-30">
                <div className="benefit-icon circle-80 main-colorbg2 d-flex align-items-center justify-content-center m-auto mb-25">
                  <i className="fas fa-infinity fz-20"></i>
                </div>
                <h6 className="mb-15">Unlimited Downloads</h6>
                <p className="p-color fz-14">Download as many assets as you need without restrictions</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="benefit-item text-center mb-30">
                <div className="benefit-icon circle-80 main-colorbg2 d-flex align-items-center justify-content-center m-auto mb-25">
                  <i className="fas fa-gem fz-20"></i>
                </div>
                <h6 className="mb-15">Premium Quality</h6>
                <p className="p-color fz-14">Access highest resolution and exclusive premium assets</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="benefit-item text-center mb-30">
                <div className="benefit-icon circle-80 main-colorbg2 d-flex align-items-center justify-content-center m-auto mb-25">
                  <i className="fas fa-briefcase fz-20"></i>
                </div>
                <h6 className="mb-15">Commercial License</h6>
                <p className="p-color fz-14">Use assets in commercial projects for you and your clients</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="faq-section mt-100 pt-80 bord-top-grd">
          <div className="sec-head text-center mb-60">
            <h3 className="fz-40">Frequently Asked Questions</h3>
          </div>
          
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="accordion" id="subscriptionFAQ">
                <div className="accordion-item bord-thin-bottom">
                  <div className="accordion-header">
                    <button className="accordion-button d-flex justify-content-between w-100 p-30 text-left">
                      <span>Can I switch between plans?</span>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="accordion-content p-30 pt-0">
                    <p className="p-color">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
                  </div>
                </div>
                
                <div className="accordion-item bord-thin-bottom">
                  <div className="accordion-header">
                    <button className="accordion-button d-flex justify-content-between w-100 p-30 text-left">
                      <span>What's the difference between Pro and Premium?</span>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="accordion-content p-30 pt-0">
                    <p className="p-color">Premium includes early access to new assets, 24/7 priority support, and offers the best value with yearly savings of 20%.</p>
                  </div>
                </div>
                
                <div className="accordion-item">
                  <div className="accordion-header">
                    <button className="accordion-button d-flex justify-content-between w-100 p-30 text-left">
                      <span>Do you offer team or enterprise plans?</span>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                  <div className="accordion-content p-30 pt-0">
                    <p className="p-color">Yes! Contact our sales team for custom enterprise solutions with additional features and dedicated account management.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="cta-section mt-100 text-center">
          <div className="cta-box radius-20 sub-bg2 bord-thin p-50">
            <h3 className="fz-40 mb-20">Ready to Get Started?</h3>
            <p className="p-color mb-30 fz-18">Join thousands of creators who trust our platform</p>
            <button className="butn butn-md butn-bg main-colorbg radius-30 px-50">
              <span className="text-u ls2">Start Free Trial</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .subscription-page {
          background: linear-gradient(135deg, #0f0f0f 0%, #121212 100%);
        }
        
        .pricing-card {
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
        }
        
        .pricing-card.featured {
          border: 1px solid rgba(82, 176, 180, 0.3) !important;
          transform: scale(1.02);
        }
        
        .pricing-card:hover {
          transform: translateY(-5px);
          border-color: rgba(82, 176, 180, 0.2) !important;
        }
        
        .pricing-card.featured:hover {
          transform: scale(1.02) translateY(-5px);
        }
        
        .pricing-card.current-plan {
          border-color: rgba(82, 176, 180, 0.5) !important;
        }
        
        .popular-badge,
        .current-badge,
        .value-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          padding: 8px 20px;
          border-radius: 20px;
          z-index: 2;
        }
        
        .value-badge {
          background: #2a7c7f !important;
        }
        
        .price-display {
          display: flex;
          align-items: baseline;
          justify-content: center;
        }
        
        .features-list li {
          padding: 8px 0;
        }
        
        .check-icon {
          min-width: 30px;
          flex-shrink: 0;
        }
        
        .savings-tag {
          background: rgba(82, 176, 180, 0.1);
          padding: 5px 15px;
          border-radius: 15px;
          display: inline-block;
        }
        
        .subscribe-btn {
          transition: all 0.4s;
          margin-top: auto;
        }
        
        .subscribe-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(82, 176, 180, 0.3);
        }
        
        .action-btn.current {
          background: rgba(255,255,255,0.1) !important;
          border-color: rgba(255,255,255,0.2) !important;
          cursor: not-allowed;
        }
        
        .comparison-table {
          background: rgba(18, 18, 18, 0.8);
        }
        
        .table-row:hover {
          background: rgba(255,255,255,0.02);
        }
        
        .benefit-icon {
          transition: all 0.4s;
        }
        
        .benefit-item:hover .benefit-icon {
          transform: translateY(-5px) scale(1.1);
        }
        
        .accordion-item {
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        
        .accordion-button {
          background: transparent;
          border: none;
          color: #fff;
          font-weight: 500;
          cursor: pointer;
        }
        
        .accordion-button i {
          transition: transform 0.3s;
        }
        
        .accordion-button.active i {
          transform: rotate(45deg);
        }
        
        .accordion-content {
          display: none;
        }
        
        .accordion-button.active + .accordion-content {
          display: block;
        }
        
        .cta-box {
          background: linear-gradient(135deg, rgba(82, 176, 180, 0.1) 0%, rgba(18, 18, 18, 0.8) 100%);
        }
        
        @media (max-width: 768px) {
          .pricing-card.featured {
            transform: none;
          }
          
          .pricing-card.featured:hover {
            transform: translateY(-5px);
          }
          
          .price-display {
            flex-direction: column;
            align-items: center;
          }
          
          .price {
            font-size: 50px !important;
          }
        }
      `}</style>

      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const accordionButtons = document.querySelectorAll('.accordion-button');
            accordionButtons.forEach(button => {
              button.addEventListener('click', function() {
                this.classList.toggle('active');
              });
            });
          });
        `
      }} />
    </div>
  );
};

export default Subscription;
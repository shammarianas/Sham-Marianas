import React, { useState, useEffect } from "react";
import { useUser } from "../Context/UserProvider";
import { useNavigate } from "react-router-dom";

const Subscription = () => {
  const { userProfile, currentUser } = useUser();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("individual");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [teamMembers, setTeamMembers] = useState(2);
  const [teamPlanPrice, setTeamPlanPrice] = useState(16); // Default for 2 members monthly

  // Calculate team price based on members and billing cycle
  useEffect(() => {
    calculateTeamPrice();
  }, [teamMembers, billingCycle]);

  const calculateTeamPrice = () => {
    let basePricePerMember = billingCycle === "monthly" ? 8 : 96; // $8/month or $96/year per member

    // Calculate total price
    const totalPrice = basePricePerMember * teamMembers;

    // Apply yearly discount if yearly billing
    if (billingCycle === "yearly") {
      // Already accounted for in basePricePerMember
    }

    setTeamPlanPrice(totalPrice);
  };

  const getPriceDisplay = () => {
    if (billingCycle === "monthly") {
      return `$${teamPlanPrice}`;
    } else {
      return `$${teamPlanPrice}`;
    }
  };

  const getPricePerMember = () => {
    const pricePerMember = teamPlanPrice / teamMembers;
    return billingCycle === "monthly"
      ? `$${pricePerMember}/member`
      : `$${pricePerMember}/member`;
  };

  const plans = {
    individual: {
      name: "Individual",
      price: billingCycle === "monthly" ? "$9" : "$108",
      period: billingCycle === "monthly" ? "month" : "year",
      popular: false,
      description: "Start now",
      features: [
        {
          text: "Unlimited downloads of 26+ million premium assets & templates",
          included: true,
        },
        { text: "Full AI stack: video, image, and audio gen", included: true },
        { text: "Lifetime commercial license", included: true },
        { text: "Easy cancellation", included: true },
      ],
      buttonText: "Start now",
      buttonVariant: "primary",
      priceValue: billingCycle === "monthly" ? 9 : 108,
    },
    team: {
      name: "Team",
      price: getPriceDisplay(),
      pricePerMember: getPricePerMember(),
      period: billingCycle === "monthly" ? "month" : "year",
      popular: true,
      features: [
        {
          text: "Everything in Individual, plus:",
          included: true,
          isHeader: true,
        },
        { text: "Teams save up to 34%", included: true },
        { text: "Scale and change members at any time", included: true },
        { text: "One central location for all downloads", included: true },
        { text: "Easy cancellation", included: true },
      ],
      buttonText: "Start now",
      buttonVariant: "primary",
      priceValue: teamPlanPrice,
      showMembersDropdown: true,
      teamMembers: teamMembers,
    },
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      period: "",
      popular: false,
      description:
        "Tailored plans for teams of any size with dedicated account management",
      features: [
        { text: "Everything in Teams, plus:", included: true, isHeader: true },
        { text: "Custom licensing", included: true },
        {
          text: "AI tools available only on the Ultimate Plan",
          included: true,
        },
        { text: "Tailored indemnification", included: true },
        { text: "SSO for more secure, scalable access", included: true },
      ],
      buttonText: "Contact sales",
      buttonVariant: "outline",
      isCustom: true,
    },
  };

  // Team member options with pricing info
  const teamMemberOptions = [
    {
      value: 2,
      label: "2 members",
      price: billingCycle === "monthly" ? "$16" : "$192",
    },
    {
      value: 3,
      label: "3 members",
      price: billingCycle === "monthly" ? "$24" : "$288",
    },
    {
      value: 4,
      label: "4 members",
      price: billingCycle === "monthly" ? "$32" : "$384",
    },
    {
      value: 5,
      label: "5 members",
      price: billingCycle === "monthly" ? "$40" : "$480",
    },
  ];

  const handleSubscription = async (plan) => {
    if (plan === "enterprise") {
      window.open(
        "https://examplements.envelope.com/adjustment-exploring-envelope-plack/pandering-reinvestable-2",
        "_blank"
      );
      return;
    }

    try {
      console.log("Processing subscription for:", plan);

      const subscriptionItem = {
        id: `sub_${plan}_${billingCycle}_${teamMembers}`,
        // ✅ FIXED: صرف "Individual" یا "Team" بھیجیں، "Plan" نہیں
        name: `${plan === "team" ? "Team" : "Individual"} Subscription - ${
          billingCycle === "monthly" ? "Monthly" : "Yearly"
        }`,
        price: plans[plan].priceValue,
        type: "subscription",
        plan: plan, // یہ "individual" یا "team" ہے
        billingCycle: billingCycle,
        teamMembers: plan === "team" ? teamMembers : 1,
        pricePerMember:
          plan === "team"
            ? teamPlanPrice / teamMembers
            : plans[plan].priceValue,
        description:
          plan === "team"
            ? `Team plan for ${teamMembers} members`
            : `Individual plan`,
        // ✅ اضافی field جو webhook کو مدد دے گی
        subscriptionType: plan, // "individual" یا "team"
        isTeamPlan: plan === "team",
      };

      localStorage.setItem(
        "pendingSubscription",
        JSON.stringify(subscriptionItem)
      );

      navigate("/checkout", {
        state: {
          subscriptionItem: subscriptionItem,
          fromSubscription: true,
        },
      });
    } catch (error) {
      console.error("Subscription error:", error);
      alert("Error processing subscription. Please try again.");
    }
  };

  const handleFreeTrial = () => {
    navigate("/checkout", {
      state: {
        freeTrial: true,
        plan: "individual",
      },
    });
  };

  const isCurrentPlan = (plan) => {
    return false;
  };

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly");
  };

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleTeamMembersChange = (e) => {
    const members = parseInt(e.target.value);
    setTeamMembers(members);
  };

  return (
    <div className="subscription-page section-padding">
      <div className="container-xxl">
        {/* Header Section */}
        <div className="sec-head text-center mb-80">
          <h6 className="sub-title text-uppercase tracking-wider text-sm mb-15">
            PRICING PLANS
          </h6>
          <h1 className="text-5xl md-text-6xl font-bold mb-6">
            Choose Your Plan
          </h1>
          <p className="text-gray-400 mt-6 text-lg max-w-2xl mx-auto">
            Access millions of premium assets with our flexible pricing plans
          </p>

          {/* Billing Toggle */}
          <div className="billing-toggle mt-12 flex items-center justify-center space-x-4">
            <span
              className={`text-sm ${
                billingCycle === "monthly" ? "text-white" : "text-gray-400"
              }`}
            >
              Monthly
            </span>
            <button onClick={toggleBillingCycle} className="billing-toggle-btn">
              <div
                className={`billing-toggle-slider ${
                  billingCycle === "monthly" ? "monthly" : "yearly"
                }`}
              />
            </button>
            <span
              className={`text-sm ${
                billingCycle === "yearly" ? "text-white" : "text-gray-400"
              }`}
            >
              Yearly <span className="text-green-400 ml-1">Save up to 34%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          <div className="row justify-center">
            {/* Individual Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div
                className={`pricing-card individual-plan ${
                  isCurrentPlan("individual") ? "current-plan" : ""
                }`}
              >
                {isCurrentPlan("individual") && (
                  <div className="current-badge">CURRENT PLAN</div>
                )}

                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.individual.name}</h3>
                  <div className="price-from">From</div>
                  <div className="price-display mb-2">
                    <span className="price text-white">
                      {plans.individual.price}
                    </span>
                    {plans.individual.period && (
                      <span className="period text-gray-400">
                        /{plans.individual.period}
                      </span>
                    )}
                  </div>
                  <p className="plan-description text-gray-400">
                    {plans.individual.description}
                  </p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.individual.features.map((feature, index) => (
                    <li key={index} className="feature-item">
                      <div
                        className={`feature-icon ${
                          feature.included ? "included" : "not-included"
                        }`}
                      >
                        <i
                          className={`fas ${
                            feature.included ? "fa-check" : "fa-times"
                          }`}
                        ></i>
                      </div>
                      <span
                        className={`feature-text ${
                          feature.included ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`action-btn individual-btn ${
                    isCurrentPlan("individual") ? "current" : ""
                  }`}
                  onClick={() => handleSubscription("individual")}
                  disabled={isCurrentPlan("individual")}
                >
                  {isCurrentPlan("individual")
                    ? "Current Plan"
                    : plans.individual.buttonText}
                </button>
              </div>
            </div>

            {/* Team Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div
                className={`pricing-card team-plan featured ${
                  plans.team.popular ? "popular" : ""
                }`}
              >
                {plans.team.popular && (
                  <div className="popular-badge">MOST POPULAR</div>
                )}

                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.team.name}</h3>
                  <div className="price-from">From</div>
                  <div className="price-display mb-2">
                    <span className="price team-price">{plans.team.price}</span>
                    {plans.team.period && (
                      <span className="period text-gray-400">
                        /{plans.team.period}
                      </span>
                    )}
                  </div>

                  {/* Price per member display */}
                  <div className="price-per-member mb-2">
                    <span className="text-green-400 text-sm font-medium">
                      {plans.team.pricePerMember}
                    </span>
                  </div>

                  {plans.team.showMembersDropdown && (
                    <div className="team-members">
                      <div className="members-select-wrapper">
                        <select
                          value={teamMembers}
                          onChange={handleTeamMembersChange}
                          className="members-dropdown"
                        >
                          {teamMemberOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label} - {option.price}/
                              {billingCycle === "monthly" ? "month" : "year"}
                            </option>
                          ))}
                        </select>
                        <div className="dropdown-arrow">
                          <i className="fas fa-chevron-down"></i>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Savings calculation */}
                  <div className="savings-calculation mt-2">
                    <div className="savings-tag">
                      {teamMembers === 2
                        ? "Save 11%"
                        : teamMembers === 3
                        ? "Save 25%"
                        : teamMembers === 4
                        ? "Save 33%"
                        : teamMembers === 5
                        ? "Save 38%"
                        : ""}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Compared to individual plans
                    </p>
                  </div>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.team.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`feature-item ${
                        feature.isHeader ? "feature-header" : ""
                      }`}
                    >
                      <div
                        className={`feature-icon team-feature ${
                          feature.included ? "included" : "not-included"
                        }`}
                      >
                        <i
                          className={`fas ${
                            feature.included ? "fa-check" : "fa-times"
                          }`}
                        ></i>
                      </div>
                      <span
                        className={`feature-text ${
                          feature.isHeader ? "text-lg font-semibold" : ""
                        } ${feature.included ? "text-white" : "text-gray-500"}`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className="action-btn team-btn"
                  onClick={() => handleSubscription("team")}
                >
                  {plans.team.buttonText}
                </button>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="col-lg-4 col-md-6 mb-8">
              <div className="pricing-card enterprise-plan">
                <div className="value-badge">ENTERPRISE GRADE</div>

                <div className="plan-header text-center mb-8">
                  <h3 className="plan-name mb-4">{plans.enterprise.name}</h3>
                  {plans.enterprise.isCustom ? (
                    <div className="custom-price-display">
                      <span className="custom-price">Custom Pricing</span>
                    </div>
                  ) : (
                    <div className="price-display mb-2">
                      <span className="price enterprise-price">
                        {plans.enterprise.price}
                      </span>
                      {plans.enterprise.period && (
                        <span className="period text-gray-400">
                          /{plans.enterprise.period}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="plan-description text-gray-400 mt-4">
                    {plans.enterprise.description}
                  </p>
                </div>

                <ul className="features-list space-y-4 mb-8">
                  {plans.enterprise.features.map((feature, index) => (
                    <li
                      key={index}
                      className={`feature-item ${
                        feature.isHeader ? "feature-header" : ""
                      }`}
                    >
                      <div
                        className={`feature-icon enterprise-feature ${
                          feature.included ? "included" : "not-included"
                        }`}
                      >
                        <i
                          className={`fas ${
                            feature.included ? "fa-check" : "fa-times"
                          }`}
                        ></i>
                      </div>
                      <span
                        className={`feature-text ${
                          feature.isHeader ? "text-lg font-semibold" : ""
                        } ${feature.included ? "text-white" : "text-gray-500"}`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-center">
                  <a
                    href="https://examplements.envelope.com/adjustment-exploring-envelope-plack/pandering-reinvestable-2"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="learn-more-link"
                  >
                    <i className="fas fa-info-circle mr-2"></i>
                    Learn more
                  </a>
                </div>
                <button
                  className="action-btn enterprise-btn"
                  onClick={() => handleSubscription("enterprise")}
                >
                  {plans.enterprise.buttonText}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Summary Table */}
        <div className="pricing-summary mt-12">
          <div className="summary-card">
            <h4 className="summary-title mb-4">Team Plan Pricing Summary</h4>
            <div className="summary-content">
              <div className="summary-row">
                <div className="summary-label">Billing Cycle:</div>
                <div className="summary-value capitalize">{billingCycle}</div>
              </div>
              <div className="summary-row">
                <div className="summary-label">Team Members:</div>
                <div className="summary-value">{teamMembers} members</div>
              </div>
              <div className="summary-row">
                <div className="summary-label">Price per Member:</div>
                <div className="summary-value text-green-400">
                  {billingCycle === "monthly" ? "$8" : "$96"}/
                  {billingCycle === "monthly" ? "month" : "year"}
                </div>
              </div>
              <div className="summary-row">
                <div className="summary-label">Total Price:</div>
                <div className="summary-value font-bold text-xl">
                  {getPriceDisplay()}/
                  {billingCycle === "monthly" ? "month" : "year"}
                </div>
              </div>
              <div className="summary-row">
                <div className="summary-label">Savings:</div>
                <div className="summary-value text-green-400">
                  {teamMembers === 2
                    ? "11%"
                    : teamMembers === 3
                    ? "25%"
                    : teamMembers === 4
                    ? "33%"
                    : teamMembers === 5
                    ? "38%"
                    : teamMembers >= 6
                    ? "40%"
                    : "up to 34%"}{" "}
                  off individual plans
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="trust-section mt-12">
          <div className="trust-border">
            <p className="trust-text">
              Trusted by 10,000+ designers and developers worldwide
            </p>
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
            <p className="faq-subtitle">
              Everything you need to know about our plans
            </p>
          </div>

          <div className="faq-container">
            {[
              {
                question: "How does team pricing work?",
                answer: `Team plans cost $${
                  billingCycle === "monthly" ? "8" : "96"
                } per member per ${
                  billingCycle === "monthly" ? "month" : "year"
                }. For ${teamMembers} members, the total is ${getPriceDisplay()} per ${
                  billingCycle === "monthly" ? "month" : "year"
                }. You can add or remove members at any time, and we'll adjust the price accordingly.`,
              },
              {
                question: "Can I switch between plans?",
                answer:
                  "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate the charges.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards, PayPal, and bank transfers for enterprise plans.",
              },
              {
                question: "Is there a free trial for paid plans?",
                answer:
                  "Yes, all paid plans come with a 14-day free trial. No credit card required to start.",
              },
            ].map((faq, index) => (
              <div key={index} className="faq-item">
                <button
                  className={`faq-header ${
                    activeAccordion === index ? "active" : ""
                  }`}
                  onClick={() => toggleAccordion(index)}
                >
                  <span className="faq-question">{faq.question}</span>
                  <i
                    className={`fas fa-chevron-down ${
                      activeAccordion === index ? "rotate" : ""
                    }`}
                  ></i>
                </button>
                <div
                  className={`faq-content ${
                    activeAccordion === index ? "active" : ""
                  }`}
                >
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
              Join thousands of creators and teams who trust our platform for
              their design assets
            </p>
            <div className="cta-buttons">
              <button className="cta-btn primary" onClick={handleFreeTrial}>
                Start Free Trial
              </button>
              <button
                className="cta-btn secondary"
                onClick={() => handleSubscription("enterprise")}
              >
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

import React, { useState } from 'react';

const BillingInvoices = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: ''
  });
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const [documents, setDocuments] = useState({
    idCard: null,
    proofOfAddress: null
  });

  const steps = [
    { number: 1, title: 'Agreement' },
    { number: 2, title: 'Documents' },
    { number: 3, title: 'Billing Info' },
    { number: 4, title: 'Payment Method' },
    { number: 5, title: 'Verification' }
  ];

  const handleAgreementChange = (e) => {
    setAgreementAccepted(e.target.checked);
  };

  const handleBillingInfoChange = (e) => {
    setBillingInfo({
      ...billingInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod({
      ...paymentMethod,
      [e.target.name]: e.target.value
    });
  };

  const handleDocumentUpload = (type, file) => {
    setDocuments({
      ...documents,
      [type]: file
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const submitApplication = () => {
    // Handle form submission
    console.log('Submitting application...');
  };

  return (
    <div className="billing-invoices-container">
      <div className="container-xxl">
        {/* Header */}
        <div className="billing-header text-center mb-80">
          <h2 className="fz-50 mb-20">Seller Billing & Payment Setup</h2>
          <p className="p-color">Complete your billing information to start receiving payments</p>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps mb-60">
          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={step.number} className={`step-item ${currentStep >= step.number ? 'active' : ''}`}>
                <div className="step-number">{step.number}</div>
                <div className="step-title">{step.title}</div>
                {index < steps.length - 1 && <div className="step-connector"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="step-content">
          {/* Step 1: Agreement */}
          {currentStep === 1 && (
            <div className="agreement-step">
              <div className="agreement-box">
                <h4 className="mb-30">Seller Agreement</h4>
                <div className="agreement-content">
                  <div className="terms-container">
                    <h5>Terms & Conditions</h5>
                    <div className="terms-text">
                      <p>1. You agree to provide accurate and complete information for billing purposes.</p>
                      <p>2. All documents submitted must be valid and current.</p>
                      <p>3. Payments will be processed within 7-10 business days after order completion.</p>
                      <p>4. A 5% service fee will be applied to all transactions.</p>
                      <p>5. You are responsible for maintaining the security of your payment information.</p>
                      <p>6. The platform reserves the right to verify all submitted documents.</p>
                      <p>7. Any fraudulent activity will result in immediate account suspension.</p>
                    </div>
                  </div>
                  
                  <div className="agreement-checkbox mt-40">
                    <label className="checkbox-container">
                      <input 
                        type="checkbox" 
                        checked={agreementAccepted}
                        onChange={handleAgreementChange}
                      />
                      <span className="checkmark"></span>
                      I have read and agree to the Terms & Conditions and Privacy Policy
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="documents-step">
              <h4 className="mb-40">Upload Required Documents</h4>
              <div className="documents-grid">
                <div className="document-upload">
                  <div className="upload-box">
                    <div className="upload-icon">
                      <i className="fas fa-id-card"></i>
                    </div>
                    <h5>Government ID</h5>
                    <p>Upload a clear photo of your government-issued ID</p>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleDocumentUpload('idCard', e.target.files[0])}
                    />
                    <button className="butn butn-bord mt-20">
                      <span>Choose File</span>
                    </button>
                    {documents.idCard && (
                      <div className="file-info mt-15">
                        <span className="file-name">{documents.idCard.name}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="document-upload">
                  <div className="upload-box">
                    <div className="upload-icon">
                      <i className="fas fa-home"></i>
                    </div>
                    <h5>Proof of Address</h5>
                    <p>Utility bill or bank statement (not older than 3 months)</p>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleDocumentUpload('proofOfAddress', e.target.files[0])}
                    />
                    <button className="butn butn-bord mt-20">
                      <span>Choose File</span>
                    </button>
                    {documents.proofOfAddress && (
                      <div className="file-info mt-15">
                        <span className="file-name">{documents.proofOfAddress.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Billing Information */}
          {currentStep === 3 && (
            <div className="billing-info-step">
              <h4 className="mb-40">Billing Information</h4>
              <div className="billing-form">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={billingInfo.fullName}
                        onChange={handleBillingInfoChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Email Address *</label>
                      <input 
                        type="email" 
                        name="email"
                        value={billingInfo.email}
                        onChange={handleBillingInfoChange}
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={billingInfo.phone}
                        onChange={handleBillingInfoChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>Country *</label>
                      <select name="country" value={billingInfo.country} onChange={handleBillingInfoChange}>
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="UK">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="form-group">
                      <label>Address *</label>
                      <input 
                        type="text" 
                        name="address"
                        value={billingInfo.address}
                        onChange={handleBillingInfoChange}
                        placeholder="Enter your street address"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>City *</label>
                      <input 
                        type="text" 
                        name="city"
                        value={billingInfo.city}
                        onChange={handleBillingInfoChange}
                        placeholder="Enter your city"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label>ZIP/Postal Code *</label>
                      <input 
                        type="text" 
                        name="zipCode"
                        value={billingInfo.zipCode}
                        onChange={handleBillingInfoChange}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment Method */}
          {currentStep === 4 && (
            <div className="payment-method-step">
              <h4 className="mb-40">Payment Method</h4>
              <div className="payment-form">
                <div className="payment-card">
                  <div className="card-preview">
                    <div className="card-front">
                      <div className="card-chip"></div>
                      <div className="card-number">
                        {paymentMethod.cardNumber || '•••• •••• •••• ••••'}
                      </div>
                      <div className="card-details">
                        <div className="card-holder">
                          <span>Card Holder</span>
                          <div>{paymentMethod.cardHolder || 'YOUR NAME'}</div>
                        </div>
                        <div className="card-expiry">
                          <span>Expires</span>
                          <div>{paymentMethod.expiryDate || 'MM/YY'}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card-form mt-40">
                    <div className="row">
                      <div className="col-12">
                        <div className="form-group">
                          <label>Card Number *</label>
                          <input 
                            type="text" 
                            name="cardNumber"
                            value={paymentMethod.cardNumber}
                            onChange={handlePaymentMethodChange}
                            placeholder="1234 5678 9012 3456"
                            maxLength="19"
                          />
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="form-group">
                          <label>Card Holder Name *</label>
                          <input 
                            type="text" 
                            name="cardHolder"
                            value={paymentMethod.cardHolder}
                            onChange={handlePaymentMethodChange}
                            placeholder="Enter name as on card"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Expiry Date *</label>
                          <input 
                            type="text" 
                            name="expiryDate"
                            value={paymentMethod.expiryDate}
                            onChange={handlePaymentMethodChange}
                            placeholder="MM/YY"
                            maxLength="5"
                          />
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>CVV *</label>
                          <input 
                            type="text" 
                            name="cvv"
                            value={paymentMethod.cvv}
                            onChange={handlePaymentMethodChange}
                            placeholder="123"
                            maxLength="3"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Verification */}
          {currentStep === 5 && (
            <div className="verification-step text-center">
              <div className="verification-icon mb-30">
                <i className="fas fa-shield-check"></i>
              </div>
              <h4 className="mb-20">Verification in Progress</h4>
              <p className="p-color mb-40">
                Your information is being verified. This process usually takes 24-48 hours. 
                You will receive an email notification once your account is approved.
              </p>
              
              <div className="status-timeline">
                <div className="status-item active">
                  <div className="status-dot"></div>
                  <span>Application Submitted</span>
                </div>
                <div className="status-item">
                  <div className="status-dot"></div>
                  <span>Document Review</span>
                </div>
                <div className="status-item">
                  <div className="status-dot"></div>
                  <span>Payment Setup</span>
                </div>
                <div className="status-item">
                  <div className="status-dot"></div>
                  <span>Account Activated</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="step-navigation mt-60">
          <div className="row">
            <div className="col-md-6">
              {currentStep > 1 && (
                <button className="butn butn-bord" onClick={prevStep}>
                  <span>Previous</span>
                </button>
              )}
            </div>
            <div className="col-md-6 text-end">
              {currentStep < steps.length ? (
                <button 
                  className="butn butn-bg" 
                  onClick={nextStep}
                  disabled={
                    (currentStep === 1 && !agreementAccepted) ||
                    (currentStep === 2 && (!documents.idCard || !documents.proofOfAddress))
                  }
                >
                  <span>Next Step</span>
                </button>
              ) : (
                <button className="butn butn-bg" onClick={submitApplication}>
                  <span>Submit Application</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingInvoices;
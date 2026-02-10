import React from "react";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";

const PricingAndFees = () => {
    return (
       <>
       <SEO {...SEO_CONFIG.pricesFees} />
        <div className="section-padding">
            <div className="container mx-size">
                <h1 className="text-4xl fw-500 mb-8 text-center">Prices and Fees</h1>

                <h3 className="mt-5 fz-30 fw-400 mb-2 letter-spacing-1">
                    <strong>Commission Structure</strong>
                </h3>
                <p className="fotter-police-p p-color mb-2">
                    For all assets licensed through the <span className="text-bold underline main-color">Sham Marianas F.Z.C</span> platform, the net revenue (total license fee collected from the customer, minus any transaction fees, taxes, or third-party charges) will be split as follows:
                </p>
                <ul className="fotter-police-p p-color mb-2 list-disc p-0">
                    <li className="relative pl-6 p-color mb-2"><strong>Contributor Earnings:</strong> 60% of the net revenue.</li>
                    <li className="relative pl-6 p-color mb-2"><strong>Platform Fee:</strong> 40% of the net revenue.</li>
                </ul>
                <p className="fotter-police-p p-color mb-8">
                    This commission structure is standard for all contributors and applies to all license types and sales channels unless otherwise stated in a separate, written exclusive agreement with <span className="text-bold underline main-color">Sham Marianas F.Z.C</span>.
                </p>

                <h3 className="mt-5 fz-30 fw-400 mb-2 letter-spacing-1">
                    <strong>Payment Terms & Withdrawal Threshold</strong>
                </h3>
                <h4 className="mt-5 fz-30 fw-300 mb-2 letter-spacing-1"><strong>Earnings Accrual</strong></h4>
                <p className="fotter-police-p p-color mb-4">
                    Your accrued earnings (your 60% share) will be tracked in your Contributor Dashboard in real-time.
                </p>

                <h4 className="mt-5 fz-30 fw-300 mb-2 letter-spacing-1"><strong>Withdrawal Threshold</strong></h4>
                <p className="fotter-police-p p-color mb-4">
                    A minimum balance of <strong>USD $50.00</strong> in accrued earnings is required to request a payout. Earnings below this threshold will roll over to the following payment cycle.
                </p>

                <h4 className="mt-5 fz-30 fw-300 mb-2 letter-spacing-1"><strong>Payout Schedule</strong></h4>
                <p className="fotter-police-p p-color mb-4">
                    Payments are processed once per month. All eligible earnings that meet or exceed the $50 threshold by the last day of the calendar month will be included in the payout processed in the following month.
                </p>

                <h4 className="mt-5 fz-30 fw-300 mb-2 letter-spacing-1"><strong>Payment Methods</strong></h4>
                <p className="fotter-police-p p-color mb-8">
                    Payouts are executed via electronic transfer to your pre-selected method (e.g., Stripe, Skill, PayPal). You are responsible for ensuring your payment information is accurate and up-to-date in your dashboard.
                </p>

                <h3 className="mt-5 fz-30 fw-400 mb-2 letter-spacing-1">
                    <strong>Pricing & Licensing</strong>
                </h3>
                <p className="fotter-police-p p-color mb-8">
                    <span className="text-bold underline main-color">Sham Marianas F.Z.C</span>, retains sole discretion to set the final retail price for all assets on the platform. We employ dynamic pricing strategies based on market demand, license type, file size, and other factors to maximize sales potential for your portfolio.
                </p>

                <h3 className="mt-5 fz-30 fw-400 mb-2 letter-spacing-1">
                    <strong>Fees & Deductions</strong>
                </h3>
                <h4 className="mt-5 fz-30 fw-300 mb-2 letter-spacing-1"><strong>Transaction Fees</strong></h4>
                <p className="fotter-police-p p-color mb-4">
                    Any fees levied by payment gateways (for customer purchases) or payout processors (for your withdrawals) are not deducted from your 60% share. These are accounted for within the platform's 40% share or charged separately.
                </p>

                <h4 className="mt-5 fz-30 fw-300 mb-2 letter-spacing-1"><strong>Taxes</strong></h4>
                <p className="fotter-police-p p-color mb-8">
                    You are solely responsible for declaring and paying any personal income, value-added (VAT), or other taxes applicable to your earnings in your country of residence. <span className="text-bold underline main-color">Sham Marianas F.Z.C</span>, may be required to collect tax identification information or withhold taxes as mandated by law.
                </p>

                <h3 className="mt-5 fz-30 fw-400 mb-2 letter-spacing-1">
                    <strong>Reporting & Transparency</strong>
                </h3>
                <p className="fotter-police-p p-color mb-8">
                    A detailed, itemized sales report will be available in your Contributor Dashboard. This report will show each asset sold, the license type, the net revenue generated, your 60% commission, and the date of sale.
                </p>

                <h3 className="mt-5 fz-30 fw-400 mb-2 letter-spacing-1">
                    <strong>Policy Updates</strong>
                </h3>
                <p className="fotter-police-p p-color mb-8">
                    <span className="text-bold underline main-color">Sham Marianas F.Z.C</span>, reserves the right to modify this Pricing and Withdrawal Policy, including commission rates and the payout threshold, with 30 days' prior notice to contributors via email and platform announcements. Continued use of the platform after changes take effect constitutes your acceptance of the new terms.
                </p>
            </div>
        </div>
       </>
    );
};

export default PricingAndFees;
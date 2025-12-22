import React from "react";
import SEO from "../../common/SEO";
import { SEO_CONFIG } from "../../utils/seoConfig";
function openAccordion(event) {
    document.querySelectorAll(".accordion-info").forEach((element) => {
        element.classList.remove("active");
        element.style.maxHeight = 0;
        element.parentElement.classList.remove("active");
    });
    event.currentTarget.parentElement.classList.add("active");
    event.currentTarget.nextElementSibling.style.maxHeight = "300px";
    event.currentTarget.nextElementSibling.classList.add("active");
}
const SellerGuideline = () => {
    return (
        <>
        <SEO {...SEO_CONFIG.sellerGuidlines} />
            <div className="section-padding">
                <div className="container mx-size">
                    <h1 className="text-4xl fw-500 mb-8 text-center">Seller Guidelines</h1>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Welcome to <span className="text-400 underline main-color">Sham Marianas</span></strong>
                    </h3>

                    <p className="fotter-police-p p-color mb-8">
                        Congratulations on joining <span className="text-bold underline main-color">Sham Marianas</span>, as a valued contributor. This comprehensive guide outlines our platform standards, submission processes, and best practices to ensure your success. Please read these guidelines thoroughly before submitting any assets.
                    </p>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Account Access & Login Procedures</strong>
                    </h3>

                    <h4 className="fz-24 fw-400 mb-2">New Contributor Registration</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0">
                        <li className="mb-2">Visit <a className="text-decoration-underline main-color" href="#">www.shammarianas/templates.com</a></li>
                        <li className="mb-2">Click the Login button</li>
                        <li className="mb-2">Complete the registration form with accurate details</li>
                        <li className="mb-2">Verify your email address through the confirmation link</li>
                        <li className="mb-2">Set up your secure password and profile information</li>
                        <li className="mb-2">Waiting for <span className="text-bold underline main-color">Sham Marianas</span>, approval</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">Existing Contributor Login</h4>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0">
                        <li className="mb-2">Navigate to <a className="text-decoration-underline main-color" href="#">www.shammarianas.com/login</a></li>
                        <li className="mb-2">Enter your registered email address and password</li>
                        <li className="mb-2">Access your personalized Contributor Dashboard</li>
                        <li className="mb-2">For password reset, use the "Forgot Password" feature</li>
                    </ul>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Asset Submission Standards</strong>
                    </h3>

                    <h4 className="fz-24 fw-400 mb-2">Approval Criteria</h4>
                    <p className="fotter-police-p p-color mb-3">
                        Assets meeting the following standards will be approved:
                    </p>

                    <h5 className="fz-20 fw-400 mb-2">A. Technical Specifications:</h5>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Thumbnail size: 705x472px, 300 DPI, RGB color mode</li>
                        <li className="mb-2">Upload file: file size maximum 10 mb</li>
                    </ul>

                    <h5 className="fz-20 fw-400 mb-2">B. Content Quality Requirements:</h5>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Original content created by you</li>
                        <li className="mb-2">Professional composition and framing</li>
                        <li className="mb-2">Proper lighting and exposure</li>
                        <li className="mb-2">Sharp focus with no visible noise or artifacts</li>
                        <li className="mb-2">Commercial viability and market relevance</li>
                    </ul>

                    <h5 className="fz-20 fw-400 mb-2">C. Metadata Requirements:</h5>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Titles (15 words maximum)</li>
                        <li className="mb-2">Comprehensive descriptions (50-200 words)</li>
                        <li className="mb-2">Relevant keywords (5-15 per asset)</li>
                        <li className="mb-2">Accurate categorization</li>
                        <li className="mb-2">Proper tagging for search optimization</li>
                    </ul>

                    <h5 className="fz-20 fw-400 mb-2">D. Legal Compliance:</h5>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0 ">
                        <li className="mb-2">All necessary model/property releases</li>
                        <li className="mb-2">No trademarked or copyrighted material</li>
                        <li className="mb-2">Appropriate content for a general audience</li>
                        <li className="mb-2">Accurate representation of subject matter</li>
                    </ul>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Common Reasons for Rejection</strong>
                    </h3>

                    <h4 className="fz-24 fw-400 mb-2">1. Quality Issues</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Poor technical execution (blurry, pixelated, or distorted media)</li>
                        <li className="mb-2">Inadequate lighting or improper exposure</li>
                        <li className="mb-2">Unprofessional composition or framing</li>
                        <li className="mb-2">Visible artifacts, noise, or compression issues</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">2. Content Problems</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Lack of commercial appeal or market relevance</li>
                        <li className="mb-2">Inappropriate or sensitive content without proper disclosure</li>
                        <li className="mb-2">Misleading or inaccurate representations</li>
                        <li className="mb-2">Overly generic or commonplace subjects</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">3. Legal & Copyright Violations</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Unauthorized use of copyrighted material</li>
                        <li className="mb-2">Missing model/property releases for recognizable elements</li>
                        <li className="mb-2">Trademark infringement</li>
                        <li className="mb-2">Privacy violations or unauthorized surveillance content</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">4. Technical Non-Compliance</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Incorrect file formats or sizes</li>
                        <li className="mb-2">Corrupted or incomplete files</li>
                        <li className="mb-2">Watermarked or branded content</li>
                        <li className="mb-2">Improper metadata or incomplete information</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">5. Policy Violations</h4>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0 ">
                        <li className="mb-2">Spam or duplicate submissions</li>
                        <li className="mb-2">Attempts to manipulate search rankings</li>
                        <li className="mb-2">Violation of community standards</li>
                        <li className="mb-2">Previously rejected content resubmitted without improvements</li>
                    </ul>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Review Process & Timeline</strong>
                    </h3>

                    <h4 className="fz-24 fw-400 mb-2">Submission Workflow:</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2"><strong>Initial Upload:</strong> Asset enters review queue</li>
                        <li className="mb-2"><strong>Technical Review:</strong> 24-48 hours for format verification</li>
                        <li className="mb-2"><strong>Quality Assessment:</strong> 3-5 business days for content evaluation</li>
                        <li className="mb-2"><strong>Final Decision:</strong> Notification via email and dashboard update</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">Status Definitions:</h4>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0 ">
                        <li className="mb-2"><strong>Approved:</strong> Asset published to the marketplace, available for licensing</li>
                        <li className="mb-2"><strong>Rejected:</strong> Detailed feedback provided with improvement suggestions</li>
                        <li className="mb-2"><strong>Pending:</strong> Additional information or clarification required</li>
                    </ul>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Best Practices for Success</strong>
                    </h3>

                    <h4 className="fz-24 fw-400 mb-2">1. Profile Development</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Focus on your areas of expertise</li>
                        <li className="mb-2">Develop a consistent style and aesthetic</li>
                        <li className="mb-2">Balance evergreen content with trending topics</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">2. Quality Optimization</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Invest in proper equipment and software</li>
                        <li className="mb-2">Master editing and post-production techniques</li>
                        <li className="mb-2">Stay current with technical standards</li>
                        <li className="mb-2">Regularly review and update older content</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">3. Strategic Submission</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Research market trends and demands</li>
                        <li className="mb-2">Analyze successful contributors in your niche</li>
                        <li className="mb-2">Submit during optimal times (avoid holiday periods)</li>
                        <li className="mb-2">Maintain a consistent upload schedule</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">4. Community Engagement</h4>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0 ">
                        <li className="mb-2">Participate in contributor forums</li>
                        <li className="mb-2">Respond promptly to reviewer feedback</li>
                        <li className="mb-2">Collaborate with other contributors</li>
                        <li className="mb-2">Stay informed about platform updates</li>
                    </ul>


                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Support & Resources</strong>
                    </h3>

                    <h4 className="fz-24 fw-400 mb-2">Contact Information:</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2"><strong>Contributor Support:</strong> <a className="text-decoration-underline main-color" href="mailto:info@shammarianas.com">info@shammarianas.com</a></li>
                        <li className="mb-2"><strong>Technical Issues:</strong> <a className="text-decoration-underline main-color" href="mailto:support@shammarianas.com">support@shammarianas.com</a></li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">Response Times:</h4>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0 ">
                        <li className="mb-2"><strong>General inquiries:</strong> 24-48 business hours</li>
                        <li className="mb-2"><strong>Technical support:</strong> 48-72 business hours</li>
                        <li className="mb-2"><strong>Urgent matters:</strong> Mark as "URGENT" in the subject line</li>
                    </ul>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Performance Optimization</strong>
                    </h3>

                    <h4 className="fz-24 fw-400 mb-2">30-Day Success Roadmap:</h4>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2"><strong>Week 1-2:</strong> Focus on quality over quantity; submit 5-10 exceptional assets</li>
                        <li className="mb-2"><strong>Week 3-4:</strong> Analyze performance metrics; refine your approach</li>
                        <li className="mb-2"><strong>Month 2:</strong> Expand portfolio based on successful patterns</li>
                        <li className="mb-2"><strong>Ongoing:</strong> Regular portfolio review and content refresh</li>
                    </ul>

                    <h4 className="fz-24 fw-400 mb-2">Key Performance Indicators:</h4>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0 ">
                        <li className="mb-2">Approval rate (target: 85%+)</li>
                        <li className="mb-2">Download-to-submission ratio</li>
                        <li className="mb-2">Portfolio growth consistency</li>
                    </ul>

                    <h3 className="mt-5 fz-30 fw-400 mb-2">
                        <strong>Policy Compliance & Updates</strong>
                    </h3>

                    <p className="fotter-police-p p-color mb-2">
                        <strong><span className="text-bold underline main-color">Sham Marianas</span>, reserves the right to:</strong>
                    </p>
                    <ul className="fotter-police-p p-color mb-4 list-disc p-0 ">
                        <li className="mb-2">Update these guidelines without prior notice</li>
                        <li className="mb-2">Adjust review standards based on market demands</li>
                        <li className="mb-2">Modify commission structures with a 30-day notice</li>
                        <li className="mb-2">Terminate accounts violating platform policies</li>
                    </ul>

                    <p className="fotter-police-p p-color mb-2">
                        <strong>Contributors are responsible for:</strong>
                    </p>
                    <ul className="fotter-police-p p-color mb-8 list-disc p-0 ">
                        <li className="mb-2">Regularly reviewing updated guidelines</li>
                        <li className="mb-2">Maintaining accurate account information</li>
                        <li className="mb-2">Complying with all applicable laws and regulations</li>
                        <li className="mb-2">Securing their login credentials</li>
                    </ul>


                    <h3 className="mt-8 fz-30 fw-400 main-color mb-6">
                        <strong>Frequently Asked Questions</strong>
                    </h3>
                    <div className="accordion bord">
                        <div
                            className="item active wow fadeInUp"
                            data-wow-delay=".1s"
                        >
                            <div onClick={openAccordion} className="title">
                                <h6>Q1: What is the typical review timeframe?</h6>
                                <span className="ico ti-plus"></span>
                            </div>
                            <div className="accordion-info">
                                <p className="">
                                    Most assets are reviewed within 2-7 business days. During peak periods, reviews may take up to 10 business days.
                                </p>
                            </div>
                        </div>

                        <div className="item wow fadeInUp" data-wow-delay=".3s">
                            <div onClick={openAccordion} className="title">
                                <h6>Q2: Can I appeal a rejection decision?</h6>
                                <span className="ico ti-plus"></span>
                            </div>
                            <div className="accordion-info">
                                <p className="">
                                    Yes, you may request reconsideration through the contributor portal if you believe the decision was incorrect or have made substantial improvements.
                                </p>
                            </div>
                        </div>

                        <div className="item wow fadeInUp" data-wow-delay=".5s">
                            <div onClick={openAccordion} className="title">
                                <h6>Q3: What commission structure does <span className="main-color">Sham Marianas</span> offer?</h6>
                                <span className="ico ti-plus"></span>
                            </div>
                            <div className="accordion-info">
                                <p className="">
                                    Commission rates range from 40% to 60% based on contributor tier, content exclusivity, and sales performance. Detailed rates are available in your dashboard.
                                </p>
                            </div>
                        </div>
                        <div className="item wow fadeInUp" data-wow-delay=".5s">
                            <div onClick={openAccordion} className="title">
                                <h6>
                                    Q5: When are payments processed?
                                </h6>
                                <span className="ico ti-plus"></span>
                            </div>
                            <div className="accordion-info">
                                <p className="">
                                    Payments are issued monthly for earnings exceeding $50. Payments are processed via Stripe or Skill, based on your preference.
                                </p>
                            </div>
                        </div>

                        <div className="item wow fadeInUp" data-wow-delay=".5s">
                            <div onClick={openAccordion} className="title">
                                <h6>Q6: Can I submit similar variations of the same asset?</h6>
                                <span className="ico ti-plus"></span>
                            </div>
                            <div className="accordion-info">
                                <p className="">
                                    Minor variations are acceptable if each provides a distinct value. Blatant duplicates will be rejected.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
};

export default SellerGuideline;
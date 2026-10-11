import "./faq.css";

const faqs = [
  { question: "What does Sham Marianas FZC do?", answer: "Sham Marianas FZC is a Dubai-based B2B digital marketing and creative agency. We combine digital strategy, SEO, social media marketing, paid advertising, content, brand building, web development, and IT solutions to help businesses attract qualified leads and grow." },
  { question: "Which businesses and industries do you help in Dubai and the UAE?", answer: "We work with B2B companies, service businesses, startups, and established brands in Dubai, across the UAE, and internationally. We learn your industry, audience, and sales cycle before recommending the right marketing channels." },
  { question: "How can B2B digital marketing generate better leads?", answer: "We connect your offer with the people most likely to buy through clear positioning, search-friendly content, targeted campaigns, conversion-focused landing pages, and ongoing performance optimisation. The goal is qualified enquiries, not just more traffic." },
  { question: "What services can Sham Marianas recommend for my business?", answer: "Depending on your goals, we may recommend SEO and content marketing, Google or social media advertising, LinkedIn and B2B campaigns, branding, website and UI/UX design, web development, AI automation, or other IT solutions. Every recommendation is based on your audience, budget, and growth targets." },
  { question: "How soon can I expect marketing results?", answer: "Paid campaigns can create early data and enquiries, while SEO, content, and brand building compound over time. We agree practical milestones at the start, track progress monthly, and improve the strategy as we learn what converts." },
  { question: "How much does a digital marketing project cost?", answer: "Pricing depends on the scope, channels, creative requirements, and business goals. We first understand your priorities, then provide a focused proposal with clear deliverables and a plan that can scale as results grow." },
  { question: "How can I start working with Sham Marianas FZC?", answer: "Complete the enquiry form or contact our Dubai team. Tell us about your business, target audience, and goals, and we will suggest the most useful next step for your marketing or IT project." }
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer }
  }))
};

function FAQ() {
  return (
    <section className="faq-section section-padding" aria-labelledby="faq-title">
      <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      <div className="container">
        <div className="faq-heading">
          <h2 id="faq-title">Frequently Asked Questions</h2>
          <p>Clear answers about B2B digital marketing, IT solutions, and business growth in Dubai and the UAE.</p>
        </div>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <details className="faq-item" key={item.question}>
              <summary>
                <span className="faq-number">0{index + 1}</span>
                <span className="faq-question">{item.question}</span>
                <span className="faq-toggle" aria-hidden="true">+</span>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FAQ;
FAQ.jsx

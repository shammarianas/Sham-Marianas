import "./faq.css";

const faqs = [
  { question: "What services does Sham Marianas FZC offer?", answer: "We provide B2B digital marketing, IT solutions, brand building, paid advertising, SEO, social media, content, and lead-generation strategies." },
  { question: "How can digital marketing help my business grow?", answer: "Our strategy connects your brand with the right audience, builds trust, and turns qualified attention into measurable enquiries and sales." },
  { question: "Do you work with B2B businesses in Dubai and the UAE?", answer: "Yes. We understand the Dubai and UAE market and tailor campaigns for local, regional, and international B2B growth." },
  { question: "How long does it take to see results?", answer: "Timelines depend on your goals and channel mix. We establish quick wins first while building sustainable results over the following months." },
  { question: "Can you build a strategy around my budget and goals?", answer: "Absolutely. We start with your objectives, audience, and budget, then recommend a focused plan that can scale with your business." },
  { question: "Do you provide reporting and performance tracking?", answer: "Yes. You receive clear performance updates, useful insights, and recommendations tied to the outcomes that matter to your business." },
  { question: "How do we get started?", answer: "Send us a message through the contact page and we will arrange a focused conversation about your business and next steps." }
];

function FAQ() {
  return (
    <section className="faq-section section-padding" aria-labelledby="faq-title">
      <div className="container">
        <div className="faq-heading">
          <span className="faq-kicker">[ FAQ ]</span>
          <h2 id="faq-title">Frequently Asked Questions</h2>
          <p>Everything you need to know about working with Sham Marianas.</p>
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

import "../landing/faq.css";
import { servicesFaqs } from "../../data/servicesFaqs";

function ServicesFAQ() {
  return (
    <section className="faq-section section-padding" aria-labelledby="services-faq-title">
      <div className="container">
        <div className="faq-heading">
          <span className="faq-kicker">FAQs</span>
          <h2 id="services-faq-title">Frequently Asked Questions</h2>
          <p>Useful answers about choosing and working with Sham Marianas.</p>
        </div>
        <div className="faq-list">
          {servicesFaqs.map((item, index) => (
            <details className="faq-item" key={item.question} open={index === 0}>
              <summary>
                <span className="faq-number">{String(index + 1).padStart(2, "0")}</span>
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

export default ServicesFAQ;


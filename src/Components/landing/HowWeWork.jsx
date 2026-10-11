import "react";
import "./how-we-work.css";

const steps = [
  { number: "01", title: "Research of the Dubai Advertising Market", text: "Before we start any campaign, we do our homework on the Dubai market. We check which platforms people actually use and which trends are picking up. We were also one of the first agencies to try TikTok for our clients’ ads. Over time, we’ve learned how locals and visitors in the UAE browse and shop online, and we use that to make ads that fit your audience.", image: "/assets/imgs/how-we-work.gif", alt: "Animated creative planning visual" },
  { number: "02", title: "Clear Goals and Numbers You Can Track", text: "We don’t like guessing, so every project starts with a simple talk about what you want. More website visitors, more leads, or more online sales, we note it down. Then we pick a number for each goal and keep an eye on it all the way through. After 10+ years in digital marketing, we know what a good result looks like, and we show it to you in real figures, not vague promises.", image: "/assets/imgs/how-we-work-02.gif", alt: "Campaign performance analytics on a laptop" },
  { number: "03", title: "A Content Plan Made Just for You", text: "Good content does two jobs: it promotes your business and shapes how people see your brand. We write for real people, so the tone feels close and friendly without ever losing respect for local traditions. Your content should do more than share useful information. It should feel like a trusted friend who happens to know your business well.", image: "/assets/imgs/how-we-work-04.png", alt: "Social media content and campaign planning" },
  { number: "04", title: "Getting You Found on Google with SEO and SEM", text: "Search results are crowded, and we want your business to stand out in them. We fix your website content around the words people really type into Google, so you get free leads without paying for every click. On top of that, we run Google Ads to bring in buyers through quality PPC campaigns. That way you get visitors from both organic search and paid ads.", image: "/assets/imgs/how-we-work-03.gif", alt: "Google search results and local visibility" },
  { number: "05", title: "Social Media That Gets People Talking", text: "Your customers are already on social media, chatting, asking questions, and deciding which brands to trust. We keep your brand active on the platforms that are popular in Dubai right now. We post with a clear message and a proper plan behind it, so people don’t just follow you, they start to feel part of your brand’s community.", image: "/assets/imgs/how-we-work-05.png", alt: "Social media performance analytics" },
];

function HowWeWork() {
  return (
    <section className="how-we-work section-padding">
      <div className="container">
        <div className="how-we-work-head">
          <div>
            <span className="sub-title main-color mb-5">How we work</span>
            <h3 className="fw-600 fz-50 text-u">Our digital <span className="fw-200">marketing process</span></h3>
          </div>
          <p className="how-we-work-intro">A clear, collaborative process that turns ambitious ideas into measurable business growth.</p>
        </div>
        <div className="how-we-work-list">
          {steps.map((step, index) => (
            <article className={`how-we-work-card ${index % 2 ? "is-reverse" : ""}`} key={step.number}>
              <div className="how-we-work-media">
                <img loading="lazy" src={step.image} alt={step.alt} />
                <span className="how-we-work-number">{step.number}</span>
              </div>
              <div className="how-we-work-copy">
                <h4 className={step.number === "02" || step.number === "04" ? "how-we-work-title-compact" : ""}>{step.title}</h4>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowWeWork;

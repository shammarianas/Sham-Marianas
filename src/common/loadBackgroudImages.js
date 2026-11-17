export default function loadBackgroudImages() {
  const backgroudImages = Array.from(
    document.querySelectorAll("[data-background]")
  ).filter((element) => element.dataset.bgLoaded !== element.dataset.background);

  const loadBackground = (element) => {
    const image = element.dataset.background;
    if (!image) return;

    element.style.backgroundImage = `url('${image}')`;
    element.dataset.bgLoaded = image;
  };

  if (backgroudImages.length > 0) {
    if (!("IntersectionObserver" in window)) {
      backgroudImages.forEach(loadBackground);
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadBackground(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "200px 0px" }
    );

    backgroudImages.forEach((element) => observer.observe(element));
  }
}

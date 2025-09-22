const scrollToTop = () => {
  const offset = 150;
  const progressWrap = document.querySelector('.progress-wrap');
  const progressPath = progressWrap ? progressWrap.querySelector('path') : null;
  if (!progressWrap || !progressPath) return;

  const pathLength = progressPath.getTotalLength();
  const updateProgress = () => {
    const scroll = window.scrollY;
    const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = pathLength - (scroll * pathLength) / height;
    progressPath.style.strokeDashoffset = progress;
  };

  progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
  progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
  progressPath.style.strokeDashoffset = pathLength;
  progressPath.getBoundingClientRect();
  progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';

  const onScroll = () => {
    updateProgress();
    if (window.pageYOffset > offset) {
      progressWrap.classList.add('active-progress');
    } else {
      progressWrap.classList.remove('active-progress');
    }
  };

  updateProgress();
  window.addEventListener('scroll', onScroll);
  progressWrap.addEventListener('click', function (event) {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  });
};

export default scrollToTop;

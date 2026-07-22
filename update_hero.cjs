const fs = require('fs');

let content = fs.readFileSync('assets/js/main.js', 'utf8');

const oldHeroUpdate = /function updateHeroSlide\(index\) \{[\s\S]*?\}\n\n  window\.nextHero/;

const newHeroUpdate = `function updateHeroSlide(index) {
    appState.heroIndex = (index + slides.length) % slides.length;
    const current = slides[appState.heroIndex];

    const contentArea = document.querySelector(".lg\\\\:col-span-6.space-y-6");

    if (heroImg) {
      heroImg.style.opacity = "0";
      heroImg.style.transform = "scale(0.98)";
    }
    if (contentArea) {
      contentArea.style.opacity = "0";
      contentArea.style.transform = "translateY(10px)";
      contentArea.style.transition = "all 0.5s ease";
    }

    setTimeout(() => {
      if (heroImg) {
        heroImg.src = current.image;
        heroImg.style.opacity = "1";
        heroImg.style.transform = "scale(1)";
        heroImg.style.transition = "all 1s cubic-bezier(0.16, 1, 0.3, 1)";
      }
      if (heroBadge) heroBadge.innerText = current.badge;
      if (heroTitle1) heroTitle1.innerText = current.title1;
      if (heroTitle2) heroTitle2.innerText = current.title2;
      if (heroDesc) heroDesc.innerText = current.desc;
      
      if (contentArea) {
        contentArea.style.opacity = "1";
        contentArea.style.transform = "translateY(0)";
      }

      // Dots
      for (let i = 0; i < slides.length; i++) {
        const dot = document.getElementById(\`heroDot\${i}\`);
        if (dot) {
          if (i === appState.heroIndex) {
            dot.className = "w-8 h-1 bg-brand-gold rounded-full transition-all duration-500";
          } else {
            dot.className = "w-2 h-1 bg-[#1a1a1a] hover:bg-[#333333] rounded-full transition-all duration-500";
          }
        }
      }
    }, 400); // Wait for fade out
  }

  window.nextHero`;

content = content.replace(oldHeroUpdate, newHeroUpdate);

fs.writeFileSync('assets/js/main.js', content);
console.log('Updated updateHeroSlide in main.js');

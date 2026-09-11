const vContainer = document.querySelector('.vertical-slider-container');
const vBackgroundImg = document.querySelector('.v-image-background img');
const vForegroundImgContainer = document.querySelector('.v-image-foreground');
const vForegroundImg = document.querySelector('.v-image-foreground img');
const vHandle = document.querySelector('.v-slider-handle');

let vIsDragging = false;
let currentPercentage = 100; // Začne se na 100% (spuščena roleta)

function initDimensions() {
  // Izmerimo dejansko velikost spodnje slike, ki se je naložila in prilagodila brskalniku
  const bgRect = vBackgroundImg.getBoundingClientRect();
  
  // Prisilno nastavimo širino celotnega okvirja, da se ujema s sliko
  vContainer.style.width = `${bgRect.width}px`;
  
  // Ponovno izmerimo celoten vsebnik za točne piksle
  const rect = vContainer.getBoundingClientRect();
  
  // Zaklenemo točne piksle zgornji sliki, da se ne premika pod zaveso
  vForegroundImg.style.width = `${rect.width}px`;
  vForegroundImg.style.height = `${rect.height}px`;
  
  // Ohranimo trenuten položaj ročice
  vForegroundImgContainer.style.height = `${currentPercentage}%`;
  vHandle.style.top = `${currentPercentage}%`;
}

// Sprožimo takoj, ko se slike in okno naložijo
window.addEventListener('load', initDimensions);
window.addEventListener('resize', initDimensions);

// Varnostni sprožilec, če so slike že naložene iz predpomnilnika
if (vBackgroundImg.complete) {
  // Počakamo drobec sekunde, da brskalnik izriše elemente
  setTimeout(initDimensions, 50);
} else {
  vBackgroundImg.addEventListener('load', initDimensions);
}

function moveVertical(y) {
  const rect = vContainer.getBoundingClientRect();
  
  let positionY = y - rect.top;
  if (positionY < 0) positionY = 0;
  if (positionY > rect.height) positionY = rect.height;
  
  currentPercentage = (positionY / rect.height) * 100;
  
  vForegroundImgContainer.style.height = `${currentPercentage}%`;
  vHandle.style.top = `${currentPercentage}%`;
}

// Dogodki za MIŠKO
vHandle.addEventListener('mousedown', () => { vIsDragging = true; });
window.addEventListener('mouseup', () => { vIsDragging = false; });
window.addEventListener('mousemove', (e) => {
  if (!vIsDragging) return;
  moveVertical(e.clientY);
});

// Dogodki za DOTIK
vHandle.addEventListener('touchstart', () => { vIsDragging = true; });
window.addEventListener('touchend', () => { vIsDragging = false; });
window.addEventListener('touchmove', (e) => {
  if (!vIsDragging) return;
  if (e.cancelable) e.preventDefault(); // Prepreči premikanje celotne strani na telefonu
  moveVertical(e.touches[0].clientY);
});

// --- SELEKTORJI ---
const mainContainer = document.querySelector('.main-slider-container');
const track = document.querySelector('.main-slider-track');
const pairs = document.querySelectorAll('.slide-pair');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

let currentSlideIndex = 0;

// --- 1. DEL: LOGIKA ZA VERTIKALNO ROLETO (ZA VSE PARE) ---
function initVerticalSliders() {
  pairs.forEach(pair => {
    const container = pair.querySelector('.vertical-slider-container');
    const foregroundImgContainer = pair.querySelector('.v-image-foreground');
    const foregroundImg = pair.querySelector('.v-image-foreground img');
    const handle = pair.querySelector('.v-slider-handle');
    
    let isDraggingHandle = false;

    // Funkcija za zaklepanje dimenzij slike pod roletno zaveso
    function resizeImages() {
      const rect = container.getBoundingClientRect();
      foregroundImg.style.width = `${rect.width}px`;
      foregroundImg.style.height = `${rect.height}px`;
    }
    
    window.addEventListener('load', resizeImages);
    window.addEventListener('resize', resizeImages);
    resizeImages();

    function moveVertical(y) {
      const rect = container.getBoundingClientRect();
      let positionY = y - rect.top;
      if (positionY < 0) positionY = 0;
      if (positionY > rect.height) positionY = rect.height;
      
      const percentageY = (positionY / rect.height) * 100;
      foregroundImgContainer.style.height = `${percentageY}%`;
      handle.style.top = `${percentageY}%`;
    }

    // Miška dogodki na ročici
    handle.addEventListener('mousedown', (e) => { e.stopPropagation(); isDraggingHandle = true; });
    window.addEventListener('mouseup', () => { isDraggingHandle = false; });
    window.addEventListener('mousemove', (e) => { if (isDraggingHandle) moveVertical(e.clientY); });

    // Dotik dogodki na ročici (telefon)
    handle.addEventListener('touchstart', (e) => { e.stopPropagation(); isDraggingHandle = true; });
    window.addEventListener('touchend', () => { isDraggingHandle = false; });
    window.addEventListener('touchmove', (e) => { 
      if (isDraggingHandle) {
        if (e.cancelable) e.preventDefault();
        moveVertical(e.touches[0].clientY); 
      }
    });
  });
}

// --- 2. DEL: HORIZONTALNO LISTANJE (SWIPE & BUTTONS) ---
let startX = 0;
let currentX = 0;
let isSwiping = false;

function updateSlidePosition() {
  track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
}

function nextSlide() {
  if (currentSlideIndex < pairs.length - 1) currentSlideIndex++;
  else currentSlideIndex = 0; // Skoči na začetek
  updateSlidePosition();
}

function prevSlide() {
  if (currentSlideIndex > 0) currentSlideIndex--;
  else currentSlideIndex = pairs.length - 1; // Skoči na konec
  updateSlidePosition();
}

// Gumbi klik
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Funkcije za zajem potega prsta / miške
function swipeStart(x) {
  startX = x;
  isSwiping = true;
  track.style.transition = 'none'; // Izklop animacije med vlečenjem
}

function swipeMove(x) {
  if (!isSwiping) return;
  currentX = x;
  const diffX = currentX - startX;
  
  // Izračun trenutnega odmika v pikslih za realni odziv pod prstom
  const containerWidth = mainContainer.getBoundingClientRect().width;
  const currentOffset = -currentSlideIndex * containerWidth;
  track.style.transform = `translateX(${currentOffset + diffX}px)`;
}

function swipeEnd() {
  if (!isSwiping) return;
  isSwiping = false;
  track.style.transition = 'transform 0.4s ease-out'; // Vklop nazaj
  
  const diffX = currentX - startX;
  const threshold = 70; // Koliko pikslov je potrebnih za preskok na naslednjo sliko
  
  if (diffX < -threshold) {
    nextSlide();
  } else if (diffX > threshold) {
    prevSlide();
  } else {
    updateSlidePosition(); // Če je poteg premajhen, vrni sliko nazaj
  }
}

// Dogodki za MIŠKO (PC vlečenje slik)
track.addEventListener('mousedown', (e) => { if(e.target.classList.contains('v-slider-handle')) return; swipeStart(e.clientX); });
window.addEventListener('mousemove', (e) => swipeMove(e.clientX));
window.addEventListener('mouseup', swipeEnd);

// Dogodki za DOTIK (Telefon poteg prsta)
track.addEventListener('touchstart', (e) => { if(e.target.classList.contains('v-slider-handle')) return; swipeStart(e.touches[0].clientX); });
window.addEventListener('touchmove', (e) => swipeMove(e.touches[0].clientX));
window.addEventListener('touchend', swipeEnd);

// Zagon vseh sistemov
initVerticalSliders();

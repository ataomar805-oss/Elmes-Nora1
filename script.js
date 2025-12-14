/* =========================================================
   GLOBAL SETUP
========================================================= */

gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const toggleBtn = document.getElementById("modeToggle");

/* =========================================================
   DARK / LIGHT MODE (PERSISTENT)
========================================================= */

const savedTheme = localStorage.getItem("theme");
if (savedTheme) body.className = savedTheme;

toggleBtn.textContent = body.classList.contains("dark") ? "🌞" : "🌙";

toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  body.classList.toggle("light");
  localStorage.setItem("theme", body.className);
  toggleBtn.textContent = body.classList.contains("dark") ? "🌞" : "🌙";
});

/* =========================================================
   SMOOTH SCROLL FEEL (MANUAL)
========================================================= */

let currentScroll = 0;
let targetScroll = 0;

window.addEventListener("scroll", () => {
  targetScroll = window.scrollY;
});

function smoothScroll() {
  currentScroll += (targetScroll - currentScroll) * 0.08;
  document.documentElement.style.setProperty(
    "--scrollY",
    `${currentScroll}px`
  );
  requestAnimationFrame(smoothScroll);
}
smoothScroll();

/* =========================================================
   THREE.JS BACKGROUND — REAL 3D
========================================================= */

const canvas = document.getElementById("backgroundCanvas");

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x05060a, 8, 20);

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/* =========================================================
   LIGHTING
========================================================= */

const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const pointLight = new THREE.PointLight(0x00ffff, 1.4, 40);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

/* =========================================================
   FLOATING BOOKS (CORE VISUAL)
========================================================= */

const books = [];
const bookGeometry = new THREE.BoxGeometry(0.6, 0.4, 0.08);

for (let i = 0; i < 40; i++) {
  const material = new THREE.MeshStandardMaterial({
    color: i % 2 === 0 ? 0x00ffff : 0xffcc66,
    roughness: 0.3,
    metalness: 0.2,
  });

  const book = new THREE.Mesh(bookGeometry, material);

  book.position.set(
    (Math.random() - 0.5) * 18,
    (Math.random() - 0.5) * 12,
    (Math.random() - 0.5) * 8
  );

  book.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    0
  );

  books.push(book);
  scene.add(book);
}

/* =========================================================
   EIFFEL TOWER (ABSTRACT)
========================================================= */

const eiffel = new THREE.Mesh(
  new THREE.ConeGeometry(0.8, 3, 4),
  new THREE.MeshStandardMaterial({
    color: 0xffffff,
    wireframe: true,
  })
);

eiffel.position.set(4, -2, -2);
scene.add(eiffel);

/* =========================================================
   MOUSE PARALLAX
========================================================= */

let mouseX = 0;
let mouseY = 0;

window.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
});

/* =========================================================
   ANIMATION LOOP
========================================================= */

const clock = new THREE.Clock();

function animate() {
  const elapsed = clock.getElapsedTime();

  camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
  camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;

  books.forEach((book, i) => {
    book.rotation.x += 0.003 + i * 0.00005;
    book.rotation.y += 0.002;
    book.position.y += Math.sin(elapsed + i) * 0.0008;
  });

  eiffel.rotation.y += 0.002;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

/* =========================================================
   RESIZE
========================================================= */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================================================
   GSAP SCROLL — DEPTH & BOOK FEEL
========================================================= */

document.querySelectorAll(".section").forEach((section, i) => {
  const book = section.querySelector(".book");

  gsap.fromTo(
    book,
    {
      rotationX: 12,
      rotationY: -8,
      y: 120,
      opacity: 0,
    },
    {
      rotationX: 0,
      rotationY: 0,
      y: 0,
      opacity: 1,
      duration: 1.4,
      ease: "power4.out",
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
      },
    }
  );

  gsap.from(
    section.querySelectorAll("h1, h2, h3, p, img"),
    {
      y: 40,
      opacity: 0,
      stagger: 0.12,
      duration: 1,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      },
    }
  );
});

/* =========================================================
   GALLERY LIGHTBOX (PURE JS + GSAP)
========================================================= */

const images = document.querySelectorAll(".gallery-img");

images.forEach((img) => {
  img.addEventListener("click", () => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.inset = 0;
    overlay.style.background = "rgba(0,0,0,0.8)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 5000;

    const clone = img.cloneNode();
    clone.style.maxWidth = "90%";
    clone.style.borderRadius = "20px";

    overlay.appendChild(clone);
    document.body.appendChild(overlay);

    gsap.from(clone, { scale: 0.7, opacity: 0, duration: 0.6 });

    overlay.addEventListener("click", () => {
      gsap.to(clone, {
        scale: 0.7,
        opacity: 0,
        duration: 0.4,
        onComplete: () => overlay.remove(),
      });
    });
  });
});
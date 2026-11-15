
import * as THREE from "https://esm.sh/three@0.170.0";

// =====================================
// CONFIGURATION
// =====================================

const container = document.getElementById("three-container");

if (container) {

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );

  camera.position.z = 5.5;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  container.appendChild(renderer.domElement);

  // =====================================
  // LIGHTING
  // =====================================

  scene.add(new THREE.AmbientLight(0xffffff, 1.5));

  const greenLight = new THREE.PointLight(
    0xc5ff42,
    35,
    20
  );

  greenLight.position.set(3, 3, 4);
  scene.add(greenLight);

  const purpleLight = new THREE.PointLight(
    0x9d45ff,
    30,
    20
  );

  purpleLight.position.set(-3, -2, 3);
  scene.add(purpleLight);

  const whiteLight = new THREE.PointLight(
    0xffffff,
    25,
    20
  );

  whiteLight.position.set(0, 3, -3);
  scene.add(whiteLight);

  // =====================================
  // MAIN 3D OBJECT
  // =====================================

  const geometry = new THREE.TorusKnotGeometry(
    1.15,
    0.36,
    200,
    32,
    2,
    5
  );

  const material = new THREE.MeshPhysicalMaterial({
    color: 0xc5ff42,
    metalness: 0.85,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    iridescence: 1,
    iridescenceIOR: 1.8,
    iridescenceThicknessRange: [100, 800]
  });

  const object = new THREE.Mesh(geometry, material);

  scene.add(object);

  // =====================================
  // SECONDARY ORBITING OBJECTS
  // =====================================

  const particles = new THREE.Group();

  const particleGeometry = new THREE.IcosahedronGeometry(
    0.045,
    1
  );

  const particleMaterial = new THREE.MeshBasicMaterial({
    color: 0xc5ff42
  });

  for (let i = 0; i < 18; i++) {

    const particle = new THREE.Mesh(
      particleGeometry,
      particleMaterial
    );

    const angle = (i / 18) * Math.PI * 2;
    const radius = 1.8 + Math.random() * 0.5;

    particle.position.set(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius,
      (Math.random() - 0.5) * 1.5
    );

    particles.add(particle);
  }

  scene.add(particles);

  // =====================================
  // MOUSE INTERACTION
  // =====================================

  let mouseX = 0;
  let mouseY = 0;

  let targetX = 0;
  let targetY = 0;

  container.addEventListener("pointermove", (event) => {

    const rect = container.getBoundingClientRect();

    mouseX = (
      (event.clientX - rect.left) / rect.width
    ) * 2 - 1;

    mouseY = (
      (event.clientY - rect.top) / rect.height
    ) * 2 - 1;

  });

  container.addEventListener("pointerleave", () => {
    mouseX = 0;
    mouseY = 0;
  });

  // =====================================
  // ANIMATION
  // =====================================

  const clock = new THREE.Clock();

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  function animate() {

    requestAnimationFrame(animate);

    const time = clock.getElapsedTime();

    if (!prefersReducedMotion) {

      targetX += (mouseY * 0.35 - targetX) * 0.04;
      targetY += (mouseX * 0.35 - targetY) * 0.04;

      object.rotation.x = time * 0.16 + targetX;
      object.rotation.y = time * 0.25 + targetY;

      object.position.y = Math.sin(time * 0.8) * 0.12;

      particles.rotation.y = time * 0.15;
      particles.rotation.x = time * 0.08;

      greenLight.position.x = Math.sin(time) * 3;
      purpleLight.position.y = Math.cos(time * 0.7) * 3;

    }

    renderer.render(scene, camera);
  }

  animate();

  // =====================================
  // RESPONSIVE RESIZING
  // =====================================

  const resizeObserver = new ResizeObserver(() => {

    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

  });

  resizeObserver.observe(container);

  // =====================================
  // CLEANUP
  // =====================================

  window.addEventListener("pagehide", () => {

    resizeObserver.disconnect();

    geometry.dispose();
    material.dispose();

    particleGeometry.dispose();
    particleMaterial.dispose();

    renderer.dispose();

  }, { once: true });

}


// =====================================
// SCROLL REVEAL ANIMATIONS
// =====================================

const revealElements = document.querySelectorAll(
  ".content-section, .about-section, .featured-post, .post-item, .art-card"
);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        entry.target.classList.add("revealed");

        observer.unobserve(entry.target);

      }

    });

  },
  {
    threshold: 0.12
  }
);

revealElements.forEach(element => {

  element.classList.add("reveal");

  revealObserver.observe(element);

});


// =====================================
// SMOOTH NAVIGATION
// =====================================

document.querySelectorAll('a[href^="#"]').forEach(link => {

  link.addEventListener("click", event => {

    const target = document.querySelector(
      link.getAttribute("href")
    );

    if (!target) return;

    event.preventDefault();

    target.scrollIntoView({
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches ? "auto" : "smooth"
    });

  });

});


// =====================================
// DYNAMIC FOOTER YEAR
// =====================================

const footerCopyright = document.querySelector(".footer-bottom span");

if (footerCopyright) {
  footerCopyright.textContent =
    `© ${new Date().getFullYear()} H3CC0UT__`;
}

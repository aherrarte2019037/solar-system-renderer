import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Sun glow shader
const sunGlowVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const sunGlowFragmentShader = `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  void main() {
    float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;

const PLANET_DATA = {
  sun: {
    radius: 20,
    texture: '/textures/sun.jpg',
    distance: 0,
    rotationSpeed: 0.004,
    emissive: 0xffff00,
    emissiveIntensity: 0.6
  },
  mercury: {
    radius: 3.8,
    texture: '/textures/mercury.jpg',
    distance: 40,
    rotationSpeed: 0.004
  },
  venus: {
    radius: 9.5,
    texture: '/textures/venus.jpg',
    distance: 70,
    rotationSpeed: 0.002
  },
  earth: {
    radius: 10,
    texture: '/textures/earth.jpg',
    distance: 100,
    rotationSpeed: 0.002
  },
  mars: {
    radius: 5.3,
    texture: '/textures/mars.jpg',
    distance: 130,
    rotationSpeed: 0.0018
  },
  jupiter: {
    radius: 15,
    texture: '/textures/jupiter.jpg',
    distance: 180,
    rotationSpeed: 0.004
  },
  saturn: {
    radius: 12,
    texture: '/textures/saturn.jpg',
    distance: 230,
    rotationSpeed: 0.0038
  },
  uranus: {
    radius: 8,
    texture: '/textures/uranus.jpg',
    distance: 280,
    rotationSpeed: 0.003
  },
  neptune: {
    radius: 7.5,
    texture: '/textures/neptune.jpg',
    distance: 320,
    rotationSpeed: 0.0028
  }
};

const SolarSystem = () => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const planetsRef = useRef({});

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    camera.position.z = 200;
    camera.position.y = 100;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    mountRef.current.appendChild(renderer.domElement);

    // Enhanced Lighting
    const ambientLight = new THREE.AmbientLight(0x333333);
    scene.add(ambientLight);

    // Main sun light
    const sunLight = new THREE.PointLight(0xffffff, 2, 1000);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Additional sun lighting effects
    const sunLightColor = new THREE.Color(0xffd7b0);
    const secondarySunLight = new THREE.PointLight(sunLightColor, 1, 500);
    scene.add(secondarySunLight);

    // Load textures and create planets
    const textureLoader = new THREE.TextureLoader();

    // Create sun with special materials
    const sunGeometry = new THREE.SphereGeometry(PLANET_DATA.sun.radius, 64, 64);
    const sunTexture = textureLoader.load(PLANET_DATA.sun.texture);
    const sunMaterial = new THREE.MeshPhongMaterial({
      map: sunTexture,
      emissive: PLANET_DATA.sun.emissive,
      emissiveIntensity: PLANET_DATA.sun.emissiveIntensity
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    planetsRef.current.sun = sun;

    // Add sun glow effect
    const sunGlowGeometry = new THREE.SphereGeometry(PLANET_DATA.sun.radius * 1.2, 64, 64);
    const sunGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xffdd66) }
      },
      vertexShader: sunGlowVertexShader,
      fragmentShader: sunGlowFragmentShader,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    scene.add(sunGlow);

    // Create lens flare
    const textureFlare = textureLoader.load('/textures/lensflare.png');
    const lensflare = new THREE.Lensflare();
    lensflare.addElement(new THREE.LensflareElement(textureFlare, 512, 0));
    sunLight.add(lensflare);

    // Create other planets
    Object.entries(PLANET_DATA).forEach(([planetName, data]) => {
      if (planetName === 'sun') return; // Skip sun as we already created it

      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const texture = textureLoader.load(data.texture);
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 5
      });
      const planet = new THREE.Mesh(geometry, material);

      // Position planets
      planet.position.x = data.distance;

      // Create orbit line with gradient
      const orbitGeometry = new THREE.RingGeometry(data.distance - 0.5, data.distance + 0.5, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0x444444,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.3
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      scene.add(planet);
      planetsRef.current[planetName] = planet;
    });

    // Enhanced star field
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const starsVertices = [];
    const starColors = [];
    for (let i = 0; i < 15000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);

      // Random star colors (white to slightly blue/yellow)
      const starColor = new THREE.Color();
      starColor.setHSL(Math.random() * 0.2 + 0.5, 0.2, Math.random() * 0.2 + 0.8);
      starColors.push(starColor.r, starColor.g, starColor.b);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starsMaterial.vertexColors = true;

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 50;
    controls.maxDistance = 500;
    controlsRef.current = controls;

    // Post-processing
    const composer = new THREE.EffectComposer(renderer);
    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new THREE.UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5,  // Strength
      0.4,  // Radius
      0.85  // Threshold
    );
    composer.addPass(bloomPass);

    // Animation loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Rotate planets
      Object.entries(planetsRef.current).forEach(([planetName, planet]) => {
        const data = PLANET_DATA[planetName];
        if (planetName !== 'sun') {
          // Orbit around sun
          const angle = Date.now() * data.rotationSpeed * 0.001;
          planet.position.x = Math.cos(angle) * data.distance;
          planet.position.z = Math.sin(angle) * data.distance;
        }
        // Self rotation
        planet.rotation.y += data.rotationSpeed;
      });

      // Update sun glow
      sunGlow.rotation.y += 0.003;
      sunGlow.rotation.z += 0.002;

      controls.update();
      composer.render();
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current?.removeChild(renderer.domElement);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{
        width: '100vw',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundColor: '#000'
      }}
    />
  );
};

export default SolarSystem;
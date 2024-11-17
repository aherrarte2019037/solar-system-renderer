import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import gsap from 'gsap';
import PlanetControls from './PlanetControls';
import { PLANET_DATA, CAMERA_SETTINGS, CAMERA_CONTROLS, BLOOM_SETTINGS, STAR_FIELD, SUN_GLOW, KEYBINDS } from './Constants';

const SolarSystem = () => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const planetsRef = useRef({});
  const keysPressed = useRef(new Set());
  const [selectedPlanet, setSelectedPlanet] = useState('sun');
  const cameraTargetRef = useRef(new THREE.Vector3());

  const focusOnPlanet = (planetName) => {
    const planet = planetsRef.current[planetName];
    if (!planet || !controlsRef.current) return;

    setSelectedPlanet(planetName);

    const targetPosition = new THREE.Vector3();
    planet.getWorldPosition(targetPosition);
    cameraTargetRef.current.copy(targetPosition);

    const distance = PLANET_DATA[planetName].radius * 4;
    const offset = new THREE.Vector3(distance, distance * 0.5, distance);

    const currentPos = controlsRef.current.object.position.clone();
    const targetPos = targetPosition.clone().add(offset);

    gsap.to(currentPos, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => {
        controlsRef.current.object.position.copy(currentPos);
        controlsRef.current.target.copy(targetPosition);
      }
    });
  };

  useEffect(() => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.00025);

    const camera = new THREE.PerspectiveCamera(
      CAMERA_SETTINGS.FOV,
      window.innerWidth / window.innerHeight,
      CAMERA_SETTINGS.NEAR,
      CAMERA_SETTINGS.FAR
    );
    camera.position.z = CAMERA_SETTINGS.INITIAL_POSITION.z;
    camera.position.y = CAMERA_SETTINGS.INITIAL_POSITION.y;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffffff, 2.5, 1000);
    scene.add(sunLight);

    const sunLightColor = new THREE.Color(0xffd7b0);
    const secondarySunLight = new THREE.PointLight(sunLightColor, 1.5, 500);
    scene.add(secondarySunLight);

    const textureLoader = new THREE.TextureLoader();

    const sunGeometry = new THREE.SphereGeometry(PLANET_DATA.sun.radius, 64, 64);
    const sunTexture = textureLoader.load(PLANET_DATA.sun.texture);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
      emissive: PLANET_DATA.sun.emissive,
      emissiveIntensity: PLANET_DATA.sun.emissiveIntensity
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);
    planetsRef.current.sun = sun;

    const sunGlowGeometry = new THREE.SphereGeometry(PLANET_DATA.sun.radius * SUN_GLOW.INNER.SCALE, 64, 64);
    const sunGlowMaterial = new THREE.MeshBasicMaterial({
      color: SUN_GLOW.INNER.COLOR,
      transparent: true,
      opacity: SUN_GLOW.INNER.OPACITY,
      side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    scene.add(sunGlow);

    const outerGlowGeometry = new THREE.SphereGeometry(PLANET_DATA.sun.radius * SUN_GLOW.OUTER.SCALE, 64, 64);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
      color: SUN_GLOW.OUTER.COLOR,
      transparent: true,
      opacity: SUN_GLOW.OUTER.OPACITY,
      side: THREE.BackSide
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    scene.add(outerGlow);

    Object.entries(PLANET_DATA).forEach(([planetName, data]) => {
      if (planetName === 'sun') return;

      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const texture = textureLoader.load(data.texture);
      const material = new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 5
      });
      const planet = new THREE.Mesh(geometry, material);
      planet.position.x = data.distance;

      const orbitGeometry = new THREE.RingGeometry(data.distance, data.distance + 0.5, 128);
      const orbitMaterial = new THREE.MeshBasicMaterial({
        color: 0xd8d3cd,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.2
      });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);

      scene.add(planet);
      planetsRef.current[planetName] = planet;
    });

    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: STAR_FIELD.SIZE,
      transparent: true,
      opacity: STAR_FIELD.OPACITY,
      sizeAttenuation: true
    });

    const starsVertices = [];
    const starColors = [];
    for (let i = 0; i < STAR_FIELD.COUNT; i++) {
      const x = (Math.random() - 0.5) * STAR_FIELD.SPREAD;
      const y = (Math.random() - 0.5) * STAR_FIELD.SPREAD;
      const z = (Math.random() - 0.5) * STAR_FIELD.SPREAD;
      starsVertices.push(x, y, z);

      const starColor = new THREE.Color();
      starColor.setHSL(Math.random() * 0.2 + 0.5, 0.2, Math.random() * 0.2 + 0.8);
      starColors.push(starColor.r, starColor.g, starColor.b);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starsMaterial.vertexColors = true;

    const starField = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starField);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = CAMERA_CONTROLS.DAMPING_FACTOR;
    controls.minDistance = CAMERA_CONTROLS.MIN_DISTANCE;
    controls.maxDistance = CAMERA_CONTROLS.MAX_DISTANCE;
    controlsRef.current = controls;

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      BLOOM_SETTINGS.STRENGTH,
      BLOOM_SETTINGS.RADIUS,
      BLOOM_SETTINGS.THRESHOLD
    );
    composer.addPass(bloomPass);

    const handleKeyDown = (event) => {
      keysPressed.current.add(event.key);
    };

    const handleKeyUp = (event) => {
      keysPressed.current.delete(event.key);
    };

    const handleKeyPress = (event) => {
      const planetEntry = Object.entries(KEYBINDS).find(([_, key]) => key === event.key);
      if (planetEntry) {
        focusOnPlanet(planetEntry[0]);
      }
    };

    const updateCameraPosition = () => {
      if (!controlsRef.current || keysPressed.current.size === 0) return;

      const camera = controlsRef.current.object;
      const controls = controlsRef.current;
      const moveDistance = new THREE.Vector3();

      keysPressed.current.forEach(key => {
        switch (key) {
          case 'ArrowUp':
            moveDistance.add(new THREE.Vector3(0, CAMERA_CONTROLS.MOVE_SPEED * 0.016, 0));
            break;
          case 'ArrowDown':
            moveDistance.add(new THREE.Vector3(0, -CAMERA_CONTROLS.MOVE_SPEED * 0.016, 0));
            break;
          case 'ArrowLeft':
            moveDistance.add(new THREE.Vector3(-CAMERA_CONTROLS.MOVE_SPEED * 0.016, 0, 0));
            break;
          case 'ArrowRight':
            moveDistance.add(new THREE.Vector3(CAMERA_CONTROLS.MOVE_SPEED * 0.016, 0, 0));
            break;
          case '+':
          case '=': {
            const zoomDirection = new THREE.Vector3();
            camera.getWorldDirection(zoomDirection);
            moveDistance.add(zoomDirection.multiplyScalar(CAMERA_CONTROLS.ZOOM_SPEED * 0.016));
            break;
          }
          case '-':
          case '_': {
            const zoomDirection = new THREE.Vector3();
            camera.getWorldDirection(zoomDirection);
            moveDistance.add(zoomDirection.multiplyScalar(-CAMERA_CONTROLS.ZOOM_SPEED * 0.016));
            break;
          }
          default:
            break;
        }
      });

      gsap.to(camera.position, {
        x: camera.position.x + moveDistance.x,
        y: camera.position.y + moveDistance.y,
        z: camera.position.z + moveDistance.z,
        duration: 0.016,
        ease: "none",
        overwrite: true
      });

      gsap.to(controls.target, {
        x: controls.target.x + moveDistance.x,
        y: controls.target.y + moveDistance.y,
        z: controls.target.z + moveDistance.z,
        duration: 0.016,
        ease: "none",
        overwrite: true
      });
    };

    const animate = () => {
      requestAnimationFrame(animate);

      updateCameraPosition();

      Object.entries(planetsRef.current).forEach(([planetName, planet]) => {
        const data = PLANET_DATA[planetName];
        if (planetName !== 'sun') {
          const angle = Date.now() * data.rotationSpeed * 0.001;
          planet.position.x = Math.cos(angle) * data.distance;
          planet.position.z = Math.sin(angle) * data.distance;
        }
        planet.rotation.y += data.rotationSpeed;
      });

      sunGlow.rotation.y += SUN_GLOW.ROTATION.INNER.Y;
      sunGlow.rotation.z += SUN_GLOW.ROTATION.INNER.Z;
      outerGlow.rotation.y -= SUN_GLOW.ROTATION.OUTER.Y;
      outerGlow.rotation.z -= SUN_GLOW.ROTATION.OUTER.Z;

      controls.update();
      composer.render();
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('resize', handleResize);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <PlanetControls selectedPlanet={selectedPlanet} />
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
    </>
  );
};

export default SolarSystem;
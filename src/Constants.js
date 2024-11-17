export const PLANET_DATA = {
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

export const CAMERA_SETTINGS = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 2000,
  INITIAL_POSITION: {
    z: 200,
    y: 100
  }
};

export const CAMERA_CONTROLS = {
  MOVE_SPEED: 100,
  ZOOM_SPEED: 20,
  MIN_DISTANCE: 50,
  MAX_DISTANCE: 500,
  DAMPING_FACTOR: 0.05
};

export const BLOOM_SETTINGS = {
  STRENGTH: 1.5,
  RADIUS: 0.4,
  THRESHOLD: 0.85
};

export const STAR_FIELD = {
  COUNT: 15000,
  SIZE: 0.1,
  OPACITY: 0.8,
  SPREAD: 2000
};

export const SUN_GLOW = {
  INNER: {
    SCALE: 1.2,
    COLOR: 0xffdd66,
    OPACITY: 0.4
  },
  OUTER: {
    SCALE: 1.4,
    COLOR: 0xff8833,
    OPACITY: 0.2
  },
  ROTATION: {
    INNER: {
      Y: 0.003,
      Z: 0.002
    },
    OUTER: {
      Y: 0.002,
      Z: 0.003
    }
  }
};

export const KEYBINDS = {
  sun: '1',
  mercury: '2',
  venus: '3',
  earth: '4',
  mars: '5',
  jupiter: '6',
  saturn: '7',
  uranus: '8',
  neptune: '9'
};
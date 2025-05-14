/**
 * Wedding Planner 3D Scene Manager
 * Creates an interactive 3D scene for the home page
 */

import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/postprocessing/UnrealBloomPass.js';

// Scene setup
let scene, camera, renderer, composer, controls;
let clock, mixer;
let particles, particleSystem;
let brideModel, groomModel;
let weddingRing, flowerDecoration;
let raycaster, mouse;
let windowHalfX, windowHalfY;
let sceneReady = false;
let animationFrameId = null;
let cameraTarget = new THREE.Vector3(0, 0, 0);
let mainContainer;

// App state
const STATE = {
    introComplete: false,
    userInteracted: false
};

// Initialize 3D scene
function initScene() {
    mainContainer = document.getElementById('home-3d-container');
    if (!mainContainer) return;
    
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    // Initialize scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x120821); // Deep purple background
    scene.fog = new THREE.FogExp2(0x120821, 0.001);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.5, 5);
    camera.lookAt(cameraTarget);
    
    // Renderer setup
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mainContainer.appendChild(renderer.domElement);
    
    // Post processing
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.4, // Bloom strength
        0.4, // Bloom radius
        0.85 // Bloom threshold
    );
    
    composer = new EffectComposer(renderer);
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    
    // Controls setup
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = Math.PI / 1.8;
    controls.target.set(0, 0, 0);
    controls.enabled = false; // Start with controls disabled
    
    // Raycaster for interaction
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    
    // Clock for animations
    clock = new THREE.Clock();
    
    // Add lights
    addLights();
    
    // Add decorative elements
    createParticles();
    createRing();
    createFlowers();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onMouseClick);
    document.addEventListener('touchstart', onTouchStart, { passive: false });
    
    // Start animation loop
    animate();
    
    // Begin introduction sequence
    setTimeout(startIntroSequence, 500);
    
    // Mark scene as ready
    sceneReady = true;
}

// Create particle system for background effects
function createParticles() {
    const particleCount = 2000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Position particles in a sphere
        const radius = 15 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        particlePositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        particlePositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta) - 3;
        particlePositions[i3 + 2] = radius * Math.cos(phi);
        
        // Random sizes for particles
        particleSizes[i] = Math.random() * 2 + 0.5;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
    
    // Create particle material with custom shader
    const particleMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xa64ad4) } // Purple color
        },
        vertexShader: `
            attribute float size;
            uniform float time;
            varying vec3 vColor;
            void main() {
                vColor = vec3(0.65, 0.29, 0.83); // Purple base color
                // Subtle movement
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            void main() {
                // Circular particles
                if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) discard;
                // Radial gradient
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    
    // Create the particle system
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
}

// Create a glowing wedding ring
function createRing() {
    const torusGeometry = new THREE.TorusGeometry(1, 0.1, 16, 50);
    const torusMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700, // Gold color
        metalness: 1.0,
        roughness: 0.2,
        emissive: 0xffa500, // Subtle orange glow
        emissiveIntensity: 0.3
    });
    
    weddingRing = new THREE.Mesh(torusGeometry, torusMaterial);
    weddingRing.rotation.x = Math.PI / 2; // Lie flat
    weddingRing.position.y = 0.5;
    scene.add(weddingRing);
}

// Create flower decorations
function createFlowers() {
    const flowerGroup = new THREE.Group();
    
    // Create flower petals
    const colors = [0xff69b4, 0xffc0cb, 0xdda0dd]; // Pink colors
    
    for (let i = 0; i < 5; i++) {
        const petalGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const petalMaterial = new THREE.MeshStandardMaterial({
            color: colors[i % colors.length],
            roughness: 0.5,
            metalness: 0.1,
            emissive: colors[i % colors.length],
            emissiveIntensity: 0.2
        });
        
        const angle = (i / 5) * Math.PI * 2;
        const radius = 0.3;
        
        const petal = new THREE.Mesh(petalGeometry, petalMaterial);
        petal.scale.set(1.5, 0.8, 0.4);
        petal.position.x = Math.cos(angle) * radius;
        petal.position.z = Math.sin(angle) * radius;
        petal.rotation.y = angle;
        
        flowerGroup.add(petal);
    }
    
    // Create flower center
    const centerGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const centerMaterial = new THREE.MeshStandardMaterial({
        color: 0xffff00, // Yellow center
        roughness: 0.5,
        metalness: 0.1,
        emissive: 0xffff00,
        emissiveIntensity: 0.2
    });
    
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    flowerGroup.add(center);
    
    // Position flowers around the ring
    for (let i = 0; i < 8; i++) {
        const flower = flowerGroup.clone();
        const angle = (i / 8) * Math.PI * 2;
        const radius = 2;
        
        flower.position.x = Math.cos(angle) * radius;
        flower.position.z = Math.sin(angle) * radius;
        flower.position.y = 0.2 + Math.sin(i * 2) * 0.2;
        flower.rotation.y = angle;
        flower.scale.set(0.5, 0.5, 0.5);
        
        scene.add(flower);
    }
    
    flowerDecoration = flowerGroup;
}

// Add various lights to the scene
function addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x333333, 0.5);
    scene.add(ambientLight);
    
    // Directional light (like sunlight)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    scene.add(directionalLight);
    
    // Spotlight for dramatic effect
    const spotlight = new THREE.SpotLight(0xa64ad4, 1.5); // Purple spot
    spotlight.position.set(0, 10, 0);
    spotlight.angle = Math.PI / 6;
    spotlight.penumbra = 0.2;
    spotlight.decay = 2;
    spotlight.distance = 20;
    spotlight.castShadow = true;
    spotlight.shadow.mapSize.width = 1024;
    spotlight.shadow.mapSize.height = 1024;
    scene.add(spotlight);
    
    // Point lights for extra highlights
    const pointLight1 = new THREE.PointLight(0xff69b4, 1, 10); // Pink
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x6495ed, 1, 10); // Blue
    pointLight2.position.set(-2, 1, -2);
    scene.add(pointLight2);
}

// Introduction animation sequence
function startIntroSequence() {
    // Animate camera from far away to close-up
    const startPosition = { x: 0, y: 10, z: 20 };
    const endPosition = { x: 0, y: 1.5, z: 5 };
    
    // Reset camera to start position
    camera.position.set(startPosition.x, startPosition.y, startPosition.z);
    
    // Use GSAP-like animation
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    
    function animateCamera() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Easing function (ease-out cubic)
        const t = 1 - Math.pow(1 - progress, 3);
        
        // Update camera position
        camera.position.x = startPosition.x + (endPosition.x - startPosition.x) * t;
        camera.position.y = startPosition.y + (endPosition.y - startPosition.y) * t;
        camera.position.z = startPosition.z + (endPosition.z - startPosition.z) * t;
        
        // Look at target
        camera.lookAt(cameraTarget);
        
        // Continue animation if not complete
        if (progress < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            // Enable controls after intro
            controls.enabled = true;
            STATE.introComplete = true;
            
            // Show UI elements
            const uiElements = document.querySelectorAll('.appear-after-intro');
            uiElements.forEach((el, index) => {
                setTimeout(() => {
                    el.classList.add('visible');
                }, 200 * index);
            });
        }
    }
    
    // Start animation
    animateCamera();
}

// Handle window resize
function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Handle mouse movement
function onMouseMove(event) {
    // Update mouse position for raycasting
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Subtle camera movement following mouse if not yet interacted
    if (!STATE.userInteracted && STATE.introComplete) {
        const targetX = (event.clientX - windowHalfX) * 0.0005;
        const targetY = (event.clientY - windowHalfY) * 0.0005;
        
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(cameraTarget);
    }
}

// Handle mouse click
function onMouseClick(event) {
    STATE.userInteracted = true;
    controls.enabled = true;
    
    // Cast ray to check for object interactions
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        // Check if we clicked the ring
        if (intersects[0].object === weddingRing) {
            // Do something when clicking the ring
            pulseRing();
        }
    }
}

// Handle touch start
function onTouchStart(event) {
    // Prevent default to avoid scrolling on mobile
    event.preventDefault();
    
    STATE.userInteracted = true;
    controls.enabled = true;
    
    // Get touch position
    const touch = event.touches[0];
    mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    
    // Use raycaster to detect touches on objects
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    if (intersects.length > 0) {
        if (intersects[0].object === weddingRing) {
            pulseRing();
        }
    }
}

// Animation for ring interaction
function pulseRing() {
    const originalScale = { value: 1 };
    const pulseScale = { value: 1.2 };
    const duration = 500; // milliseconds
    const startTime = Date.now();
    
    function animatePulse() {
        const elapsedTime = Date.now() - startTime;
        const halfDuration = duration / 2;
        
        if (elapsedTime < halfDuration) {
            // Scale up
            const progress = elapsedTime / halfDuration;
            const scale = originalScale.value + (pulseScale.value - originalScale.value) * progress;
            weddingRing.scale.set(scale, scale, scale);
        } else if (elapsedTime < duration) {
            // Scale down
            const progress = (elapsedTime - halfDuration) / halfDuration;
            const scale = pulseScale.value + (originalScale.value - pulseScale.value) * progress;
            weddingRing.scale.set(scale, scale, scale);
        } else {
            // Reset to original
            weddingRing.scale.set(originalScale.value, originalScale.value, originalScale.value);
            return;
        }
        
        requestAnimationFrame(animatePulse);
    }
    
    animatePulse();
}

// Main animation loop
function animate() {
    // Request next frame
    animationFrameId = requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Update controls if enabled
    if (controls.enabled) {
        controls.update();
    }
    
    // Rotate ring slowly
    if (weddingRing) {
        weddingRing.rotation.z += deltaTime * 0.2;
    }
    
    // Animate flowers
    if (flowerDecoration) {
        scene.children.forEach(child => {
            if (child.type === 'Group') {
                child.rotation.y += deltaTime * 0.3;
                child.position.y += Math.sin(Date.now() * 0.001 + child.position.x) * 0.002;
            }
        });
    }
    
    // Animate particles
    if (particleSystem) {
        particleSystem.material.uniforms.time.value += deltaTime;
        particleSystem.rotation.y += deltaTime * 0.05;
    }
    
    // Render scene with post-processing
    composer.render();
}

// Function to clean up resources
function dispose() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('click', onMouseClick);
    document.removeEventListener('touchstart', onTouchStart);
    
    // Dispose of Three.js resources
    if (renderer) {
        renderer.dispose();
        
        // Remove canvas from DOM
        if (mainContainer && renderer.domElement) {
            mainContainer.removeChild(renderer.domElement);
        }
    }
    
    // Clear scene
    if (scene) {
        scene.clear();
    }
    
    // Clear variables
    scene = null;
    camera = null;
    renderer = null;
    composer = null;
    controls = null;
    clock = null;
    mixer = null;
    particleSystem = null;
    weddingRing = null;
    flowerDecoration = null;
    raycaster = null;
    mouse = null;
    sceneReady = false;
}

// Export functions for external use
window.threeScene = {
    init: initScene,
    dispose: dispose
};

// Initialize scene when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the home page
    if (document.getElementById('home-3d-container')) {
        initScene();
    }
});

// Clean up when navigating away
window.addEventListener('beforeunload', dispose);
/* Demo JS */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GUI } from 'dat.gui'
import { WebGLRenderer } from "three";
import { BlendFunction, ChromaticAberrationEffect, GlitchEffect, NoiseEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { gsap } from 'gsap';
import { DoubleSide, EquirectangularRefractionMapping } from 'three';
import { AnimationUtils } from 'three';
import CANNON from 'cannon';

const canvas = document.querySelector('.canvas');

// const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvas });
// renderer.setClearColor(0x000000);
const renderer = new WebGLRenderer({
	powerPreference: "high-performance",
	antialias: false,
	stencil: false,
	depth: false,
  canvas
});
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080)

const camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 10000 );

const orbit = new OrbitControls(camera, renderer.domElement);

const gui = new GUI({width:360})

// Camera positioning
camera.position.set(0, 0, 200);
orbit.autoRotate = true;

const chromaticAberrationEffect = new ChromaticAberrationEffect();

const noiseEffect = new NoiseEffect({
  blendFunction: BlendFunction.COLOR_DODGE
});
noiseEffect.blendMode.opacity.value = 0.1;

const glitchEffect = new GlitchEffect({
  chromaticAberrationOffset: chromaticAberrationEffect.offset
});

const glitchPass = new EffectPass(camera, glitchEffect, noiseEffect);

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
composer.addPass(glitchPass);

function createImage() {
  const canvas = document.createElement( 'canvas' );
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext( '2d' );
  context.fillStyle = 'rgb(' + Math.floor( Math.random() * 256 ) + ',' + Math.floor( Math.random() * 256 ) + ',' + Math.floor( Math.random() * 256 ) + ')';
  context.fillRect( 0, 0, 256, 256 );

  return canvas;
}

function render() {
  const geometry = new THREE.SphereGeometry( 50, Math.random() * 64, Math.random() * 32 );
  const texture = new THREE.CanvasTexture( createImage() );
  const material = new THREE.MeshBasicMaterial( { map: texture, wireframe: true } );
  const mesh = new THREE.Mesh( geometry, material );
  scene.add( mesh );

  renderer.render( scene, camera );
  
  orbit.update();
  composer.render();
  scene.remove( mesh );

  // clean up

  geometry.dispose();
  material.dispose();
  texture.dispose();

}


function animate() {
  renderer.setAnimationLoop(animate);
  render();
  
}

animate();


window.addEventListener('resize', resizeEvent);

function resizeEvent() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

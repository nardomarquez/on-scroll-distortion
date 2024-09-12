attribute vec2 uv;
attribute vec3 position;
 
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform vec2 uResolution; // in pixel
uniform float uTime; // in s
uniform vec2 uCursor; // 0 (left) 0 (top) / 1 (right) 1 (bottom)
uniform float uScrollVelocity; // - (scroll up) / + (scroll down)
uniform sampler2D uTexture; // texture
uniform vec2 uImageSize; // size of texture
uniform vec2 uPlaneSize; // size of texture element
uniform float uBorderRadius; // pixel value
uniform float uMouseEnter; // 0 - 1 (enter) / 1 - 0 (leave)
uniform vec2 uMouseOverPos; // 0 (left) 0 (top) / 1 (right) 1 (bottom)

varying vec2 vUv;  // 0 (left) 0 (bottom) - 1 (top) 1 (right)

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
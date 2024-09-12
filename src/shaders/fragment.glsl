precision highp float;

uniform vec2 uResolution; // in pixel
uniform float uTime; // in s
uniform vec2 uCursor; // 0 (left) 0 (top) / 1 (right) 1 (bottom)
uniform float uScrollVelocity; // - (scroll up) / + (scroll down)
 uniform float uMouseEnter; // 0 - 1 (enter) / 1 - 0 (leave)
uniform vec2 uMouseOverPos; // 0 (left) 0 (top) / 1 (right) 1 (bottom)

uniform vec2 uImageSizes;
uniform vec2 uPlaneSizes;
uniform sampler2D uTexture;

varying vec2 vUv;

#include './resources/noise.glsl';


void main() {
  vec2 ratio = vec2(
    min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
    min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
  );
 
  vec2 uv = vec2(
    vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
    vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
  );

    vec2 texCoords = uv;

   // aspect ratio needed to create a real circle when quadSize is not 1:1 ratio
  float aspectRatio = uImageSizes.y / uImageSizes.x;

  // create a circle following the mouse with size 15
  float circle = 1.0 - distance(
    vec2(uMouseOverPos.x, (1.0 - uMouseOverPos.y) * aspectRatio),
    vec2(vUv.x, vUv.y * aspectRatio)
  ) * 15.0;

  // create noise
  float noise = snoise(gl_FragCoord.xy);

  // modify texture coordinates
  texCoords.x += mix(0.0, circle * noise * 0.01, uMouseEnter + uScrollVelocity * 0.1);
  texCoords.y += mix(0.0, circle * noise * 0.01, uMouseEnter + uScrollVelocity * 0.1);

  gl_FragColor.rgb = texture2D(uTexture, texCoords).rgb;
  gl_FragColor.a = 1.0;


}
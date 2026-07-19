import { useEffect, useRef, useState } from 'react';

interface GpuAuroraCanvasProps {
  className?: string;
  intensity?: number;
}

const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_intensity;

  float blob(vec2 uv, vec2 center, float radius) {
    float distanceToCenter = length(uv - center);
    return radius / max(distanceToCenter, 0.025);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
    float t = u_time * 0.12;

    vec2 blueOne = vec2(sin(t * 1.4) * 0.28 - 0.18, cos(t * 1.1) * 0.18 + 0.04);
    vec2 blueTwo = vec2(cos(t * 0.8) * 0.36 + 0.2, sin(t * 1.2) * 0.26 - 0.12);
    vec2 amberOne = vec2(sin(t * 1.0 + 2.1) * 0.3, cos(t * 1.35 + 1.3) * 0.22);

    float b1 = blob(p, blueOne, 0.11);
    float b2 = blob(p, blueTwo, 0.09);
    float a1 = blob(p, amberOne, 0.08);
    float glow = smoothstep(0.25, 1.35, b1 + b2 + a1);

    vec3 deep = vec3(0.003, 0.012, 0.035);
    vec3 blue = vec3(0.0, 0.36, 1.0) * (b1 * 0.22 + b2 * 0.18);
    vec3 cyan = vec3(0.0, 0.82, 1.0) * (b2 * 0.12);
    vec3 amber = vec3(1.0, 0.38, 0.0) * (a1 * 0.2);

    float vignette = smoothstep(0.9, 0.1, length(uv - 0.5));
    vec3 color = deep + (blue + cyan + amber) * glow * vignette * u_intensity;
    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function GpuAuroraCanvas({ className = '', intensity = 1 }: GpuAuroraCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: false,
    });

    if (!gl) {
      setFallback(true);
      return;
    }

    const program = createProgram(gl);
    if (!program) {
      setFallback(true);
      return;
    }

    const positionBuffer = gl.createBuffer();
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!positionBuffer || positionLocation < 0 || !resolutionLocation || !timeLocation || !intensityLocation) {
      setFallback(true);
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    let frame = 0;
    const startedAt = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = () => {
      resize();
      const elapsed = reduceMotion ? 0 : (performance.now() - startedAt) / 1000;

      gl.useProgram(program);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(intensityLocation, intensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!reduceMotion) {
        frame = window.requestAnimationFrame(render);
      }
    };

    render();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(frame);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, [intensity]);

  if (fallback) {
    return (
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${className}`}
        style={{
          background:
            'radial-gradient(circle at 25% 30%, rgba(0,102,255,0.34), transparent 32%), radial-gradient(circle at 70% 55%, rgba(255,123,0,0.26), transparent 36%), #010309',
        }}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    />
  );
}

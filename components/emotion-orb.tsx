'use client'

import React, { useEffect, useRef, useState } from 'react'

const themeColors: Record<string, { primary: [number, number, number]; secondary: [number, number, number] }> = {
  default: { primary: [0.62, 0.07, 0.22], secondary: [0.92, 0.70, 0.03] }, // Rose-900 (#9f1239), Gold (#eab308)
  fantasy: { primary: [0.49, 0.23, 0.93], secondary: [0.93, 0.28, 0.60] }, // Purple (#7c3aed), Pink (#ec4899)
  romance: { primary: [0.86, 0.15, 0.47], secondary: [0.98, 0.81, 0.91] }, // Deep Pink (#db2777), Light Pink (#fbcfe8)
  action: { primary: [0.86, 0.15, 0.15], secondary: [0.98, 0.45, 0.09] }, // Red (#dc2626), Orange (#f97316)
  mystery: { primary: [0.12, 0.23, 0.54], secondary: [0.02, 0.71, 0.83] }, // Dark Blue (#1e3a8a), Cyan (#06b6d4)
  horror: { primary: [0.09, 0.09, 0.11], secondary: [0.50, 0.11, 0.11] }, // Zinc-900 (#18181b), Dark Red (#7f1d1d)
  adventure: { primary: [0.02, 0.59, 0.41], secondary: [0.98, 0.75, 0.14] }, // Emerald (#059669), Gold (#fbbf24)
  humor: { primary: [0.52, 0.80, 0.09], secondary: [0.98, 0.80, 0.08] } // Lime (#84cc16), Yellow (#facc15)
}

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform float u_time;
  uniform vec3 u_color_primary;
  uniform vec3 u_color_secondary;
  uniform float u_warp;

  // Simplex 3D Noise by Ashima Arts
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 center = vec2(0.5, 0.5);
    vec2 pos = uv - center;
    pos.x *= u_resolution.x / u_resolution.y; // aspect ratio correction
    
    // Calculate distance from center
    float dist = length(pos);
    
    // Warp noise based on u_time and mouse position
    vec2 mouseNorm = (u_mouse.xy / u_resolution.xy) - center;
    mouseNorm.x *= u_resolution.x / u_resolution.y;
    
    float mouseDist = length(pos - mouseNorm);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * u_warp;
    
    // Noise inputs
    float n = snoise(vec3(pos * 3.0, u_time * 0.4 + mouseInfluence * 1.5));
    
    // Warp sphere boundary with noise
    float radius = 0.28 + n * 0.05;
    
    // Smoothly blend boundary edge
    float edge = smoothstep(radius, radius - 0.015, dist);
    
    // Inner texture noise glow
    float innerGlow = snoise(vec3(pos * 5.0, u_time * 0.3));
    
    // Blend colors
    vec3 finalColor = mix(u_color_primary, u_color_secondary, uv.y + n * 0.3);
    finalColor += vec3(innerGlow * 0.06); // add subtle texture glow
    
    // Add highlight/sheen on top-left of sphere
    vec2 lightPos = vec2(-0.1, 0.1);
    float light = smoothstep(0.2, 0.0, length(pos - lightPos));
    finalColor += vec3(light * 0.12);
    
    // Ambient lighting glow behind the sphere
    float glow = smoothstep(0.48, 0.0, dist) * 0.25;
    vec3 ambientGlow = u_color_primary * glow;

    gl_FragColor = vec4(mix(ambientGlow, finalColor, edge), edge + glow * 0.5);
  }
`

export function EmotionOrb() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentThemeRef = useRef<string>('default')
  const [activeTheme, setActiveTheme] = useState<string>('default')
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.05 }
    )

    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  // Smooth color transitions in JS before piping to WebGL
  const colorsRef = useRef<{
    currentPrimary: [number, number, number]
    currentSecondary: [number, number, number]
  }>({
    currentPrimary: [...themeColors.default.primary],
    currentSecondary: [...themeColors.default.secondary]
  })

  // Listener for dynamic theme changes from hovered genres
  useEffect(() => {
    const handleThemeChange = (e: CustomEvent<{ theme: string }>) => {
      const theme = e.detail?.theme || 'default'
      if (themeColors[theme]) {
        currentThemeRef.current = theme
        setActiveTheme(theme)
      }
    }

    window.addEventListener('vensoul-theme-change' as any, handleThemeChange)
    return () => {
      window.removeEventListener('vensoul-theme-change' as any, handleThemeChange)
    }
  }, [])

  // WebGL Render Loop
  useEffect(() => {
    if (!isVisible) return

    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true })
    if (!gl) {
      console.warn('WebGL not supported')
      return
    }

    // Set size
    let width = (canvas.width = canvas.offsetWidth)
    let height = (canvas.height = canvas.offsetHeight)

    // Compile Shader helper
    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type)
      if (!shader) return null
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader:', gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)
        return null
      }
      return shader
    }

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER)
    const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER)
    if (!vertexShader || !fragmentShader) return

    // Create program
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Error linking program:', gl.getProgramInfoLog(program))
      return
    }

    gl.useProgram(program)

    // Set up geometry buffer (2 triangles covering canvas)
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    )

    const positionLoc = gl.getAttribLocation(program, 'position')
    gl.enableVertexAttribArray(positionLoc)
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0)

    // Uniform locations
    const resolutionLoc = gl.getUniformLocation(program, 'u_resolution')
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const primaryColorLoc = gl.getUniformLocation(program, 'u_color_primary')
    const secondaryColorLoc = gl.getUniformLocation(program, 'u_color_secondary')
    const warpLoc = gl.getUniformLocation(program, 'u_warp')

    // Mouse tracking
    let targetMouse = { x: width / 2, y: height / 2 }
    let currentMouse = { x: width / 2, y: height / 2 }
    let mouseActive = false
    let lastMoveTime = 0

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      targetMouse.x = e.clientX - rect.left
      targetMouse.y = height - (e.clientY - rect.top) // flip Y for WebGL coords
      mouseActive = true
      lastMoveTime = performance.now()
    }

    // Bind mouse events on document
    document.addEventListener('mousemove', handleMouseMove)

    // Handle resize
    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
      gl.viewport(0, 0, width, height)
    }
    window.addEventListener('resize', handleResize)

    // Render loop variables
    let animationId: number
    let startTime = performance.now()
    let currentWarp = 0

    const render = () => {
      const time = (performance.now() - startTime) * 0.001
      
      // Interpolate mouse coordinates smoothly
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.08
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.08

      // Decay warp factor when mouse is inactive
      const timeSinceMove = performance.now() - lastMoveTime
      const warpTarget = mouseActive && timeSinceMove < 1500 ? 1.0 : 0.0
      currentWarp += (warpTarget - currentWarp) * 0.05

      // Transition primary and secondary colors smoothly toward active theme
      const targetColors = themeColors[currentThemeRef.current] || themeColors.default
      const lerpSpeed = 0.05
      
      for (let i = 0; i < 3; i++) {
        colorsRef.current.currentPrimary[i] += (targetColors.primary[i] - colorsRef.current.currentPrimary[i]) * lerpSpeed
        colorsRef.current.currentSecondary[i] += (targetColors.secondary[i] - colorsRef.current.currentSecondary[i]) * lerpSpeed
      }

      // Pass uniform values to GPU
      gl.uniform2f(resolutionLoc, width, height)
      gl.uniform2f(mouseLoc, currentMouse.x, currentMouse.y)
      gl.uniform1f(timeLoc, time)
      gl.uniform1f(warpLoc, currentWarp)
      gl.uniform3fv(primaryColorLoc, colorsRef.current.currentPrimary)
      gl.uniform3fv(secondaryColorLoc, colorsRef.current.currentSecondary)

      // Draw
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      animationId = requestAnimationFrame(render)
    }

    render()

    // Clean up
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      gl.deleteBuffer(positionBuffer)
      gl.deleteProgram(program)
    }
  }, [isVisible])

  return (
    <div className="relative w-[220px] h-[220px] xs:w-[280px] xs:h-[280px] sm:w-[320px] sm:h-[320px] md:w-[400px] md:h-[400px] flex items-center justify-center pointer-events-none select-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 0 30px rgba(0,0,0,0.15))' }}
      />
      {/* Dynamic textual theme indicator (very minimal & elegant) */}
      <div className="absolute bottom-4 text-[9px] uppercase tracking-[0.3em] font-bold opacity-30 select-none text-foreground font-sans">
        Spirit: {activeTheme}
      </div>
    </div>
  )
}

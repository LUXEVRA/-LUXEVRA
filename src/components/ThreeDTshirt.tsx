/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export default function ThreeDTshirt({ width = 320, height = 360, autoRotate = true, interactive = true }) {
  const [yaw, setYaw] = useState(0.4);
  const [pitch, setPitch] = useState(0.1);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(0);

  // Define 3D T-shirt vertices (Symmetric, with Z-depth for 3D body volume)
  // Coordinates are normalized between -1.8 and 1.8
  const vertices: { [key: string]: Point3D } = {
    // FRONT PANEL
    collar_front: { x: 0, y: -1.2, z: 0.35 },
    shoulder_l_front: { x: -0.9, y: -1.0, z: 0.3 },
    shoulder_r_front: { x: 0.9, y: -1.0, z: 0.3 },
    sleeve_top_l_front: { x: -1.7, y: -0.6, z: 0.25 },
    sleeve_bot_l_front: { x: -1.4, y: -0.1, z: 0.25 },
    underarm_l_front: { x: -0.85, y: -0.3, z: 0.3 },
    hem_l_front: { x: -0.8, y: 1.3, z: 0.25 },
    hem_r_front: { x: 0.8, y: 1.3, z: 0.25 },
    underarm_r_front: { x: 0.85, y: -0.3, z: 0.3 },
    sleeve_bot_r_front: { x: 1.4, y: -0.1, z: 0.25 },
    sleeve_top_r_front: { x: 1.7, y: -0.6, z: 0.25 },

    // BACK PANEL
    collar_back: { x: 0, y: -1.15, z: -0.35 },
    shoulder_l_back: { x: -0.9, y: -1.0, z: -0.3 },
    shoulder_r_back: { x: 0.9, y: -1.0, z: -0.3 },
    sleeve_top_l_back: { x: -1.7, y: -0.6, z: -0.25 },
    sleeve_bot_l_back: { x: -1.4, y: -0.1, z: -0.25 },
    underarm_l_back: { x: -0.85, y: -0.3, z: -0.3 },
    hem_l_back: { x: -0.8, y: 1.3, z: -0.25 },
    hem_r_back: { x: 0.8, y: 1.3, z: -0.25 },
    underarm_r_back: { x: 0.85, y: -0.3, z: -0.3 },
    sleeve_bot_r_back: { x: 1.4, y: -0.1, z: -0.25 },
    sleeve_top_r_back: { x: 1.7, y: -0.6, z: -0.25 },
  };

  // Define structured polygons (faces) to fill with soft luxury gradients/shadows
  const faces = [
    // Front Body
    ["collar_front", "shoulder_l_front", "underarm_l_front", "hem_l_front", "hem_r_front", "underarm_r_front", "shoulder_r_front"],
    // Back Body
    ["collar_back", "shoulder_l_back", "underarm_l_back", "hem_l_back", "hem_r_back", "underarm_r_back", "shoulder_r_back"],
    // Sleeve Left Front
    ["shoulder_l_front", "sleeve_top_l_front", "sleeve_bot_l_front", "underarm_l_front"],
    // Sleeve Right Front
    ["shoulder_r_front", "sleeve_top_r_front", "sleeve_bot_r_front", "underarm_r_front"],
    // Sleeve Left Back
    ["shoulder_l_back", "sleeve_top_l_back", "sleeve_bot_l_back", "underarm_l_back"],
    // Sleeve Right Back
    ["shoulder_r_back", "sleeve_top_r_back", "sleeve_bot_r_back", "underarm_r_back"],
  ];

  // Define skeletal outline connections (glowing wireframe)
  const wireframeLinks = [
    // Front outline
    ["collar_front", "shoulder_l_front"],
    ["shoulder_l_front", "sleeve_top_l_front"],
    ["sleeve_top_l_front", "sleeve_bot_l_front"],
    ["sleeve_bot_l_front", "underarm_l_front"],
    ["underarm_l_front", "hem_l_front"],
    ["hem_l_front", "hem_r_front"],
    ["hem_r_front", "underarm_r_front"],
    ["underarm_r_front", "sleeve_bot_r_front"],
    ["sleeve_bot_r_front", "sleeve_top_r_front"],
    ["sleeve_top_r_front", "shoulder_r_front"],
    ["shoulder_r_front", "collar_front"],

    // Back outline
    ["collar_back", "shoulder_l_back"],
    ["shoulder_l_back", "sleeve_top_l_back"],
    ["sleeve_top_l_back", "sleeve_bot_l_back"],
    ["sleeve_bot_l_back", "underarm_l_back"],
    ["underarm_l_back", "hem_l_back"],
    ["hem_l_back", "hem_r_back"],
    ["hem_r_back", "underarm_r_back"],
    ["underarm_r_back", "sleeve_bot_r_back"],
    ["sleeve_bot_r_back", "sleeve_top_r_back"],
    ["sleeve_top_r_back", "shoulder_r_back"],
    ["shoulder_r_back", "collar_back"],

    // Cross connectors (Depth bridges)
    ["collar_front", "collar_back"],
    ["shoulder_l_front", "shoulder_l_back"],
    ["shoulder_r_front", "shoulder_r_back"],
    ["sleeve_top_l_front", "sleeve_top_l_back"],
    ["sleeve_bot_l_front", "sleeve_bot_l_back"],
    ["sleeve_top_r_front", "sleeve_top_r_back"],
    ["sleeve_bot_r_front", "sleeve_bot_r_back"],
    ["hem_l_front", "hem_l_back"],
    ["hem_r_front", "hem_r_back"],
    ["underarm_l_front", "underarm_l_back"],
    ["underarm_r_front", "underarm_r_back"],
  ];

  // Auto-rotation engine
  useEffect(() => {
    if (!autoRotate) return;
    const animate = () => {
      if (!isDragging.current) {
        setYaw((prev) => (prev + 0.006) % (Math.PI * 2));
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [autoRotate]);

  // Interactive mouse dragging to rotate in 3D
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    setYaw((prev) => prev + deltaX * 0.007);
    setPitch((prev) => Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev + deltaY * 0.007)));

    previousMousePosition.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Convert 3D space coordinates to 2D projections
  const projectPoint = (pt: Point3D): { x: number; y: number; zDepth: number } => {
    // 1. Rotate around X axis (pitch)
    const cosP = Math.cos(pitch);
    const sinP = Math.sin(pitch);
    const y1 = pt.y * cosP - pt.z * sinP;
    const z1 = pt.y * sinP + pt.z * cosP;

    // 2. Rotate around Y axis (yaw)
    const cosY = Math.cos(yaw);
    const sinY = Math.sin(yaw);
    const x2 = pt.x * cosY + z1 * sinY;
    const z2 = -pt.x * sinY + z1 * cosY;

    // 3. Perspective Projection
    const cameraDistance = 3.5;
    const scale = cameraDistance / (cameraDistance + z2);

    // Map to pixel width and height
    const zoomMultiplier = Math.min(width, height) * 0.28;
    const screenX = width / 2 + x2 * scale * zoomMultiplier;
    const screenY = height / 2 + y1 * scale * zoomMultiplier;

    return { x: screenX, y: screenY, zDepth: z2 };
  };

  // Pre-calculate projections
  const projectedVertices: { [key: string]: { x: number; y: number; zDepth: number } } = {};
  Object.keys(vertices).forEach((key) => {
    projectedVertices[key] = projectPoint(vertices[key]);
  });

  // Sort faces based on average depth for painters algorithm
  const facesWithDepth = faces.map((faceKeys, idx) => {
    const depthSum = faceKeys.reduce((sum, key) => sum + projectedVertices[key].zDepth, 0);
    const avgDepth = depthSum / faceKeys.length;
    return { keys: faceKeys, depth: avgDepth, id: idx };
  });

  // Sort descending so furthest is rendered first
  facesWithDepth.sort((a, b) => b.depth - a.depth);

  return (
    <div
      className="relative select-none outline-none group cursor-grab active:cursor-grabbing"
      style={{ width, height }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      id="3d-tshirt-canvas-container"
    >
      <svg
        width={width}
        height={height}
        className="w-full h-full overflow-visible"
        style={{ perspective: 1000 }}
      >
        <defs>
          {/* Glowing neon gradients & high luxury shadows */}
          <linearGradient id="glowing-gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DFC389" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#C4A465" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#8A6F3E" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="wireframe-glow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8A6F3E" />
            <stop offset="50%" stopColor="#DFC389" />
            <stop offset="100%" stopColor="#8A6F3E" />
          </linearGradient>
          <filter id="glow-effect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. DRAW POLYGONAL FACES (WITH TRANSLUCENT PREMIUM SHADING) */}
        {facesWithDepth.map((face) => {
          const pathPoints = face.keys.map((key) => {
            const pt = projectedVertices[key];
            return `${pt.x},${pt.y}`;
          }).join(" ");

          return (
            <polygon
              key={`face-${face.id}`}
              points={pathPoints}
              fill="url(#glowing-gold-grad)"
              stroke="rgba(223, 195, 137, 0.08)"
              strokeWidth="0.8"
              className="transition-colors duration-300"
            />
          );
        })}

        {/* 2. DRAW GLOWING WIREFRAME SEGMENTS */}
        {wireframeLinks.map((link, idx) => {
          const p1 = projectedVertices[link[0]];
          const p2 = projectedVertices[link[1]];

          // Fade wireframe in/out depending on depth for luxurious three-dimensional feel
          const avgDepth = (p1.zDepth + p2.zDepth) / 2;
          const opacity = Math.max(0.15, Math.min(0.7, 0.5 - avgDepth * 0.25));

          return (
            <line
              key={`wire-${idx}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke="url(#wireframe-glow)"
              strokeWidth={avgDepth < 0 ? "1.5" : "0.75"}
              strokeOpacity={opacity}
              filter={avgDepth < -0.3 ? "url(#glow-effect)" : undefined}
            />
          );
        })}

        {/* 3. DRAW DRAFTING GRID VERTEX LABELS / DOTS FOR ARCHITECTURAL CAD LOOK */}
        {Object.keys(projectedVertices).map((key) => {
          const pt = projectedVertices[key];
          if (pt.zDepth > 0.5) return null; // Hide far-side dots for clarity

          return (
            <g key={`vertex-${key}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={key.includes("collar") || key.includes("hem") ? "3" : "1.8"}
                fill="#DFC389"
                fillOpacity="0.8"
                className="animate-pulse"
              />
              {/* Optional coordinate reading tag on hover for advanced CAD UI */}
              <text
                x={pt.x + 6}
                y={pt.y - 6}
                fill="rgba(245, 242, 236, 0.45)"
                fontSize="6"
                fontFamily="monospace"
                letterSpacing="0.05em"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              >
                {key.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

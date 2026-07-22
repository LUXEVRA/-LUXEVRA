const fs = require('fs');

let content = fs.readFileSync('assets/js/main.js', 'utf8');

const oldCanvasFunc = /function drawGarmentCanvas\(\) \{[\s\S]*?ctx\.restore\(\);\n\}/;

const newCanvasFunc = `let canvasAnimFrame = null;
function drawGarmentCanvas() {
  const canvas = document.getElementById("garmentCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  
  if (canvasAnimFrame) cancelAnimationFrame(canvasAnimFrame);

  let time = 0;
  const baseHex = appState.activeColor ? appState.activeColor.hex : "#c5a059";

  function render() {
    time += 0.02;
    ctx.clearRect(0, 0, w, h);

    // Deep luxury background
    const bgGrad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w);
    bgGrad.addColorStop(0, "#111111");
    bgGrad.addColorStop(1, "#000000");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Render spinning wireframe geometric mesh
    ctx.save();
    ctx.translate(w / 2, h / 2 + 10);
    
    // Slight breathing effect
    const scale = 1 + Math.sin(time * 2) * 0.02;
    ctx.scale(scale, scale);

    ctx.strokeStyle = "rgba(197, 160, 89, 0.4)"; // brand-gold with opacity
    ctx.lineWidth = 1;
    ctx.lineJoin = "round";
    
    // Tech-luxury wireframe lines
    ctx.beginPath();
    
    const points = [
      {x: -40, y: -80, z: 10}, {x: 40, y: -80, z: 10},
      {x: 70, y: -60, z: 20}, {x: -70, y: -60, z: 20},
      {x: 90, y: 0, z: 0}, {x: -90, y: 0, z: 0},
      {x: 50, y: 80, z: 10}, {x: -50, y: 80, z: 10},
      {x: 0, y: -90, z: 30}, {x: 0, y: 80, z: 30}
    ];

    // Project 3D to 2D with rotation
    const projected = points.map(p => {
      const cosT = Math.cos(time);
      const sinT = Math.sin(time);
      const xRot = p.x * cosT - p.z * sinT;
      const zRot = p.z * cosT + p.x * sinT;
      // Perspective projection
      const fov = 300;
      const zScale = fov / (fov + zRot);
      return { x: xRot * zScale, y: p.y * zScale };
    });

    // Draw interconnecting mesh
    for(let i=0; i<projected.length; i++) {
      for(let j=i+1; j<projected.length; j++) {
        // Only draw lines if distance is less than threshold
        const dx = points[i].x - points[j].x;
        const dy = points[i].y - points[j].y;
        const dz = points[i].z - points[j].z;
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        if (dist < 120) {
           ctx.moveTo(projected[i].x, projected[i].y);
           ctx.lineTo(projected[j].x, projected[j].y);
        }
      }
    }
    
    ctx.stroke();

    // Draw nodes
    ctx.fillStyle = "#e8d3a2";
    projected.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
    
    // Add grid floor
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.beginPath();
    for(let i = 0; i < h; i += 20) {
      const yOffset = (time * 10) % 20;
      ctx.moveTo(0, h/2 + i + yOffset);
      ctx.lineTo(w, h/2 + i + yOffset);
    }
    ctx.stroke();

    canvasAnimFrame = requestAnimationFrame(render);
  }

  render();
}`;

content = content.replace(oldCanvasFunc, newCanvasFunc);

// Check if successful
if (content.includes('let canvasAnimFrame = null;')) {
  fs.writeFileSync('assets/js/main.js', content);
  console.log('Successfully updated drawGarmentCanvas in main.js');
} else {
  console.log('Regex match failed.');
}


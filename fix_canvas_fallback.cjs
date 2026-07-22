const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldCanvas = `<canvas id="garmentCanvas" width="300" height="240" class="mx-auto rounded-none border border-[#1a1a1a] bg-black"></canvas>`;
const newCanvas = `<canvas id="garmentCanvas" width="300" height="240" class="mx-auto rounded-none border border-[#1a1a1a] bg-black">
              <img src="./assets/images/oversized_hoodie_1784392144459.jpg" alt="3D Garment Fallback" class="w-[300px] h-[240px] object-cover">
            </canvas>`;

content = content.replace(oldCanvas, newCanvas);
fs.writeFileSync('index.html', content);
console.log("Canvas fallback added");

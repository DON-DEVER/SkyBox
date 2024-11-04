import { Camera } from "./camera.js"; 
// Initialize PlayCanvas app
const app = new pc.Application(document.querySelector('.scene'), {
    mouse: new pc.Mouse(document.body),
    keyboard: new pc.Keyboard(document.body),
});
app.start();
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.scene.ambientLight = new pc.Color(0.6, 0.6, 0.6);

// Define variables
const originalBoxSize = 3;
let score = 0;
let gameStarted = false;
let stack = [];
const boxHeight = 1;  // height of each layer

window.focus();

const camera = new Camera(app);

// Lighting setup
const light = new pc.Entity();
light.addComponent("light", {
    type: "directional",
    color: new pc.Color(1, 1, 1),
});
light.setLocalPosition(10, 20, 0);
app.root.addChild(light);

function updateLightIntensity() {
  const cameraY = camera.getEntity().getPosition().y;
  const lightIntensity = 1.5 - (cameraY / boxHeight) * 0.02; 
  light.light.intensity = lightIntensity; 
}

// Create initial layers
addLayer(0, 0, originalBoxSize, originalBoxSize);
addLayer(-11, 0, originalBoxSize, originalBoxSize, 'x');

app.mouse.on(pc.EVENT_MOUSEDOWN, () => {
    if (!gameStarted) {
        
    } else {
        const topLayer = stack[stack.length - 1];
        const previousLayer = stack[stack.length - 2];
        const direction = topLayer.direction;
        const delta = topLayer.entity.getPosition()[direction] - previousLayer.entity.getPosition()[direction];
        const overHangpart = Math.abs(delta);
        const size = direction == 'x' ? topLayer.width : topLayer.depth;
        const overlap = size - overHangpart;

        if (overlap > 0) {
            score += 1;
            document.querySelector('h2').innerText = score;
            
            // Update layer dimensions
            const newWidth = direction == 'x' ? overlap : topLayer.width;
            const newDepth = direction == 'x' ? topLayer.depth : overlap;

            topLayer.width = newWidth;
            topLayer.depth = newDepth;
            topLayer.entity.setLocalScale(newWidth, boxHeight, newDepth);
            topLayer.entity.translateLocal(direction == 'x' ? -delta / 2 : 0, 0, direction == 'z' ? -delta / 2 : 0);

            // Add new layer
            const nextX = direction == 'x' ? topLayer.entity.getPosition().x : -10;
            const nextZ = direction == 'z' ? topLayer.entity.getPosition().z : -10;
            const nextDirection = direction == 'x' ? 'z' : 'x';
            addLayer(nextX, nextZ, newWidth, newDepth, nextDirection);
        } else {
            gameStarted = false;
            showScore();
        }
    }
});

function addLayer(x, z, width, depth, direction) {
    const y = boxHeight * stack.length - 1;
    const layer = createBox(x, y, z, width, depth);
    layer.direction = direction;
    stack.push(layer);
}

function createBox(x, y, z, width, depth) {
    const material = new pc.StandardMaterial();
    const color = calculateColor(y);
    material.diffuse.set(color.r, color.g, color.b);
    material.update();
  
    const box = new pc.Entity();
    box.addComponent("model", {
        type: "box",
        material: material
    });

    box.setLocalScale(width, boxHeight, depth);
    box.setPosition(x, y, z);
  
    app.root.addChild(box);
    return { entity: box, width, depth };
}

function calculateColor(y) {
    const minColor = new pc.Color(0.3, 0.5, 0.8); 
    const maxColor = new pc.Color(1, 1, 1); 
    const range = maxColor.r - minColor.r;
    const ratio = y / (boxHeight * 50); 
    const r = minColor.r + range * ratio;
    const g = minColor.g + range * ratio;
    const b = minColor.b + range * ratio;
    return new pc.Color(r, g, b);
}

function animation(dt) {
    const speed = 7 + (camera.getEntity().getPosition().y / 20) * 2; 
    const topLayer = stack[stack.length - 1];
    const direction = topLayer.direction;
    const position = topLayer.entity.getPosition();
    position[direction] += speed * dt;
  
    topLayer.entity.setPosition(position);
    if (camera.getEntity().getPosition().y < boxHeight * (stack.length - 2) + 4) {
      camera.getEntity().translateLocal(0, speed * dt, 0);
    }
    updateLightIntensity();
    camera.updateCameraZ();
}

function showScore() {
    const scorepage = document.querySelector('.score-page');
    const scorevalue = document.querySelector('.score-value');
    scorevalue.innerText = score;
    scorepage.style.display = 'flex';
}

// Resize event for responsive game window
window.addEventListener('resize', () => {
    app.resizeCanvas();
});

document.querySelector('.play-again').addEventListener('click', () => {
    const scorepage = document.querySelector('.score-page');
    scorepage.style.display = 'none';
    window.location.reload();
});

document.querySelector('.try-now').addEventListener('click', () => {
    document.querySelector('.welcome').style.display = 'none';
    gameStarted = true;
    app.on("update", animation); 
});


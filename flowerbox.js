import React, { StrictMode, useEffect } from "https://esm.sh/react";
import { createRoot } from "https://esm.sh/react-dom/client";
import * as THREE from "https://esm.sh/three";
const COLOR = {
    Red: 0xff0000,
    Blue: 0x0000ff,
    Green: 0x00ff00,
    Yellow: 0xffff00,
    Magenta: 0xff00ff,
    Cyan: 0x00ffff,
};
createRoot(document.getElementById("root")).render(React.createElement(StrictMode, null,
    React.createElement(FlowerBox, null)));
function FlowerBox() {
    const duration = 11; // in seconds
    const boxSize = 5;
    const boundsPadding = 6;
    useEffect(() => {
        var _a;
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        const aspect = window.innerWidth / window.innerHeight;
        const camera = new THREE.PerspectiveCamera(30, aspect, 1, 100);
        camera.position.set(0, 0, 50);
        const renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        // Root element
        (_a = document.body.firstElementChild) === null || _a === void 0 ? void 0 : _a.appendChild(renderer.domElement);
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);
        const dirLight = new THREE.DirectionalLight(0xffffff, 3.5);
        dirLight.position.set(0, 0, 1).normalize();
        scene.add(dirLight);
        // Create the box
        const geometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize, 24, 24, 24);
        const origPos = new Float32Array(geometry.attributes.position.array);
        const materialConfig = {
            side: THREE.FrontSide,
            specular: 0x404040,
            shininess: 40
        };
        const materials = [
            new THREE.MeshPhongMaterial(Object.assign({ color: COLOR.Yellow }, materialConfig)),
            new THREE.MeshPhongMaterial(Object.assign({ color: COLOR.Cyan }, materialConfig)),
            new THREE.MeshPhongMaterial(Object.assign({ color: COLOR.Magenta }, materialConfig)),
            new THREE.MeshPhongMaterial(Object.assign({ color: COLOR.Blue }, materialConfig)),
            new THREE.MeshPhongMaterial(Object.assign({ color: COLOR.Red }, materialConfig)),
            new THREE.MeshPhongMaterial(Object.assign({ color: COLOR.Green }, materialConfig))
        ];
        const mesh = new THREE.Mesh(geometry, materials);
        scene.add(mesh);
        let animationFrameId;
        let lastTime = performance.now();
        let vx = 3;
        let vy = -3;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const time = performance.now();
            const dt = (time - lastTime) / 1000;
            lastTime = time;
            // Movement
            mesh.rotation.order = "YXZ";
            mesh.rotation.x -= dt;
            mesh.rotation.x %= Math.PI * 2;
            mesh.rotation.y -= dt * 0.75;
            mesh.rotation.y %= Math.PI * 2;
            mesh.position.x += dt * vx;
            mesh.position.y += dt * vy;
            // Bouncing
            const fovRad = THREE.MathUtils.degToRad(camera.fov);
            const frustumHeight = 2 * Math.tan(fovRad / 2) * camera.position.z;
            const frustumWidth = frustumHeight * camera.aspect;
            const boundX = frustumWidth / 2 - boundsPadding;
            const boundY = frustumHeight / 2 - boundsPadding;
            if (mesh.position.x > boundX) {
                mesh.position.x = boundX;
                vx = -Math.abs(vx);
            }
            if (mesh.position.x < -boundX) {
                mesh.position.x = -boundX;
                vx = Math.abs(vx);
            }
            if (mesh.position.y > boundY) {
                mesh.position.y = boundY;
                vy = -Math.abs(vy);
            }
            if (mesh.position.y < -boundY) {
                mesh.position.y = -boundY;
                vy = Math.abs(vy);
            }
            // Morph animation
            const phases = 4;
            const t = (time / 1e3 % duration) / (duration / phases);
            const phase = Math.floor(t);
            const progress = t - phase;
            // Determine the corner multiplier based on the phase
            const cornerMultiplierBase = 1.375;
            let cornerMultiplier;
            switch (phase) {
                // balloon to spikes
                case 1:
                    cornerMultiplier = cornerMultiplierBase * -progress;
                    break;
                // spikes to balloon
                case 2:
                    cornerMultiplier = cornerMultiplierBase * (-1 + progress);
                    break;
                // balloon to cube
                case 3:
                    cornerMultiplier = cornerMultiplierBase * progress;
                    break;
                // cube to balloon
                default:
                    cornerMultiplier = cornerMultiplierBase * (1 - progress);
                    break;
            }
            // Calculate the morphed vertex positions
            const pos = geometry.attributes.position.array;
            for (let i = 0; i < origPos.length; i += 3) {
                const x = origPos[i];
                const y = origPos[i + 1];
                const z = origPos[i + 2];
                // Normalize coords to determine if the vertex is near a face center or corner
                const u = x / (boxSize / 2);
                const v = y / (boxSize / 2);
                const w = z / (boxSize / 2);
                // Determine how close to a corner the vertex is
                const distFromCubeCenter = Math.hypot(u, v, w);
                const weight = (distFromCubeCenter - 1) / (Math.sqrt(3) - 1);
                // Calculate the morph factor
                const scale = 1 - weight + (weight * cornerMultiplier);
                pos[i] = x * scale;
                pos[i + 1] = y * scale;
                pos[i + 2] = z * scale;
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.computeVertexNormals();
            renderer.render(scene, camera);
        };
        animate();
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(animationFrameId);
            renderer.domElement.remove();
            renderer.dispose();
            geometry.dispose();
            materials.forEach(mat => mat.dispose());
        };
    }, []);
    return null;
}

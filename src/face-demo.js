// src/face-demo.js
import * as THREE from 'three';
import { MindARThree } from '../vendor/mindar/mindar-face-three.prod.js';
import { setStatus, setupStartButton } from './common.js';

const ANCHOR_INDEX = 168; 
const GLASSES_SCALE = 1.45; // Ukuran diperbesar untuk menyesuaikan kepala
const GLASSES_OFFSET = { x: 0, y: 0.75, z: 0.0 }; // Posisi Y sedikit dinaikkan mengimbangi ukuran yang membesar

function createRose(isPink) {
    const roseGroup = new THREE.Group();
    const color = isPink ? 0xffb6c1 : 0xfffdd0; 
    const mat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.6, side: THREE.DoubleSide });
    
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.005, 0.02, 8), mat);
    roseGroup.add(center);
    
    for(let i = 0; i < 12; i++) {
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.015, 8, 8), mat);
        petal.scale.set(1, 1.2, 0.2); 
        const angle = i * Math.PI * 0.7; 
        const radius = 0.005 + (i * 0.002);
        
        petal.position.set(Math.cos(angle) * radius, 0.01 + (i * 0.001), Math.sin(angle) * radius);
        petal.rotation.y = -angle;
        petal.rotation.x = 0.2 + (i * 0.05); 
        roseGroup.add(petal);
    }
    return roseGroup;
}

function createLeaf() {
    const mat = new THREE.MeshStandardMaterial({ color: 0x4f7942, roughness: 0.8 });
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), mat);
    leaf.scale.set(1, 0.2, 2.5); 
    return leaf;
}

function buildGlasses() {
    const g = new THREE.Group();
    const vineMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 }); 

    for (let i = 0; i < 2; i++) {
        const vine = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.006, 8, 64), vineMat);
        vine.rotation.x = Math.PI / 2;
        vine.rotation.y = i * 0.1; 
        vine.scale.set(1, 1, 0.85); 
        g.add(vine);
    }

    const flowerCount = 9;
    for (let i = 0; i < flowerCount; i++) {
        const angle = -Math.PI / 2 + (i * (Math.PI / (flowerCount - 1)));
        
        const isPink = i % 2 === 0;
        const rose = createRose(isPink);
        
        const x = Math.cos(angle) * 0.24;
        const z = Math.sin(angle) * 0.204; 
        
        rose.position.set(x, 0.02, z);
        rose.rotation.x = Math.PI / 2;
        rose.rotation.y = -angle + Math.PI/2;
        g.add(rose);

        for(let j = 0; j < 2; j++) {
            const leaf = createLeaf();
            leaf.position.set(x + (Math.random() - 0.5) * 0.04, 0.01, z + (Math.random() - 0.5) * 0.04);
            leaf.rotation.y = Math.random() * Math.PI;
            leaf.rotation.z = (Math.random() - 0.5) * 0.5;
            g.add(leaf);
        }
    }

    g.scale.setScalar(GLASSES_SCALE);
    g.position.set(GLASSES_OFFSET.x, GLASSES_OFFSET.y, GLASSES_OFFSET.z);
    
    return g;
}

async function start() {
    const mindarThree = new MindARThree({ container: document.getElementById('container') });
    const { renderer, scene, camera } = mindarThree;
    
    const anchor = mindarThree.addAnchor(ANCHOR_INDEX);
    anchor.group.add(buildGlasses());
    
    scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.4));
    const dir = new THREE.DirectionalLight(0xffffff, 1.2);
    dir.position.set(0, 1, 2);
    scene.add(dir);
    
    await mindarThree.start();
    setStatus('Mencari wajah', 'searching');
    
    let hadFace = false, lostCount = 0;
    renderer.setAnimationLoop(() => {
        const hasFace = mindarThree.getLatestEstimate() !== null;
        if (hasFace !== hadFace) {
            hadFace = hasFace;
            if (hasFace) setStatus('Wajah terdeteksi', 'found');
            else { 
                lostCount++; 
                setStatus('Wajah tidak terdeteksi - mencari wajah', 'searching'); 
                document.getElementById('info').textContent = 'Wajah hilang ' + lostCount + ' kali.';
            }
        }
        renderer.render(scene, camera);
    });
}
setupStartButton(start);
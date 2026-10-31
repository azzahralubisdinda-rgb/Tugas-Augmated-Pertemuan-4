// src/image-demo.js
import * as THREE from 'three';
import { MindARThree } from '../vendor/mindar/mindar-image-three.prod.js';
import { setStatus, setupStartButton } from './common.js';

const TARGET_SRC = './targets/target-card.mind'; 
const TARGET_ASPECT = 372 / 674;
let foundCount = 0;

async function start() {
    const mindarThree = new MindARThree({
        container: document.getElementById('container'),
        imageTargetSrc: TARGET_SRC,
    });
    
    const { renderer, scene, camera } = mindarThree;
    const anchor = mindarThree.addAnchor(0);
    
    const frame = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, TARGET_ASPECT)),
        new THREE.LineBasicMaterial({ color: 0x14b8a6 })
    );
    anchor.group.add(frame);
    
    // --- MEMBUAT OBJEK GABUNGAN ---
    const compositeObject = new THREE.Group();
    compositeObject.position.set(0, 0, 0.2); // Melayang di atas target

    // 1. Bola di bagian tengah
    const centerSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 32, 32),
        new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2, metalness: 0.5 }) // Merah
    );
    compositeObject.add(centerSphere);

    // 2. Torus Knot (objek sebelumnya) yang mengelilingi bola
    const surroundingKnot = new THREE.Mesh(
        new THREE.TorusKnotGeometry(0.12, 0.02, 128, 16, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.1, metalness: 0.8 }) // Ungu metalik
    );
    compositeObject.add(surroundingKnot);

    // Memasukkan grup objek ke dalam anchor
    anchor.group.add(compositeObject);
    
    scene.add(new THREE.HemisphereLight(0xffffff, 0x667788, 1.2));
    const dir = new THREE.DirectionalLight(0xffffff, 1.5);
    dir.position.set(0.5, 1, 1);
    scene.add(dir);
    
    anchor.onTargetFound = () => {
        foundCount++;
        setStatus('Target terdeteksi', 'found');
        document.getElementById('info').textContent = 'Target ditemukan ' + foundCount + ' kali.';
    };
    
    anchor.onTargetLost = () => {
        setStatus('Target hilang - mencari target', 'searching');
    };
    
    await mindarThree.start();
    setStatus('Mencari target', 'searching');
    const clock = new THREE.Clock();
    
    renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        // Memutar seluruh grup secara perlahan
        compositeObject.rotation.y += delta * 1.0;
        // Memutar cincin jalinan secara independen agar terlihat dinamis mengelilingi bola
        surroundingKnot.rotation.x += delta * 2.0; 
        surroundingKnot.rotation.z += delta * 1.5;
        
        renderer.render(scene, camera);
    });
}
setupStartButton(start);
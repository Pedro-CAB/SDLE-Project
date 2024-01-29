// BoxBuilder.js
import ObjectBuilderBase from './ObjectBuilderBase.js';
import * as THREE from 'three';

class BoxBuilder extends ObjectBuilderBase {
    constructor(material, data) {
        super(material);
        this.data = data;
    }

    build() {
        // Alógica de construção da caixa
        const width = Math.abs(this.data.xyz1[0] - this.data.xyz2[0]);
        const height = Math.abs(this.data.xyz1[1] - this.data.xyz2[1]);
        const depth = Math.abs(this.data.xyz1[2] - this.data.xyz2[2]);
        const midpoint = [
            (this.data.xyz1[0] + this.data.xyz2[0]) / 2,
            (this.data.xyz1[1] + this.data.xyz2[1]) / 2,
            (this.data.xyz1[2] + this.data.xyz2[2]) / 2,
        ];

        const boxGeometry = new THREE.BoxGeometry(width, height, depth);
        const boxMesh = new THREE.Mesh(boxGeometry, this.material);
        boxMesh.position.set(...midpoint);

        return boxMesh;
    }
}

export default BoxBuilder;

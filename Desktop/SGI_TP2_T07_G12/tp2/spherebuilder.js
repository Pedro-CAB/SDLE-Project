// SphereBuilder.js
import ObjectBuilderBase from './ObjectBuilderBase.js';
import * as THREE from 'three';

class SphereBuilder extends ObjectBuilderBase {
    constructor(material, data) {
        super(material);
        this.data = data;
    }

    build() {
        const sphere = new THREE.SphereGeometry(
            this.data.radius,
            this.data.widthSegments,
            this.data.heightSegments
        );

        const mesh = new THREE.Mesh(sphere, this.material);
        return mesh;
    }
}

export default SphereBuilder;

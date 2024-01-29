// MySphere.js

import * as THREE from 'three';


export default class MySphere {
    constructor(material, data) {
        this.material = material;
        this.data = data;
    }

    build() {
        const { radius, widthSegments, heightSegments, phiStart, phiLength, thetaStart, thetaLength } = this.data;

        const sphereGeometry = new THREE.SphereGeometry(
            radius,
            widthSegments,
            heightSegments,
            phiStart,
            phiLength,
            thetaStart,
            thetaLength
        );

        const sphereMesh = new THREE.Mesh(sphereGeometry, this.material);

        // Aqui você pode adicionar qualquer configuração adicional que desejar
        sphereMesh.castShadow = true; // Ajuste de acordo com sua necessidade
        sphereMesh.receiveShadow = true; // Ajuste de acordo com sua necessidade

        return sphereMesh;
    }
}

import * as THREE from 'three';

class MyCylinder {
    constructor(material, data) {
        this.material = material;
        this.data = data;
    }

    build() {
        // Extraia os valores de 'radius' e 'height' dos dados
        const { radius, height } = this.data;

        // Defina valores padrão para os outros parâmetros
        const radialSegments = 32; // Um valor padrão razoável
        const openEnded = false; // Suponha que o cilindro não seja aberto nas extremidades

        // Use os mesmos valores de 'radius' para o topo e a base do cilindro
        const cylinderGeometry = new THREE.CylinderGeometry(
            radius, // raio do topo
            radius, // raio da base
            height, // altura
            radialSegments, // segmentos radiais
            1, // segmentos de altura (um único segmento)
            openEnded // se é aberto nas extremidades
        );

        const cylinderMesh = new THREE.Mesh(cylinderGeometry, this.material);
        
        // Ajuste a posição do cilindro, se necessário
        cylinderMesh.position.set(
            this.data.position.x, 
            this.data.position.y, 
            this.data.position.z
        );

        return cylinderMesh;
    }

    
}

export default MyCylinder;

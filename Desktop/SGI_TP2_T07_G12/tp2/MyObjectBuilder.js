// MyObjectBuilder.js
import * as THREE from 'three';
import BoxBuilder from './BoxBuilder.js';
import { MyNurbsBuilder } from './MyNurbsBuilder.js';
import SphereBuilder from './spherebuilder.js';
import MyCylinder from './my_cylinder.js';
import MySphere from './MySphere.js';


/**
 * This class constructs each kind of available primitive
 * and light 
 */
class MyObjectBuilder {
    /**
     * constructs the object
     * @param {THREE.Scene} scene three.js `Scene` object
     */
    constructor(scene) {
        this.scene = scene

        this.currentMaterial = null
        this.castShadows = false
        this.receiveShadows = false
    }

    /**
     * sets the shadow properties of meshes to be built
     * @param {boolean} castShadows whether to cast shadows
     * @param {boolean} receiveShadows whether to receive shadows
     */
    setShadowSettings(castShadows, receiveShadows) {
        this.castShadows = castShadows
        this.receiveShadows = receiveShadows
    }

    /**
     * sets the material to use in mesh creation
     * @param {THREE.Material} material 
     */
    setMaterial(material) {
        this.material = material
    }

    /**
     * creates a box object via `THREE.BoxGeometry`
    * @param {*} data data related to primitive geometry
     * @returns {THREE.Mesh}
     */

    buildSphere(data) {
        const sphere = new THREE.SphereGeometry(
            data.radius,
            data.slices,
            data.stacks,
            data.phistart,
            data.philength,
            data.thetastart,
            data.thetalength
        )

        const mesh = new THREE.Mesh(sphere, this.material)
        mesh.castShadow = this.castShadows
        mesh.receiveShadow = this.receiveShadows
        return mesh
    }

    buildPrimitive(data) {
        const primitive_data = data.representations[0];
        let object;
    
        switch (data.subtype) {
            case 'box':
                object = new BoxBuilder(this.material, primitive_data).build();
                break;
            case 'cylinder':
                object = new MyCylinder(this.material, primitive_data).build();
                break;
            case 'sphere':
                object = new MySphere(this.material, primitive_data).build();
                break;
            // ...outros casos...
        }
    
        // Configure o objeto com propriedades comuns de sombreamento
        if (object) {
            this.configureMesh(object);
            return object;
        } else {
            throw new Error('Unrecognized primitive type: ' + data.subtype);
        }
    }
    
    configureMesh(mesh) {
        mesh.castShadow = this.castShadows;
        mesh.receiveShadow = this.receiveShadows;
        // Qualquer outra configuração comum
    }
    
    /**
     * creates a NURBS surface via a helper NURBS builder class
     * @param {*} data data related to the NURBS surface
     * @returns {THREE.Mesh}
     */
    buildNurbs(data) {
        const surface_data = MyNurbsBuilder.build(
            data.controlpoints,
            data.degree_u,
            data.degree_v,
            data.parts_u,
            data.parts_v
        )

        const mesh = new THREE.Mesh(surface_data, this.material)
        mesh.castShadow = this.castShadows
        mesh.receiveShadow = this.receiveShadows
        return mesh
    }

    /**
     * creates a sphere object via `THREE.SphereGeometry`
     * @param {*} data data related to the sphere geometry
     * @returns {THREE.Mesh}
     */
    

  
    
    /**
     * creates a triangle object via `THREE.BufferGeometry`
     * @param {*} data 
     */
    buildTriangle(data) {
        const pA = new THREE.Vector3(...data.xyz1)
        const pB = new THREE.Vector3(...data.xyz2)
        const pC = new THREE.Vector3(...data.xyz3)
        const positions = [...pA.toArray(), ...pB.toArray(), ...pC.toArray()]
 
        const cb = new THREE.Vector3().subVectors(pC, pB)
        const ab = new THREE.Vector3().subVectors(pA, pB)
        cb.cross(ab)
        cb.normalize()


        const nx = cb.x
        const ny = cb.y
        const nz = cb.z
        const normals = [
            nx, ny, nz,
            nx, ny, nz,
            nx, ny, nz
        ]
        
		const indices = [
            0, 1, 2
        ];

        //TEXTURE COORDINATES
        let a = pA.distanceTo(pB);
        let b = pB.distanceTo(pC);
        let c = pA.distanceTo(pC);


        let cos_ac = (a * a - b * b + c * c) / (2 * a * c)
        let sin_ac = Math.sqrt(1 - cos_ac * cos_ac)
        const uvs = [
			0, 0,
			1 , 0,
			1 * cos_ac, 1 * sin_ac
		]

        function disposeArray() {
            this.array = null
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setIndex(indices)
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3).onUpload(disposeArray))
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray))
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2).onUpload(disposeArray))
        
        geometry.computeBoundingSphere()

        const mesh = new THREE.Mesh(geometry, this.material)
        mesh.castShadow = this.cashShadows
        mesh.receiveShadow = this.receiveShadows

        return mesh
    }

    buildPolygon(data) {
        const unitCircleVertices = []
        const sideNormals = []
        const vertices = []
        const indices = []
        const normals = []
        const texCoords = []
        const colors = []

        function getSideNormals() {
            const sliceStep = 2 * Math.PI / data.slices
            const zAngle = Math.atan2(data.radius, 1)
            const x = Math.cos(zAngle)
            const y = 0
            const z = Math.sin(zAngle)

            for (let slice = 0; slice <= data.slices; ++slice) {
                const sliceAngle = slice * sliceStep
                sideNormals.push(
                    Math.cos(sliceAngle)*x - Math.sin(sliceAngle)*y,   
                    Math.sin(sliceAngle)*x + Math.cos(sliceAngle)*y,   
                    z
                )
            }
        }   

        function buildUnitCircleVertices() {
            const sliceStep = 2 * Math.PI / data.slices
            for (let slice = 0; slice <= data.slices; ++slice) {
                const sliceAngle = slice * sliceStep
                unitCircleVertices.push(
                    Math.cos(sliceAngle),  
                    Math.sin(sliceAngle),   
                    0
                )
            }
        }

        getSideNormals()
        buildUnitCircleVertices()

        for(var stack = 0; stack <= data.stacks; ++stack) {
            const z = -0.5 + stack / data.stacks
            const radius = data.radius + stack / data.stacks * (-data.radius)
            const t = 1 - stack / data.stacks   // top to bottom
            for(var slice = 0, k = 0; slice <= data.slices; ++slice, k+=3) {
                const x = unitCircleVertices[k]
                const y = unitCircleVertices[k+1]

                vertices.push(x * radius, y * radius, z)
                normals.push(sideNormals[k], sideNormals[k+1], sideNormals[k+2])
                texCoords.push(slice / data.slices, t)
            }
        }

        const baseVertexIndex = vertices.length / 3
        let z = -0.5
        for(let slice = 0, j = 0; slice <= data.slices; ++slice, j += 3) {
            const x = unitCircleVertices[j]
            const y = unitCircleVertices[j+1]
            vertices.push(x * data.radius, y * data.radius, z)
            normals.push(0, 0, -1)
            texCoords.push(-x * 0.5 + 0.5, -y * 0.5 + 0.5)
        }

        const topVertexIndex = vertices.length / 3
        z = 0.5
        vertices.push(0, 0, z)
        normals.push(0, 0, 1)
        texCoords.push(0.5, 0.5)
        for(let slice = 0, i = 0; slice <= data.slices; ++slice, i += 3) {
            const x = unitCircleVertices[i]
            const y = unitCircleVertices[i+1]

            vertices.push(0, 0, z)
            normals.push(0, 0, 1)
            texCoords.push(x * 0.5 + 0.5, -y * 0.5 + 0.5)
        }

        for(var stack = 0; stack < data.stacks; ++stack) {
            let k1 = stack*(data.slices+1)
            let k2 = k1 + data.slices + 1
            for(var slice = 0; slice < data.slices; ++slice, ++k1, ++k2) {
                indices.push(k1, k1+1, k2)
                indices.push(k2, k1+1, k2+1)
            }
        }

        for(let i = 0, k = baseVertexIndex + 1; i < data.slices; ++i, ++k) {
            if (i < (data.slices - 1))
                indices.push(baseVertexIndex, k + 1, k)
            else
                indices.push(baseVertexIndex, baseVertexIndex + 1, k)
        }

        for(let i = 0, k = topVertexIndex + 1; i < data.slices; ++i, ++k)
        {
            if (i < (data.slices - 1))
                indices.push(topVertexIndex, k, k + 1);
            else
                indices.push(topVertexIndex, k, topVertexIndex + 1);
        }
        
        function disposeArray() {
            this.array = null
        }

        const geometry = new THREE.BufferGeometry()
        geometry.setIndex(indices)
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3).onUpload(disposeArray))
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3).onUpload(disposeArray))
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(texCoords, 2).onUpload(disposeArray))
        
        geometry.computeBoundingSphere()

        const mesh = new THREE.Mesh(geometry, this.material)
        mesh.castShadow = this.cashShadows
        mesh.receiveShadow = this.receiveShadows

        return mesh
    }
    /**
     * creates a plane object via `THREE.PlaneGeometry`
     * @param {*} data data related to the plane geometry
     * @returns {THREE.Mesh}
     */
    buildRectangle(data) {
        const width = Math.abs(data.xy1[0] - data.xy2[0])
        const height = Math.abs(data.xy1[1] - data.xy2[1])
        const midpoint = [
            Math.abs(data.xy1[0] + data.xy2[0]) / 2,
            Math.abs(data.xy1[1] + data.xy2[1]) / 2,
            0
        ]

        const rectangle = new THREE.PlaneGeometry(
            width,
            height,
            data.parts_x,
            data.parts_y
        )

        const mesh = new THREE.Mesh(rectangle, this.material)
        mesh.position.set(...midpoint)
        mesh.castShadow = this.castShadows
        mesh.receiveShadow = this.receiveShadows
        this.material.map.repeat.set(
            width / this.material.texlength_s,
            height / this.material.texlength_t
        )
        return mesh
    }

    /**
     * creates a cylinder object via `THREE.CylinderGeometry`
     * @param {*} data data related to the cylinder geometry
     * @returns {THREE.Mesh}
     */
    buildCylinder(data) {
        const cylinder = new THREE.CylinderGeometry(
            data.top,
            data.base,
            data.height,
            data.slices,
            data.stacks,
            data.capsclose,
            data.thetastart,
            data.thetalength
        )

        const mesh = new THREE.Mesh(cylinder, this.material)
        mesh.castShadow = this.castShadows
        mesh.receiveShadow = this.receiveShadows
        // TODO?: change texture repeat with texlength_s and texlength_t
        return mesh
    }

    /**
     * delegates the primitive construction to each specific primitive builder method
     * @param {*} data data related to primitive geometry
     * @returns {THREE.Mesh}
     */
    buildPrimitive(data) {
        const primitive_data = data.representations[0];
        let builder;
    
        switch(data.subtype) {
            case 'rectangle':
                // Retenha a lógica para 'rectangle' se você ainda não criou um 'RectangleBuilder'
                return this.buildRectangle(primitive_data);
            case 'cylinder':
                // Similar para 'cylinder' e outros tipos...
                return this.buildCylinder(primitive_data);
            case 'box':
                // Aqui você usa a nova classe 'BoxBuilder'
                builder = new BoxBuilder(this.material, primitive_data);
                break;
            case 'sphere':
                return this.buildSphere(primitive_data);
            case 'triangle':
                return this.buildTriangle(primitive_data);
            case 'polygon':
                return this.buildPolygon(primitive_data);
                case 'sphere':
                    builder = new SphereBuilder(this.material, primitive_data);
                    break
            // Outros casos conforme necessário...
        }
    
        if (builder) {
            return builder.build();
        } else {
            throw new Error('Unrecognized primitive type: ' + data.subtype);
        }

        
    }
    

    /**
     * creates a new `THREE.SpotLight` instance
     * @param {*} data data related to the spot light
     * @returns {THREE.SpotLight}
     */
    buildSpotLight(data) {
        const spotLight = new THREE.SpotLight(
            data.color,
            data.intensity,
            data.distance,
            data.angle * Math.PI / 180,
            data.penumbra,
            data.decay
        )
        spotLight.name = data.id
        spotLight.position.set(...data.position)
        spotLight.visible = data.enabled
        spotLight.castShadow = data.castshadow
        spotLight.shadow.camera.far = data.shadowfar
        spotLight.shadow.mapSize = new THREE.Vector2(...Array(2).fill(data.shadowmapsize))
        spotLight.target.position.set(...data.target)
        this.scene.add(spotLight.target)
        /*
        const helper = new THREE.SpotLightHelper(spotLight)
        this.scene.add(helper)
        */
        return spotLight
    }

    /**
     * creates a new `THREE.PointLight` instance
     * @param {*} data data related to the point light
     * @returns {THREE.PointLight}
     */
    buildPointLight(data) {
        const pointLight = new THREE.PointLight(
            data.color,
            data.intensity,
            data.distance,
            data.decay
        )
        pointLight.name = data.id
        pointLight.position.set(...data.position)
        pointLight.visible = data.enabled
        pointLight.castShadow = data.castshadow
        pointLight.shadow.camera.far = data.shadowfar
        pointLight.shadow.mapSize = new THREE.Vector2(...Array(2).fill(data.shadowmapsize))

        return pointLight
    }

    /**
     * creates a new `THREE.DirectionalLight` instance
     * @param {*} data data related to the directional light
     * @returns {THREE.DirectionalLight}
     */
    buildDirectionalLight(data) {
        const directionalLight = new THREE.DirectionalLight(
            data.color,
            data.intensity
        )
        directionalLight.name = data.id
        directionalLight.position.set(...data.position)
        directionalLight.target.updateMatrixWorld();
        directionalLight.visible = data.enabled
        directionalLight.castShadow = data.castshadow
        directionalLight.shadow.camera.far = data.shadowfar
        directionalLight.shadow.camera.left = data.shadowleft
        directionalLight.shadow.camera.right = data.shadowright
        directionalLight.shadow.camera.top = data.shadowtop
        directionalLight.shadow.camera.bottom = data.shadowbottom
        directionalLight.shadow.mapSize = new THREE.Vector2(...Array(2).fill(data.shadowmapsize))
        /*
        const helper = new THREE.DirectionalLightHelper(directionalLight)
        const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
        this.scene.add(helper)
        this.scene.add(shadowHelper)
        */
        return directionalLight
    }

    /**
     * delegates the construction of the object (primitive or light) to their specific methods
     * @param {*} data data related to the object
     * @param {*} material material to use in the mesh
     * @returns {THREE.Mesh}
     */
    buildObject(data) {
        switch(data.type) {
            case 'primitive':
                return this.buildPrimitive(data)
            case 'pointlight':
                return this.buildPointLight(data)
            case 'spotlight':
                return this.buildSpotLight(data)
            case 'directionallight':
                return this.buildDirectionalLight(data)
        }
    }
}

export { MyObjectBuilder }
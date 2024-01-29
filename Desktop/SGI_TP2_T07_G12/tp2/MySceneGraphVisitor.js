import * as THREE from 'three';
import { MyObjectBuilder } from './MyObjectBuilder.js';

/**
 * This class recursively visits and constructs the objects 
 * from the scene graph
 */
class MySceneGraphVisitor {
    
    /**
     * constructs the class object
     * @param {*} materials array of scene materials
     */
    constructor(scene, materials) {
        this.materials = materials
        this.groups = {}
        this.objectBuilder = new MyObjectBuilder(scene)
    }
    /**
     * updates the default values if the current node overrides them
     * @param {*} node current visited node 
     * @param {*} defaults default values object
     */
    updateDefaults(node, defaults) {
        defaults.material = node.materialIds[0] || defaults.material
        defaults.castShadows = node.castShadows || defaults.castShadows
        defaults.receiveShadows = node.receiveShadows || defaults.receiveShadows
    }

    /**
     * creates a new group with the current visited node's *id* as its name
     * @param {*} id current visited node *id*
     */
    createGroup(id) {
        const group = new THREE.Group()
        group.name = id
        this.groups[id] = group
    }

    /**
     * apply geometric transformations to the group with the specified `id`
     * @param {string} id group id
     * @param {*} transformations array of transformations to be applied
     */
    applyTransformations(id, transformations) {
        const group = this.groups[id]
     
        let position = [0, 0, 0]
        let rotation = [0, 0, 0]
        let scale = [1, 1, 1]

        transformations.forEach((transformation) => {
            switch(transformation.type) {
                case 'T':
                    position = position.map((v, i) => v + transformation.translate[i])
                    break;
                case 'R':
                    rotation = rotation.map((v, i) => v + transformation.rotation[i] * Math.PI / 180)
                    break;
                case 'S':
                    scale = scale.map((v, i) => v * transformation.scale[i])
                    break;
            }
        })

        group.position.set(...position)
        group.rotation.set(...rotation)
        group.scale.set(...scale)      
    }

    /**
     * recursive depth first search of scene graph
     * @param {*} node node to visit
     * @param {*} defaults default object values
     * @param {Array} visited array of visited nodes
     */
    visitSceneGraph(node, {...defaults}, visited = []) {
        // Visit children if node is not a leaf (primitive or light)
        if(node.type === "node") {
            visited.push(node.id)

            this.createGroup(node.id)
            this.updateDefaults(node, defaults)
            this.applyTransformations(node.id, node.transformations)
            //console.log(node, node.id, node.type, defaults.material)
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i]
                /*
                if (visited.includes(child.id) && 
                    !(node.transformations || node.materialIds)) {
                    // Clone the `child` instance (always of type.node = 'node' => a group)
                    // Only clone if no overrides are performed (in terms of defaults and transformations)
                    //console.log('clone', child.id, child.type, defaults.material)
                    const clone = this.groups[child.id].clone()
                    this.groups[node.id].add(clone)
                    continue
                }
                */           
                this.groups[node.id].add(this.visitSceneGraph(child, defaults, visited))
            }
            return this.groups[node.id]
        }
        else {
            // Construct primitive / light / lod object from leaf node
            //console.log(node, node.type, defaults.material)
            this.objectBuilder.setShadowSettings(defaults.castShadows, defaults.receiveShadows)
            this.objectBuilder.setMaterial(this.materials[defaults.material])
            
            if(node.type == 'lod') {
                const lod = new THREE.LOD()
                for (let i = 0; i < node.children.length; i++) {
                    const child = node.children[i]
                    lod.addLevel(this.visitSceneGraph(child.node, defaults, visited), child.mindist)
                }
                return lod
            } else
                return this.objectBuilder.buildObject(node)
        }
    }
}

export { MySceneGraphVisitor }
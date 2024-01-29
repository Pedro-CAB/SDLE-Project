import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyFileReader } from './parser/MyFileReader.js';
import { MySceneGraphVisitor } from './MySceneGraphVisitor.js';
/**
 *  This class contains the contents of our application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app
        this.axis = null

        this.ambientLight = null

        this.materials = []
        this.textures = []
        this.objects = null

        // create default texture and material
        this.initializeDefaults()

        this.reader = new MyFileReader(app, this, this.onSceneLoaded);
		this.reader.open("scenes/sgi_t2_amilton_koxi/SGI_TP2_XML_T07_G00_v01.xml");


    }

    /**
     * initializes the contents
     */
    init() {
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }
    }

    /**
     * initializes default values for texture and material
     */
    initializeDefaults() {
        this.textures['default'] = 
            new THREE.TextureLoader().load('scenes/demo/textures/default.png')
        this.textures['default'].wrapS = THREE.RepeatWrapping
        this.textures['default'].wrapT = THREE.RepeatWrapping

        this.materials['default'] = 
            new THREE.MeshPhongMaterial(
                {color: "#cfcfcf", map: this.textures['default']}
            )
        this.materials['default'].texlength_s = 1.0
        this.materials['default'].texlength_t = 1.0
    }

    /**
     * load an image and create a mipmap to be added to a texture at the defined level.
     * In between, add the image some text and control squares. These items become part of the picture
     * 
     * @param {*} parentTexture the texture to which the mipmap is added
     * @param {*} level the level of the mipmap
     * @param {*} path the path for the mipmap image
    // * @param {*} size if size not null inscribe the value in the mipmap. null by default
    // * @param {*} color a color to be used for demo
     */
    loadMipmap(parentTexture, level, path)
    {
        // load texture. On loaded call the function to create the mipmap for the specified level 
        new THREE.TextureLoader().load(path, 
            function(mipmapTexture)  // onLoad callback
            {
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')
                
                const img = mipmapTexture.image         
                canvas.width = Math.max(1, img.width >> level);  // Ensure mipmap size is correct
                canvas.height = Math.max(1, img.height >> level);  // Ensure mipmap size is correct
    
                // first draw the image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
                             
                // set the mipmap image in the parent texture in the appropriate level
                parentTexture.mipmaps[level] = canvas
                parentTexture.needsUpdate = true;  // Mark texture for update
            },
            undefined, // onProgress callback currently not supported
            function(err) {
                console.error('Unable to load the image ' + path + ' as mipmap level ' + level + ".", err)
            }
        )
    }
    
    
    

    /**
     * create scene's ambient light
     * @param {*} color ambient light color
     */
    setAmbientLight(color) {
        const ambientLight = new THREE.AmbientLight(color)
        this.app.scene.add(ambientLight)
    }

    /**
     * create a new texture
     * @param {*} data texture data
     */
    buildTexture(data) {
        let texture;
        if (data.isVideo) {
            const video = document.getElementById( 'some-video' )
            texture = new THREE.VideoTexture( video )
            texture.colorSpace = THREE.SRGBColorSpace
        }
        else 
            texture = new THREE.TextureLoader().load(data.filepath)
    
        if(data.mipmap0) {  // If texture manually defines mipmaps
            texture.generateMipmaps = false
            for(let level = 0; level <= 7; level++)
                this.loadMipmap(texture, level, data["mipmap"+level])
        } else {
            if(!data.isVideo) { // Assigning the default (defined in MySceneData) for minFilter, 'LinearMipmapLinearFilter', in video textures will raise a warning and may cause video to not play
                texture.magFilter = THREE[data.magFilter] 
                texture.minFilter = THREE[data.minFilter] 
            }   
        }
        texture.anisotropy = data.anisotropy
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        
        this.textures[data.id] = texture
    }
    
    /**
     * create a new material
     * @param {*} data material data
     */
    buildMaterial(data) {
        const material = new THREE.MeshPhongMaterial({
            color: data.color, 
            specular: data.specular, 
            emissive: data.emissive,
            shininess: data.shininess, 
            wireframe: data.wireframe, 
            flatShading: data.shading === "flat",
            map: this.textures[data.textureref] || null, 
            side: data.twosided ? THREE.DoubleSide : THREE.FrontSide,
            bumpMap: this.textures[data.bumpref] || null, 
            bumpScale:  data.bumpscale,
            specularMap: this.textures[data.specularref] || null
        })
        material.texlength_s = data.texlength_s || 1.0
        material.texlength_t = data.texlength_t || 1.0

        this.materials[data.id] = material
    }

    /**
     * generates a skybox surronding the scene
     * @param {*} data skybox data
     */
    buildSkybox(data) {
        const sides = ["front", "back", "left", "right", "up", "down"]
        let materials = []

        sides.forEach((side) => {
            const texture = new THREE.TextureLoader().load(data[side])
            materials = [...materials, new THREE.MeshPhongMaterial({
                emissive: data.emissive, 
                emissiveIntensity: data.intensity,
                map: texture, 
                side: THREE.BackSide
            })]
        })

        const box = new THREE.BoxGeometry(...data.size)

        const mesh = new THREE.Mesh(box, materials)
        mesh.position.set(...data.center)

        this.app.scene.add(mesh)
    }

    /**
     * creates the scene's objects by visiting the scene graph
     * @param {*} graph scene graph
     * @param {string} root_id id of the root node
     */
    buildSceneObjects(graph, root_id) {
        const sceneVisitor = new MySceneGraphVisitor(
            this.app.scene,
            this.materials
        );
        
        const defaults = {
            material: 'default',
            castShadows: false,
            receiveShadows: false
        }

        this.objects = sceneVisitor.visitSceneGraph(graph[root_id], defaults)
        //console.log(this.objects)
    }

    /**
     * Called when the scene xml file load is complete
     * @param {MySceneData} data the entire scene data object
     */
    onSceneLoaded(data) {
        console.info("scene data loaded " + data + ". visit MySceneData javascript class to check contents for each data item.")
        this.onAfterSceneLoadedAndBeforeRender(data);
    }

    /**
     * Called after scene has loaded but before the render call is invoked
     * @param {*} data the entire scene data object
     */
    onAfterSceneLoadedAndBeforeRender(data) {
        // Set globals 
        this.app.setBackgroundColor(data.options.background)
        this.setAmbientLight(data.options.ambient)
        if (data.fog)
            this.app.setFog(data.fog)

        // Create textures
        for (var key in data.textures) {
            this.buildTexture(data.textures[key])
        }

        // Create materials
        for (var key in data.materials) {
            this.buildMaterial(data.materials[key])
        }

        // Instantiate cameras
        this.app.initCameras(data.cameras)
        this.app.setActiveCamera(data.activeCameraId)

        // Create skyboxes
        for (var key in data.skyboxes) {
            this.buildSkybox(data.skyboxes[key])
        }

        // Create objects
        this.buildSceneObjects(data.nodes, data.rootId)

        // Add objects to the scene
        this.app.scene.add(this.objects)
    }

    update() {
        
    }
}

export { MyContents };
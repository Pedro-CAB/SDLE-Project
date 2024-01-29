import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui = new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        const cameraNames = Object.keys(this.app.cameras).sort()
        cameraFolder.add(this.app, 'activeCameraName', cameraNames ).name("active camera")
    
        // adds a folder to the gui interface for the lights
        const lightsFolder = this.datgui.addFolder('Lights')
        this.contents.objects.getObjectsByProperty('isLight', true).forEach(
            (light) => { 
                lightsFolder.add(light, 'visible').name(light.name)
            }
        )      
    }
}

export { MyGuiInterface };
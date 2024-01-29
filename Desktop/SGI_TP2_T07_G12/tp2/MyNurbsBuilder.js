import * as THREE from 'three';
import { NURBSSurface } from 'three/addons/curves/NURBSSurface.js';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';

/**
 *  This class contains the contents of out application
 */
class MyNurbsBuilder  {
    static build(controlPoints, degree1, degree2, samples1, samples2) {
        const knots1 = []
        const knots2 = []

        // build knots1 = [ 0, 0, 0, 1, 1, 1 ];
        for (var i = 0; i <= degree1; i++) {
            knots1.push(0)
        }
        for (var i = 0; i <= degree1; i++) {
            knots1.push(1)
        }

        // build knots2 = [ 0, 0, 0, 0, 1, 1, 1, 1 ];
        for (var i = 0; i <= degree2; i++) {
            knots2.push(0)
        }
        for (var i = 0; i <= degree2; i++) {
            knots2.push(1)
        }

        let stackedPoints = []
        for(var i = 0; i <= degree1; i++) {
            let row = []
            for(var j = 0; j <= degree2; j++) {
                let controlPoint = controlPoints[i*(degree2+1) + j]
                row.push(new THREE.Vector4(
                    controlPoint.xx, controlPoint.yy,
                    controlPoint.zz, 1.0
                ))
            }
            stackedPoints[i] = row
        }
        
        const nurbsSurface = new NURBSSurface( degree1, degree2,
                                     knots1, knots2, stackedPoints );
        const geometry = new ParametricGeometry( getSurfacePoint,
                                                 samples1, samples2 );
        return geometry;

        function getSurfacePoint( u, v, target ) {
            return nurbsSurface.getPoint( u, v, target );
        }
    }
}


export { MyNurbsBuilder };
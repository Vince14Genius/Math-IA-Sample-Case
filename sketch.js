// Simple 3D Renderer - MATH IA SAMPLE CASE

// Essential variables
var objectsInWorld = []
var activeCamera = null

/* Object & function declarations */

class Vector {
    /// Create a vector object using regular 3D coordinates
    constructor(x, y, z) { this.x = x; this.y = y; this.z = z }

    /// Translate the vector by the given change in 3D coordinate position
    translateBy(deltaX, deltaY, deltaZ) { this.x += deltaX; this.y += deltaY; this.z += deltaZ }

    /// GET the magnitude (modulus) of the vector
    magnitude() { return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z) }
}

/// Calculate the scalar product of two vectors
function scalarProduct(vectorA, vectorB) {
    return vectorA.x * vectorB.x + vectorA.y * vectorB.y + vectorA.z * vectorB.z
}

/// Calculate the angle between two vectors using the arc-cosine of the scalar product
function angleBetweenVectors(vectorA, vectorB) {
    var scalarProductOfVectors = scalarProduct(vectorA, vectorB)
    var productOfMagnitudes = vectorA.magnitude() * vectorB.magnitude()
    return Math.acos(scalarProductOfVectors / productOfMagnitudes)
}

/// A function from my mathematical work
function computeAngle(visionAngle, directionalAngle, complementAngle) {
    var numerator = Math.pow(visionAngle, 2) + Math.pow(directionalAngle, 2) - Math.pow(complementAngle, 2)
    var denominator = 2 * visionAngle * directionalAngle
    return Math.acos(numerator / denominator)
}

/// A function from my mathematical work
function computeRPoint(r0, visionAngle, thetaPoint) {
    return r0 * (thetaPoint / visionAngle)
}

/// A function from my mathematical work
function computeScreenX(rPoint, planeAngle) {
    return rPoint * Math.cos(planeAngle)
}

/// A function from my mathematical work
function computeScreenY(rPoint, planeAngle) {
    return rPoint * Math.sin(planeAngle)
}

class Point extends Vector {
    /// Create a vector object representing a single point in the 3D world
    constructor(x, y, z) { super(x, y, z) }

    /// GET the distance from this point to the camera
    distanceToCamera(camera) {
        var positionToCamera = new Vector(this.x - camera.x, this.y - camera.y, this.z - camera.z)
        return positionToCamera.magnitude()
    }

    // GET the point's relative positional vector to the camera
    getPointRelativeToCamera(camera) {
        return new Vector(this.x - camera.x, this.y - camera.y, this.z - camera.z)
    }

    // GET the angle to the camera's directional vector
    getAngleToDirectionalVector(camera) {
        var pointRelativeToCamera = this.getPointRelativeToCamera(camera)
        var cameraDirection = new Vector(Math.cos(camera.yRotation), 0, Math.sin(camera.yRotation))
        return angleBetweenVectors(pointRelativeToCamera, cameraDirection)
    }

    // GET the angle to the camera's complement vector
    getAngleToComplementVector(camera) {
        var pointRelativeToCamera = this.getPointRelativeToCamera(camera)
        var complementVector = new Vector(Math.cos(camera.yRotation + camera.visionAngle), 0, Math.sin(camera.yRotation + camera.visionAngle))
        return angleBetweenVectors(pointRelativeToCamera, complementVector)
    }

    /// GET the point's translated position on the 2D screen
    renderPositionInCamera(camera) {
        console.log("")
        console.log("(x: " + this.x + ", y: " + this.y + ", z: " + this.z + ")")

        var screenDiagonalRadius = 400

        var angleToDirectionalVector = this.getAngleToDirectionalVector(camera)
        var angleToComplementVector = this.getAngleToComplementVector(camera)
        console.log("th: " + angleToDirectionalVector + ", thP: " + angleToComplementVector)

        var planeAngle = computeAngle(camera.visionAngle, angleToDirectionalVector, angleToComplementVector)
        var rPoint = computeRPoint(screenDiagonalRadius, camera.visionAngle, angleToDirectionalVector)
        console.log("A: " + planeAngle + ", rPoint: " + rPoint)

        var screenX = computeScreenX(rPoint, planeAngle)
        var screenY = computeScreenY(rPoint, planeAngle)
        console.log("(" + screenX + ", " + screenY + ")")

        // Test which of the two intersections to use (inverted because p5.js coordinates are inverted from Cartesian)
        if (this.y > camera.y) {
            // above midline
            console.log("+ (POSITIVE)")
            return [screenX + screenDiagonalRadius / 2, -screenY + screenDiagonalRadius / 2]
        } else {
            // below midline
            console.log("- (NEGATIVE)")
            return [screenX + screenDiagonalRadius / 2, screenY + screenDiagonalRadius / 2]
        }
    }
}

class Camera extends Vector {
    /// Create a vector object representing a camera, with  vision range and starting y-rotation provided
    constructor(x, y, z, visionAngle, yRotation) {
        super(x, y, z); this.visionAngle = visionAngle; this.yRotation = yRotation
    }

    /// Render all items in a 3D world onto the 2D screen through this camera
    renderItemsInWorld(world) {
        var thisCamera = this
        world.sort(function (a, b) { return a.distanceToCamera(thisCamera) < b.distanceToCamera(thisCamera) })
        for (var thisItem of world) { thisItem.renderInCamera(this) }
    }

    /// Rotate the camera's y-rotation by a certain angle
    rotateYBy(rotation) { this.yRotation += rotation; this.yRotation %= Math.PI }
}

/* Main */

activeCamera = new Camera(0, 0, 0, Math.PI / 4, Math.PI / 4)

objectsInWorld = [
    new Point(1, 0.8, 1),
    new Point(1, 0.8, 2),
    new Point(2, 0.8, 1),
    new Point(2, 0.8, 2),
    new Point(1, -0.2, 1),
    new Point(1, -0.2, 2),
    new Point(2, -0.2, 1),
    new Point(2, -0.2, 2),
]

for (var currentPoint of objectsInWorld) {
    currentPoint.renderPositionInCamera(activeCamera)
}

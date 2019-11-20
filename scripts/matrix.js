class Matrix {
    constructor(r, c) {
        this.rows = r;
        this.columns = c;
        this.data = [];
        let i, j;
        for (i = 0; i < this.rows; i++) {
            this.data.push([]);
            for (j = 0; j < this.columns; j++) {
                this.data[i].push(0);

            }
        }
    }

    set values(v) {
        let i, j, idx;
        // v is already a 2d array with dims equal to rows and columns
        if (v instanceof Array && v.length === this.rows && 
            v[0] instanceof Array && v[0].length === this.columns) {
            this.data = v;
        }
        // v is a flat array with length equal to rows * columns
        else if (v instanceof Array && typeof v[0] === 'number' &&
                 v.length === this.rows * this.columns) {
            idx = 0;
            for (i = 0; i < this.rows; i++) {
                for (j = 0; j < this.columns; j++) {
                    this.data[i][j] = v[idx];
                    idx++;
                }
            }
        }
        // not valid
        else {
            console.log("could not set values for " + this.rows + "x" + this.columns + " maxtrix");
        }
    }

    get values() {
        return this.data.slice();
    }

    // matrix multiplication (this * rhs)
    mult(rhs) {
        let result = null;
        let i, j, k, vals, sum;
        // ensure multiplication is valid
        if (rhs instanceof Matrix && this.columns === rhs.rows) {
            result = new Matrix(this.rows, rhs.columns);
            vals = result.values;
            for (i = 0; i < result.rows; i++) {
                for (j = 0; j < result.columns; j++) {
                    sum = 0;
                    for (k = 0; k < this.columns; k++) {
                        sum += this.data[i][k] * rhs.data[k][j]
                    }
                    vals[i][j] = sum;
                }
            }
            result.values = vals;
        }
        else {
            console.log("could not multiply - row/column mismatch");
        }
        return result;
    }
}

Matrix.multiply = function(...args) {
    let i;
    let result = null;
    // ensure at least 2 matrices
    if (args.length >= 2 && args.every((item) => {return item instanceof Matrix;})) {
        result = args[0];
        i = 1;
        while (result !== null && i < args.length) {
            result = result.mult(args[i]);
            i++;
        }
        if (args[args.length - 1] instanceof Vector) {
            result = new Vector(result);
        }
    }
    else {
        console.log("could not multiply - requires at least 2 matrices");
    }
    return result;
};


class Vector extends Matrix {
    constructor(n) {
        let i;
        if (n instanceof Matrix) {
            super(n.rows, 1);
            for (i = 0; i < this.rows; i++) {
                this.data[i][0] = n.data[i][0];
            }
        }
        else {
            super(n, 1);
        }
    }

    get x() {
        let result = null;
        if (this.rows > 0) {
            result = this.data[0][0];
        }
        return result;
    }

    get y() {
        let result = null;
        if (this.rows > 1) {
            result = this.data[1][0];
        }
        return result;
    }

    get z() {
        let result = null;
        if (this.rows > 2) {
            result = this.data[2][0];
        }
        return result;
    }

    get w() {
        let result = null;
        if (this.rows > 3) {
            result = this.data[3][0];
        }
        return result;
    }

    set x(val) {
        if (this.rows > 0) {
            this.data[0][0] = val;
        }
    }

    set y(val) {
        if (this.rows > 0) {
            this.data[1][0] = val;
        }
    }

    set z(val) {
        if (this.rows > 0) {
            this.data[2][0] = val;
        }
    }

    set w(val) {
        if (this.rows > 0) {
            this.data[3][0] = val;
        }
    }

    magnitude() {
        let i;
        let sum = 0;
        for (i = 0; i < this.rows; i++) {
            sum += this.data[i][0] * this.data[i][0];
        }
        return Math.sqrt(sum);
    }

    normalize() {
        let i;
        let mag = this.magnitude();
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] /= mag;
        }
    }

    scale(s) {
        let i;
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] *= s;
        }
    }

    add(rhs) {
        let i;
        let result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] + rhs.data[i][0];
            }
        }
        return result;
    }

    subtract(rhs) {
        let i;
        let result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] - rhs.data[i][0];
            }
        }
        return result;
    }

    dot(rhs) {
        let i;
        let sum = 0;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            for (i = 0; i < this.rows; i++) {
                sum += this.data[i][0] * rhs.data[i][0];
            }
        }
        return sum;
    }

    cross(rhs) {
        let result = null;
        if (rhs instanceof Vector && this.rows === 3 && rhs.rows === 3) {
            result = new Vector(3);
            result.values = [this.data[1][0] * rhs.data[2][0] - this.data[2][0] * rhs.data[1][0],
                             this.data[2][0] * rhs.data[0][0] - this.data[0][0] * rhs.data[2][0],
                             this.data[0][0] * rhs.data[1][0] - this.data[1][0] * rhs.data[0][0]]
        }
        return result;
    }
}


// ones diagonally down right to left
function mat4x4identity() {
    let newMatrix = new Matrix(4, 4);
    // getter
    let values = newMatrix.values;

    values[0][0] = 1;
    values[1][1] = 1;
    values[2][2] = 1;
    values[3][3] = 1;

    // setter
    newMatrix.values = values;
    return newMatrix;
}

function mat4x4translate(tx, ty, tz) {
    let newMatrix = mat4x4identity();
    let values = newMatrix.values;
    values[0][3] = tx;
    values[1][3] = ty;
    values[2][3] = tz;

    newMatrix.values = values;
    return newMatrix;
}

function mat4x4scale(sx, sy, sz) {
    let result = new Matrix(4, 4);

    return result;
}

function mat4x4rotatex(theta) {
    let result = new Matrix(4, 4);

    return result;
}

function mat4x4rotatey(theta) {
    let result = new Matrix(4, 4);

    return result;
}

function mat4x4rotatez(theta) {
    let result = new Matrix(4, 4);

    return result;
}

function mat4x4shearxy(shx, shy) {
    let result = new Matrix(4, 4);

    return result;
}

function rotateVrc(nAxis, uAxis, vAxis){
    let newMatrix = new Matrix(4, 4);
    newMatrix.values = [
        [uAxis.x, uAxis.y, uAxis.z, 0],
        [vAxis.x, vAxis.y, vAxis.z, 0],
        [nAxis.x, nAxis.y, nAxis.z, 0],
        [0, 0, 0, 1]
    ];
    return newMatrix;
}

function translatePrp(prp){
    let newMatrix = mat4x4identity();

    let values = newMatrix.values;
    values[0][3] = -prp.x;
    values[1][3] = -prp.y;
    values[2][3] = -prp.z;
    newMatrix.values = values;

    return newMatrix;
}

function shear(prp, clip){
    let dop = {
        x: ((clip[0] + clip[1])/2)-prp.x,
        y: ((clip[2] + clip[3])/2)-prp.y,
        z: -prp.y
    };
    let shxPar = -dop.x / dop.z;
    let shyPar = -dop.y / dop.z;

    let newMatrix = mat4x4identity();
    let values = newMatrix.values;
    values[0][2] = shxPar;
    values[1][2] = shyPar;
    newMatrix.values = values;
    return newMatrix;
}

function scalePerspective(prp, clip){
    let vrpPrimeZ = -prp.z;
    let sPerX = (2 * vrpPrimeZ) / ((clip[1] - clip[0]) * (vrpPrimeZ + clip[5]));
    let sPerY = (2 * vrpPrimeZ) / ((clip[3] - clip[2]) * (vrpPrimeZ + clip[5]));
    let sPerZ = -1 / (vrpPrimeZ + clip[5]);

    let newMatrix = new Matrix(4, 4);
    let values = newMatrix.values;
    values[0][0] = sPerX;
    values[1][1] = sPerY;
    values[2][2] = sPerZ;
    values[3][3] = 1;
    newMatrix.values = values;
    return newMatrix;
}

function translateParallel(clip){
    let cw = {
        x: (clip[0] + clip[1])/2,
        y: (clip[2] + clip[3])/2,
    };
    let f = clip[4];

    let newMatrix = mat4x4identity();
    let values = newMatrix.values;
    values[0][3] = -cw.x;
    values[1][3] = -cw.y;
    values[2][3] = -f;
    newMatrix.values = values;
    return newMatrix;
}

function scaleParallel(clip){
    let sParX = 2 / (clip[1] - clip[0]);
    let sParY = 2 / (clip[3] - clip[2]);
    let sParZ = 1 / (clip[4] - clip[5]);

    let newMatrix = new Matrix(4, 4);
    let values = newMatrix.values;
    values[0][0] = sParX;
    values[1][1] = sParY;
    values[2][2] = sParZ;
    values[3][3] = 1;
    newMatrix.values = values;
    return newMatrix;
}

function mat4x4parallel(vrp, vpn, vup, prp, clip) {
    // 1. translate VRP to the origin
    let translatedVrp = mat4x4translate(-vrp.x, -vrp.y, -vrp.z);

    // Create u, v, n
    let nAxis, uAxis, vAxis;
    nAxis = vpn;
    nAxis.normalize();
    uAxis = vup.cross(nAxis);
    uAxis.normalize();
    vAxis = nAxis.cross(uAxis);

    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, u-axis becomes the x-axis, and v-axis becomes the y-axis
    let rotatedVrc = rotateVrc(nAxis, uAxis, vAxis);

    // 3. shear such that the DOP becomes parallel to the z-axis
    let sheared = shear(prp, clip);

    // 4. translate and scale into canonical view volume (x = [-1,1], y = [-1,1], z = [0,-1])
    let translatedCVV = translateParallel(clip);
    let scaled = scaleParallel(clip);

    let nPar = Matrix.multiply(scaled, translatedCVV, sheared, rotatedVrc, translatedVrp);

    return nPar;

}

function mat4x4perspective(vrp, vpn, vup, prp, clip) {
    // 1. translate VRP to the origin
    let translatedVrp = mat4x4translate(-vrp.x, -vrp.y, -vrp.z);

    // Create u, v, n
    let nAxis, uAxis, vAxis;
    nAxis = vpn;
    nAxis.normalize();
    uAxis = vup.cross(nAxis);
    uAxis.normalize();
    vAxis = nAxis.cross(uAxis);

    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, u-axis becomes the x-axis, and v-axis becomes the y-axis
    let rotatedVrc = rotateVrc(nAxis, uAxis, vAxis);

    // 3. translate PRP to the origin
    let translatedPrp = translatePrp(prp);

    // 4. shear such that the center line of the view volume becomes the z-axis
    let sheared = shear(prp, clip);

    // 5. scale into canonical view volume (truncated pyramid) x = [z,-z], y = [z,-z], z = [-z_min,-1])
    let scaled = scalePerspective(prp, clip);

    // let nPer = Matrix.multiply(translatedVrp, rotatedVrc, translatedPrp, sheared, scaled);
    let nPer = Matrix.multiply(scaled, sheared, translatedPrp, rotatedVrc, translatedVrp);

    return nPer;
}

function mat4x4mper() {
    // perspective projection from canonical view volume to far clip plane
    let result = new Matrix(4, 4);

    return result;
}

function Vector3(x, y, z) {
    let result = new Vector(3);
    result.values = [x, y, z];
    return result;
}

function Vector4(x, y, z, w) {
    let result = new Vector(4);
    result.values = [x, y, z, w];
    return result;
}

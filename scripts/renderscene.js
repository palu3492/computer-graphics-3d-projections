let view;
let ctx;
let scene;

// Initialization function - called when web page loads
function Init() {
    let w = 800;
    let h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'parallel',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-20, 20, -4, 36, 1, -50]
        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ]
            }
        ]
    };

    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    
    DrawScene();
}

// Main drawing code here
function DrawScene() {
    ctx.clearRect(0, 0, view.width, view.height); // clear canvas
    let viewType = scene.view.type; // perspective or parallel
    let projectionMatrix;
    if(viewType === 'perspective'){
        projectionMatrix = mat4x4perspective(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
    } else if(viewType === 'parallel'){
        projectionMatrix = mat4x4parallel(scene.view.vrp, scene.view.vpn, scene.view.vup, scene.view.prp, scene.view.clip);
    } else {
        console.log('error');
    }
    // not used in parallel
    let mPer = new Matrix(4,4);
    mPer.values =[
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, -1, 0]
    ];

    let translateScale = new Matrix(4,4);
    translateScale.values = [
        [view.width/2, 0, 0, view.width/2],
        [0, view.height/2, 0, view.height/2],
        [0, 0, 1, 0],
        [0, 0, 0, 1]
    ];

    let model = scene.models[0]; // first model

    let matrices = [];
    model.vertices.forEach(vertex => {
        matrices.push(Matrix.multiply(projectionMatrix, vertex));
    });

    let vectors = [];
    model.edges.forEach(edge => {
        for(let e=0; e<edge.length-1; e++) {
            let pt0 = matrices[edge[e]];
            let pt1 = matrices[edge[e+1]];

            let clipped = clipLine(pt0, pt1, scene.view);

            pt0 = Vector4(clipped.pt0.x,clipped.pt0.y,clipped.pt0.z,1);
            pt1 = Vector4(clipped.pt1.x,clipped.pt1.y,clipped.pt1.z,1);

            if(viewType === 'perspective'){
                vectors.push( Matrix.multiply(translateScale, mPer, pt0) );
                vectors.push( Matrix.multiply(translateScale, mPer, pt1) );
            } else{
                vectors.push( Matrix.multiply(translateScale, pt0) );
                vectors.push( Matrix.multiply(translateScale, pt1) );
            }
        }
    });

    let projection = [];
    vectors.forEach(vector => {
        let x = vector.x / vector.w;
        let y = vector.y / vector.w;
        let z = vector.z / vector.w;
        let w = vector.w / vector.w;
        let newVector = Vector4(x, y, z, w);
        projection.push(newVector);
    });

    for(let i = 0; i < projection.length; i+=2) {
        // watch it be drawn
        // setTimeout(function(){ DrawLine(projection[i].x, projection[i].y, projection[i+1].x, projection[i+1].y); }, i*100);
        DrawLine(projection[i].x, projection[i].y, projection[i+1].x, projection[i+1].y);
    }

}

// Called when user selects a new scene JSON file
function LoadNewScene() {
    let scene_file = document.getElementById('scene_file');

    console.log(scene_file.files[0]);

    let reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
        }

        DrawScene();
};
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Called when user presses a key on the keyboard down 
function OnKeyDown(event) {
    let vrp = scene.view.vrp;

    let nAxis, uAxis;
    nAxis = scene.view.vpn;
    nAxis.normalize();
    uAxis = scene.view.vup.cross(nAxis);
    uAxis.normalize();

    let x, y ,z;
    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
            scene.view.vrp = vrp.add(uAxis);
            DrawScene();
            break;
        case 38: // UP Arrow
            console.log("up");
            scene.view.vrp = vrp.add(nAxis);
            // x = scene.view.vrp.x;
            // scene.view.vrp.x = x+5;
            DrawScene();
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            scene.view.vrp = vrp.subtract(uAxis);
            // z = scene.view.vrp.z;
            // scene.view.vrp.z = z+5;
            DrawScene();
            break;
        case 40: // DOWN Arrow
            console.log("down");
            scene.view.vrp = vrp.subtract(nAxis);
            // x = scene.view.vrp.x;
            // scene.view.vrp.x = x-5;
            DrawScene();
            break;
    }
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}

const LEFT = 32;
const RIGHT = 16;
const BOT = 8;
const TOP  = 4;
const FRONT = 2;
const BACK = 1;
function GetOutCode(pt, view) {
    let outcode = 0;
    if(pt.x < view.x_min) {
        outcode += LEFT;
    } else if(pt.x > view.x_max) {
        outcode += RIGHT;
    }
    if(pt.y < view.y_min) {
        outcode += BOT;
    } else if(pt.y > view.y_max){
        outcode += TOP;
    }
    if(pt.z < view.z_min) {
        outcode += BACK;
    } else if(pt.z > view.z_max) {
        outcode += FRONT;
    }
    return outcode;
}


function clipLine(pt0, pt1, view) {
    let result = {
        pt0: {},
        pt1: {}
    };
    let outcode0 = GetOutCode(pt0, view);
    let outcode1 = GetOutCode(pt1, view);
    let delta_x = pt1.x - pt0.x;
    let delta_y = pt1.y - pt0.y;
    let delta_z = pt1.z - pt0.z;
    let b = pt0.y - ((delta_y / delta_x) * pt0.x);

    let done = false;
    while(!done) {
        if((outcode0 | outcode1) === 0) { // Trivial accept
            done = true;
            result.pt0.x = pt0.x;
            result.pt0.y = pt0.y;
            result.pt0.z = pt0.z;
            result.pt1.x = pt1.x;
            result.pt1.y = pt1.y;
            result.pt1.z = pt1.z;
        } else if ((outcode0 & outcode1) !== 0) { //Trivial reject
            done = true;
            result = null;
        } else {
            let selected_pt; // we pick a point that is outside the view
            let selected_outcode;
            if(outcode0 > 0) {
                select_pt = pt0;
                selected_outcode = outcode0;
            } else {
                select_pt = pt1;
                selected_outcode = outcode1;
            }
            if((selected_outcode & LEFT) === LEFT) {
                selected_pt.x = view.x_min;
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            } else if((selected_outcode & RIGHT) === RIGHT) {
                selected_pt.x = view.x_max;
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            } else if((selected_outcode & BOT) === BOT) {
                selected_pt.y = view.y_min;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
            } else if((selected_outcode & TOP) === TOP){ // we know it's the top
                selected_pt.y = view.y_max;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
            } else if((selected_outcode & FRONT) === FRONT) {
                selected_pt.z = view.z_max;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            } else { // we know it's gonna be BACK
                selected_pt.z = view.z_min;
                selected_pt.x = (selected_pt.y -b) * (delta_x / delta_y);
                selected_pt.y = (delta_y / delta_x) * selected_outcode.x + b;
            }
            if(outcode0 > 0) {
                outcode0 = selected_outcode;
            } else {
                outcode1 = selected_outcode;
            }
        }
    }
    return result;
} // ClipLine
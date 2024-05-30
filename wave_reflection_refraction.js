window.onload = function () {
    const container = document.querySelector('#canvas-container');

    let angle = 0;

    let reflectionFlag = true;

    let clock = new THREE.Clock();

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0xabcdef);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);


    camera.position.set(0, 1, 11.2);




    camera.fov = 75;
    camera.updateProjectionMatrix();

    const renderer = new THREE.WebGLRenderer({ antialias: true });


    renderer.setSize(window.innerWidth, window.innerHeight);

    container.appendChild(renderer.domElement);

    const surfaceGeometry = new THREE.BoxGeometry(20, 4, 20);

    const surfaceMaterial = new THREE.MeshBasicMaterial({
        color: 0x5555FF,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
    });

    const surface = new THREE.Mesh(surfaceGeometry, surfaceMaterial);

    surface.position.y = -4;
    surface.rotation.y = 2.285;
    surface.position.x = -1;

    scene.add(surface);

    let waterFlag = false;

    let glassFlag = false;





    var vFOV = camera.fov * Math.PI / 180;

    let distanceToOrigin = Math.sqrt(camera.position.x ** 2 + camera.position.y ** 2 + camera.position.z ** 2);
    height = 2 * Math.tan(vFOV / 2) * distanceToOrigin;

    // Calculate the y-coordinate of the top of the screen
    var topOfScreen = camera.position.y + height / 2;


    let points = [];

    points.push(new THREE.Vector3(0, topOfScreen, 0));
    points.push(new THREE.Vector3(0, surface.position.y + 2, 0));

    let geometry = new THREE.BufferGeometry().setFromPoints(points);

    let line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0x0000ff }));

    scene.add(line);

    initial_position = new THREE.Vector3(points[1].x, points[1].y, points[1].z)


    let initial_light = new THREE.ArrowHelper(new THREE.Vector3(-1, 1, 0), initial_position, 5, 0xffff00);

    reflected_position = new THREE.Vector3(points[1].x, points[1].y, points[1].z);
    let reflected_light = new THREE.ArrowHelper(new THREE.Vector3(1, 1, 0), reflected_position, 5, 0xffff00);
    let refracted_light = new THREE.ArrowHelper(new THREE.Vector3(1, -1, 0), reflected_position, 5, 0xffff00);
    reflected_light.visible = true;
    refracted_light.visible = false;
    scene.add(initial_light, reflected_light, refracted_light);

    let slider = document.getElementById("incidentAngle");
    let angleValue = document.getElementById("angleValue");





    initial_light.cone.material.transparent = true;

    initial_light.cone.material.opacity = 0;

    if (reflectionFlag) {
        reflectedLight();
    }

    document.getElementById("reflectionbutton").addEventListener("click", reflectedLight);




    function reflectedLight() {
        reflectionFlag = true;
        reflected_light.visible = true;
        refracted_light.visible = false;

        slider.value = angle;
        angleValue.textContent = angle + '°';
        initial_light.rotation.set(0, 0, 0);
        reflected_light.rotation.set(0, 0, 0);


        initial_light.rotation.set(0, 0, THREE.Math.degToRad(angle));

        reflected_light.rotation.set(0, 0, THREE.Math.degToRad(-angle));


        slider.oninput = function () {
            angle = parseFloat(this.value); // Get angle in degrees from the slider
            angleValue.textContent = angle + '°'; // Update the angle value displayed on the page


            let angleInRadians = THREE.Math.degToRad(angle);


            let axis = new THREE.Vector3(0, 0, 1);

            // Reset the rotation of the initial light
            initial_light.rotation.set(0, 0, 0);

            // Rotate the initial light counterclockwise around the z-axis
            initial_light.rotateOnAxis(axis, angleInRadians);

            // Reset the rotation of the reflected light
            reflected_light.rotation.set(0, 0, 0);

            // Rotate the reflected light clockwise around the z-axis
            reflected_light.rotateOnAxis(axis, -angleInRadians);

            reflected_light.line.material.transparent = true;
            reflected_light.line.material.opacity = 1;

            reflected_light.cone.material.transparent = true;

            reflected_light.cone.material.opacity = 1;


        };
    };

    document.getElementById('waterbutton').addEventListener('click', function () {
        surfaceMaterial.color.setHex(0x5555FF);
        surfaceMaterial.transparent = true;
        surfaceMaterial.opacity = 0.4;
        glassFlag = false;
        waterFlag = true;
        initial_light.rotation.set(0, 0, 0);
        initial_light.rotation.set(0, 0, THREE.Math.degToRad(angle));
        reflected_light.rotation.set(0, 0, 0);
        reflected_light.rotation.set(0, 0, THREE.Math.degToRad(-angle));

        slider.value = angle;
        angleValue.textContent = angle + '°';
        if (!reflectionFlag) {
            refractedLight();
        }

    });


    document.getElementById('glassbutton').addEventListener('click', function () {
        surfaceMaterial.color.setHex(0x0bb6a8);

        surfaceMaterial.transparent = true;
        surfaceMaterial.opacity = 0.4;
        glassFlag = true;
        waterFlag = false;
        initial_light.rotation.set(0, 0, 0);
        initial_light.rotation.set(0, 0, THREE.Math.degToRad(angle));
        reflected_light.rotation.set(0, 0, 0);
        reflected_light.rotation.set(0, 0, THREE.Math.degToRad(-angle));
        slider.value = angle;
        angleValue.textContent = angle + '°';
        if (!reflectionFlag) {
            refractedLight();
        }
    });

    document.getElementById("refractionbutton").addEventListener("click", refractedLight);

    function refractedLight() {
        reflectionFlag = false;
        initial_light.rotation.set(0, 0, 0);

        reflected_light.rotation.set(0, 0, 0);


        reflected_light.visible = false;
        refracted_light.visible = true;

        let refractiveIndex = 1.33;
        if (waterFlag) {
            refractiveIndex = 1.33;
        } else if (glassFlag) {
            refractiveIndex = 1.52;
        }

        slider.value = angle;
        angleValue.textContent = angle + '°';



        // Function to update light based on the current angle
        function updateLight(angleInDegrees) {
            let angleInRadians = THREE.Math.degToRad(angleInDegrees);
            let axis = new THREE.Vector3(0, 0, 1);

            // Reset initial light to no rotation, then rotate based on input

            initial_light.rotation.set(0, 0, 0);
            initial_light.rotateOnAxis(axis, angleInRadians);

            // Calculate the refracted angle using Snell's Law
            refracted_light.rotation.set(0, 0, 0);
            let sinTheta2 = Math.sin(angleInRadians) / refractiveIndex;
            let refractedAngleRadians = Math.asin(sinTheta2);

            // Reset refracted light rotation and position to match initial light

            refracted_light.position.copy(initial_light.position);  // Ensure it starts at the same point

            // Base rotation for 0 degrees: Flips the refracted light downward
            refracted_light.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI);

            // Apply additional rotation based on the refracted angle
            refracted_light.rotateOnAxis(axis, -refractedAngleRadians);
        }


        updateLight(angle);

        slider.oninput = function () {
            angle = parseFloat(this.value);
            angleValue.textContent = angle + '°';
            updateLight(angle);
        };
    }

    function animate() {


        renderer.render(scene, camera);

        requestAnimationFrame(animate);
    }

    animate();






}
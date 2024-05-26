import * as THREE from '../build/three.module.js';
import { OrbitControls } from '../examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from '../examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from '../examples/jsm/loaders/MTLLoader.js';

let app;
let MAX = 500;
const testMap = new THREE.TextureLoader().load("image/test_img.jpg");
// 비동기 object3D
let fishOriginal;
let squidOriginal;
// camera initialize value
let cameraOrigin = 10;
// interaction slide connection
const slides = document.querySelectorAll(".slide");
// interaction trigger
let onSquidVisible = 0;
let onBackground = 0;
let onMirror = 0;


class App
{
  // JS 클래스에는 private 기능이 없기 때문에 _varibale 변수명을 사용하여 제한적으로 사용해야 함.
  constructor() {
    const divContainer = document.querySelector("#webgl-container");
    this._divContainer = divContainer;

    const renderer = new THREE.WebGLRenderer({ antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    divContainer.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupModel();
    this._setupControls();
    this._setupSlight();
    this.Count_Slide(parseInt(slides[0].value));

    // 창모드일 때 카메라나 씬에 부여되는 값을 변경하기 위함.
    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  _setupControls() {
    new OrbitControls(this._camera, this._divContainer);
  }

  _setupCamera() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;
    const camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.1,
      10000
    );
    camera.position.z = cameraOrigin;
    this._camera = camera;
    this._scene.add(camera);
  }

  _setupLight() {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(50, 100, 0);
    light.lookAt(0, 0, 0);
    this._scene.add(light);
    light.castShadow = true;
  }

  _setupSlight() {
    const light = new THREE.SpotLight(0xffffff, 1, 0, THREE.MathUtils.radToDeg(30));
    let lights = [];
    
    for (let i = 0; i < 7; i++){
      lights.push(light.clone());
      lights[i].castShadow = true;
    }
    let y = 5;
    let z = 10;

    let count = 1;
    for (let i = 0; i < lights.length; i++){
      if (i == 0) {
        lights[i].position.set(0, y, 0);
      }
      else if (i % 2 == 0) {
        lights[i].position.set(0, y, z * count);
        count++;
      }
      else {
        lights[i].position.set(0, y, -z * count);
      }
    }

    for (let i = 0; i < lights.length; i++){
      this._scene.add(lights[i]);
    }
    this._lights = lights;
  }

  _setupModel() {

    this._fishs = [];
    for (let i = 0; i < MAX; i++)
    {
      let fish = new Fish();
      this._cube = fish;
      this._scene.add(fish._fish);
      this._fishs.push(fish);
    }

    let squid = new Squid();
    this._scene.add(squid._squid);
    this._squid = squid;

    let floor = new Flat();
    this._floor = floor;
    this._scene.add(floor._flat);

    let mirror = new Mirror();
    this._mirror = mirror;
    this._scene.add(mirror._mirror);

    const cage = new Cage();
    this._scene.add(cage._cage);
    
    const water1 = new Water1();
    this._water1 = water1;

    const water2 = new Water2();
    this._water2 = water2;

    const water = new THREE.Object3D();
    water.add(water1._water);
    water.add(water2._water);
    this._water = water;
    this._scene.add(water);
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera.aspect = width / height;
    this._camera.updateProjectionMatrix();

    this._renderer.setSize(width, height);
  }

  render(time) {
    if (onMirror){
      this._scene.traverse(obj => {
        if (obj instanceof THREE.Object3D) {
          const mesh = obj.children[0];
          const cubeCamera = obj.children[1];
  
          if (mesh instanceof THREE.Mesh && cubeCamera instanceof THREE.CubeCamera) {
            mesh.visible = false;
            cubeCamera.update(this._renderer, this._scene);
            mesh.visible = true;
          }
        }
      });
    }
    this._renderer.render(this._scene, this._camera);
    this.update(time);
    requestAnimationFrame(this.render.bind(this));
  }

  update(time) {
    for (let i = 0; i < MAX; i++)
    {
      let speed = this._fishs[i]._speed;
      this._fishs[i]._fish.rotation.y += speed;
    }
    this._water.rotation.y -= 0.001;
    this._squid._squid.rotateY(this._squid._rotate);
  }

  // interaction function
  Count_Slide(count)
  {
    for (let i = 0; i < MAX; i++)
    {
      if (count > i)
      {
        if (this._fishs[i]._fish.visible == false)
        {
          this._fishs[i]._fish.visible = true;
        }
      }
      else 
      {
        if (this._fishs[i]._fish.visible == true)
        {
          this._fishs[i]._fish.visible = false;
        }
      }
    }
  }

  Speed_Slide(speed)
  {
    for (let i = 0; i < MAX; i++)
    {
      let dol = this._fishs[i];
      dol._speed = dol._speedOrigin * speed;
    }
  }

  Button_Squid()
  {
    if (onSquidVisible == 0)
    {
      this._squid._squid.visible = true;
      onSquidVisible = 1;
    }
    else
    {
      this._squid._squid.visible = false;
      onSquidVisible = 0;
    }
  }

  Button_Background()
  {
    if (onBackground == 0) {
      onBackground = 1;
      this._scene.background = testMap;
    }
    else {
      onBackground = 0;
      this._scene.background = null;
    }
  }

  Lights_Slide(intensity)
  {
    for (let i = 0; i < this._lights.length; i++) {
      this._lights[i].intensity = intensity;
    }
  }
  
  Button_Mirror(){
    if (onMirror == 0) {
      onMirror = 1;
      this._mirror._mirror.visible = true;
      this._floor._flat.visible = false;
    }
    else {
      onMirror = 0;
      this._mirror._mirror.visible = false;
      this._floor._flat.visible = true;
    }
  }
}

window.onload = function()
{
  const mtlLodaer = new MTLLoader();
  const objLoader = new OBJLoader();

  mtlLodaer.load("fish/13007_Blue-Green_Reef_Chromis_v2_l3.mtl",
    function (materials) {
      const loader = new OBJLoader();
      loader.setMaterials(materials);
      loader.load("fish/13007_Blue-Green_Reef_Chromis_v2_l3.obj",
        function(object) {
          fishOriginal = object;
          objLoader.load("squid/11097_squid_v1.obj",
            function(object) {
              squidOriginal = object;
              app = new App();
            }
          )
        }
      );
    }
  );  
}

// fish class
class Fish {
  constructor() {
    let x, y;
    let object = fishOriginal.clone(true);

    x = THREE.MathUtils.randFloat(0.005, 0.03);
    object.scale.x = x;
    object.scale.y = x;
    object.scale.z = x;

    x = THREE.MathUtils.randFloat(0.3, 0.8);
    y = THREE.MathUtils.randFloat(-0.5, 0.5);
    object.position.x = x;
    object.position.y = y;

    object.rotation.y = 3.14;
    object.rotation.x = 3.14/2;

    this._speed = THREE.MathUtils.randFloat(0.001, 0.03);
    this._speedOrigin = this._speed;

    const origin = new THREE.Object3D();
    origin.add(object);

    const fish = origin;
    this._fish = fish;

  }
}

class Squid {
  constructor() {
    let object = squidOriginal.clone(true);

    let size = 30;
    object.scale.x *= size;
    object.scale.y *= size;
    object.scale.z *= size;

    object.position.x = -95;

    let origin = new THREE.Object3D();
    origin.add(object);

    origin.translateX(-550);
    origin.translateY(700);
    origin.translateZ(550);
    origin.rotateX(-3.14/6);
    origin.visible = false;
    
    this._rotate = 0.005;
    this._squid = origin;
  }
}

class Flat{
  constructor(){
    const flat = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial({
      color: 0x666699,
      roughness: 0.2,
      metalness: 0.2,
      side: THREE.BackSide
    }));
    flat.position.set(0, -2, 0);
    flat.rotateX(THREE.MathUtils.degToRad(90));
    flat.receiveShadow = true;
    
    this._flat = flat;
  }
}

class Mirror{
  constructor(){
    const renderTargetOptions = {
      format: THREE.RGBAFormat,
      generateMipmaps: true,
      minFilter: THREE.LinearMipmapLinearFilter
    };

    const mirrorRenderTarget = new THREE.WebGLCubeRenderTarget(2048, renderTargetOptions);
    const mirrorCamera = new THREE.CubeCamera(0.1, 1000, mirrorRenderTarget);
    
    const mirror = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshPhongMaterial({
      color: 0x666699,
      envMap: mirrorRenderTarget.texture,
      reflectivity: 0.95,
      side: THREE.BackSide
    }));
    mirror.rotateX(THREE.MathUtils.degToRad(90));
    mirror.receiveShadow = true;

    const mirrorPivot = new THREE.Object3D();
    mirrorPivot.add(mirror);
    mirrorPivot.add(mirrorCamera);
    mirrorPivot.position.set(0, -2, 0);
    mirrorPivot.visible = false;
    
    this._mirror = mirrorPivot;
  }
}

class Cage{
  constructor(){
    let tx = 4;
    let ty = 2;
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load("image/glass/Glass_window_002_basecolor.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapAO = textureLoader.load("image/glass/Glass_Window_002_ambientOcclusion.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapHeight = textureLoader.load("image/glass/Glass_Window_002_height.png",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapNormal = textureLoader.load("image/glass/Glass_Window_002_normal.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapRoughness = textureLoader.load("image/glass/Glass_Window_002_roughness.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapMetalic = textureLoader.load("image/glass/Glass_Window_002_metallic.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapAlpha = textureLoader.load("image/glass/Glass_Window_002_opacity.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    
    const geometry = new THREE.SphereGeometry(1, 256, 256);
    const material = new THREE.MeshStandardMaterial({
      map: map,
      normalMap: mapNormal,
      displacementMap: mapHeight,
      displacementScale: 0,
      displacementBias: 0,
      aoMap: mapAO,
      aoMapIntensity: 1,
      roughnessMap: mapRoughness,
      roughness: 0.3,
      metalnessMap: mapMetalic,
      metalness: 0.7,
      alphaMap: mapAlpha,
      transparent: true,

      side: THREE.DoubleSide,
    });
    
    const cage = new THREE.Mesh(geometry, material);
    cage.geometry.attributes.uv2 = cage.geometry.attributes.uv;
    cage.castShadow = true;
    this._cage = cage;
  }
}

class Water1{
  constructor(){
    let tx = 7;
    let ty = 7;
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load("image/water/Water_002_COLOR.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapAO = textureLoader.load("image/water/Water_002_OCC.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapHeight = textureLoader.load("image/water/Water_002_DISP.png",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapNormal = textureLoader.load("image/water/Water_002_NORM.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapRoughness = textureLoader.load("image/water/Water_002_ROUGH.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });

    const geometry = new THREE.SphereGeometry(0.865, 256, 256);
    const material = new THREE.MeshStandardMaterial({
      map: map,
      normalMap: mapNormal,
      displacementMap: mapHeight,
      displacementScale: 0.1,
      displacementBias: 0.1,
      aoMap: mapAO,
      roughnessMap: mapRoughness,
      roughness: 0.3,
      metalness: 1,
      transparent: true,
      opacity: 0.5,
      // emissive: 0x0080ff,
      visible: true,

      side: THREE.DoubleSide,
    });
    
    const waterMesh = new THREE.Mesh(geometry, material);
    waterMesh.geometry.attributes.uv2 = waterMesh.geometry.attributes.uv;
    const water = new THREE.Object3D();
    water.add(waterMesh);
    this._water = water;
  }
}

class Water2{
  constructor(){
    let tx = 7;
    let ty = 7;
    const textureLoader = new THREE.TextureLoader();
    const map = textureLoader.load("image/water/Water_002_COLOR.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapAO = textureLoader.load("image/water/Water_002_OCC.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapHeight = textureLoader.load("image/water/Water_002_DISP.png",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapNormal = textureLoader.load("image/water/Water_002_NORM.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });
    const mapRoughness = textureLoader.load("image/water/Water_002_ROUGH.jpg",
    texture => {
      texture.repeat.x = tx;
      texture.repeat.y = ty;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
    });

    const geometry = new THREE.SphereGeometry(0.8, 256, 256);
    const material = new THREE.MeshStandardMaterial({
      map: map,
      normalMap: mapNormal,
      displacementMap: mapHeight,
      displacementScale: 0.1,
      displacementBias: 0.1,
      aoMap: mapAO,
      roughnessMap: mapRoughness,
      roughness: 0.3,
      metalness: 1,
      transparent: true,
      opacity: 0.5,
      // emissive: 0x0080ff,
      visible: true,

      side: THREE.DoubleSide,
    });
    
    const waterMesh = new THREE.Mesh(geometry, material);
    waterMesh.geometry.attributes.uv2 = waterMesh.geometry.attributes.uv;
    const water = new THREE.Object3D();
    water.add(waterMesh);
    this._water = water;
  }
}

// count interaction
slides[0].max = MAX;
slides[0].addEventListener("mousemove", (e)=>{
  app.Count_Slide(parseInt(e.target.value));
  InText(e.target.value, 0);
});
slides[0].addEventListener("change", (e)=>{
  app.Count_Slide(parseInt(e.target.value));
  InText(e.target.value, 0);
});

// speed interaction
slides[1].addEventListener("mousemove", (e)=>{
  app.Speed_Slide(parseFloat(e.target.value));
  InText(e.target.value, 1);
});
slides[1].addEventListener("change", (e)=>{
  app.Speed_Slide(parseFloat(e.target.value));
  InText(e.target.value, 1);
});

// light interaction
slides[2].addEventListener("mousemove", (e)=>{
  app.Lights_Slide(parseFloat(e.target.value));
  InText(e.target.value, 2);
});
slides[2].addEventListener("change", (e)=>{
  app.Lights_Slide(parseFloat(e.target.value));
  InText(e.target.value, 2);
});

// squid create button
let button1 = document.querySelector("#onSquid");
button1.addEventListener("click", ()=>{
  app.Button_Squid();
});

// background create button
let button2 = document.querySelector("#onBackground");
button2.addEventListener("click", ()=>{
  app.Button_Background();
});

// mirror create button
let button3 = document.querySelector("#onMirror");
button3.addEventListener("click", ()=>{
  app.Button_Mirror();
});

// for text
function InText(value, index)
{
  const txtboxs = document.querySelectorAll(".txtbox");
  txtboxs[index].value = value;
}
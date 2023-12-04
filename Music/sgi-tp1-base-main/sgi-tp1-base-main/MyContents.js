import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';

class MyContents {
    constructor(app) {
        this.app = app;
        this.axis = null;

        // Definindo dimensões da mesa como propriedades da classe
        this.tampoLength = 5;
        this.tampoWidth = 2;
        this.tampoThickness = 0.2;
        this.legHeight = 3;
        this.legThickness = 0.2;

        // Atributos relacionados ao bolo
        this.cakeMesh = null;
        this.cakeMeshSize = 1.0;
        this.cakeEnabled = true;
        this.lastCakeEnabled = null;
        this.cakeDisplacement = new THREE.Vector3(0, 2, 0);

        // Atributos relacionados ao plano
        this.diffusePlaneColor = "#00ffff";
        this.specularPlaneColor = "#777777";
        this.planeShininess = 30;
        this.planeMaterial = new THREE.MeshPhongMaterial({
            color: this.diffusePlaneColor,
            specular: this.specularPlaneColor,
            emissive: "#000000",
            shininess: this.planeShininess
        });
    }

    // Método para criar uma vela
    createCandle() {
        const candleGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 32);
        const candleMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500 });
        const candle = new THREE.Mesh(candleGeometry, candleMaterial);
        return candle;
    }

    // Método para criar velas em grupo e posicioná-las
    // Método para criar velas em grupo e posicioná-las
createCandles() {
    const candleGroup = new THREE.Group();
    const numCandles = 5;
    const candleRadius = 0.4; // Valor reduzido para aproximar as velas do centro

    for (let i = 0; i < numCandles; i++) {
        const angle = (i / numCandles) * Math.PI * 2;
        const x = candleRadius * Math.cos(angle);
        const z = candleRadius * Math.sin(angle);

        const candle = this.createCandle();
        candle.position.set(x, 0.25, z);
        candleGroup.add(candle);

        const flameGeometry = new THREE.ConeGeometry(0.02, 0.1, 32);
        const flameMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500 });
        const flame = new THREE.Mesh(flameGeometry, flameMaterial);
        flame.position.y = 0.4;
        candle.add(flame);
    }

    // Posicione o grupo de velas no topo do bolo
    const cakeTopY = 0.15;  // Altura do topo do bolo
    candleGroup.position.y = cakeTopY;

    // Adicione o grupo de velas ao bolo
    this.cakeMesh.add(candleGroup);
}

    
  addDecorations() {
    const numDecorations = 10; // Número de decorações a serem adicionadas
    const decorationRadius = 0.75; // O raio do topo do bolo

    for (let i = 0; i < numDecorations; i++) {
        const angle = (i / numDecorations) * Math.PI * 2; // Distribui decorações em círculo
        const x = decorationRadius * Math.cos(angle);
        const z = decorationRadius * Math.sin(angle);

        // Criar geometria e material para a decoração (flores/frutas)
        const decorationGeometry = new THREE.SphereGeometry(0.05, 32, 32); // Tamanho da decoração
        const decorationMaterial = new THREE.MeshBasicMaterial({ color: 0xff69b4 }); // Cor rosa

        const decoration = new THREE.Mesh(decorationGeometry, decorationMaterial);
        decoration.position.set(x, this.cakeMeshSize / 2 + 0.2, z); // Posicionar decoração acima do bolo

        this.cakeMesh.add(decoration);
    }
}


    // Método para construir o mesh do bolo
   // Método para construir o mesh do bolo com textura
buildCake() {
    // Carregador de texturas
    const textureLoader = new THREE.TextureLoader();

    // Carregar a textura de chocolate
    const chocolateTexture = textureLoader.load("C:\Users\kingk\Music\sgi-tp1-base-main\sgi-tp1-base-main\Texture\chocolate-frosting-texture-background-close-up.jpg");
    chocolateTexture.wrapS = THREE.RepeatWrapping;
    chocolateTexture.wrapT = THREE.RepeatWrapping;
    chocolateTexture.repeat.set(1, 1);

    // Materiais para as camadas do bolo
    let cakeMaterial1 = new THREE.MeshStandardMaterial({
        map: chocolateTexture // Usar a textura como mapa
    });
    let cakeMaterial2 = new THREE.MeshStandardMaterial({
        color: 0xFFE4C4 // Cor de glacê
    });

    // Geometria para as camadas do bolo
    let cakeGeometry1 = new THREE.CylinderGeometry(0.75, 0.75, 0.15, 32);
    let cakeGeometry2 = new THREE.CylinderGeometry(0.65, 0.65, 0.1, 32);

    // Criar as malhas para as camadas
    let cakeMesh1 = new THREE.Mesh(cakeGeometry1, cakeMaterial1);
    let cakeMesh2 = new THREE.Mesh(cakeGeometry2, cakeMaterial2);

    // Posicionar as camadas
    cakeMesh1.position.y = 0.075; // Metade da altura da primeira camada
    cakeMesh2.position.y = 0.225; // Altura da primeira camada + metade da segunda

    // Adicionar as camadas à malha principal do bolo
    this.cakeMesh = new THREE.Group();
    this.cakeMesh.add(cakeMesh1);
    this.cakeMesh.add(cakeMesh2);

    // Posicionar a malha do bolo na cena
    this.cakeMesh.position.y = this.legHeight + this.tampoThickness / 2;

    // Adicionar o bolo à cena
    this.app.scene.add(this.cakeMesh);
    cakeMesh1.castShadow = true;
    cakeMesh1.receiveShadow = true;
    cakeMesh2.castShadow = true;
    cakeMesh2.receiveShadow = true;
}


    
    
 
 createChocolateTopping() {
     let chocolateMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513, shininess: 80 });
     let chocolateGeometry = new THREE.CylinderGeometry(0.75, 0.75, 0.05, 32);
     return new THREE.Mesh(chocolateGeometry, chocolateMaterial);
 }
 
 addStrawberriesToCake() {
     for (let i = 0; i < 5; i++) {
         let strawberryMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
         let strawberryGeometry = new THREE.SphereGeometry(0.1, 32, 32);
         let strawberryMesh = new THREE.Mesh(strawberryGeometry, strawberryMaterial);
         // Ajuste as coordenadas x, y, z para posicionar os morangos
         strawberryMesh.position.set(/* coordenadas x, y, z */);
         this.app.scene.add(strawberryMesh);
     }
 }

    // Método para criar uma mesa na cena
    createTable() {
        const tampoGeometry = new THREE.BoxGeometry(this.tampoLength, this.tampoThickness, this.tampoWidth);
        const legGeometry = new THREE.BoxGeometry(this.legThickness, this.legHeight, this.legThickness);
        const material = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    
        // Mesh para o tampo da mesa
        const tampo = new THREE.Mesh(tampoGeometry, material);
        tampo.position.set(0, this.legHeight + this.tampoThickness / 2, 0);
        tampo.castShadow = true;
        tampo.receiveShadow = true;
        this.app.scene.add(tampo);
    
        // Criação e adição de cada perna da mesa
        const offsetX = (this.tampoLength - this.legThickness) / 2;
        const offsetZ = (this.tampoWidth - this.legThickness) / 2;
    
        for (let i = 0; i < 4; i++) {
            const leg = new THREE.Mesh(legGeometry, material);
            leg.position.set(
                (i % 2 === 0 ? 1 : -1) * offsetX,
                this.legHeight / 2,
                (i < 2 ? 1 : -1) * offsetZ
            );
            leg.castShadow = true; // Habilita a perna a lançar sombras
            leg.receiveShadow = true; // Habilita a perna a receber sombras
            this.app.scene.add(leg);
        }
    }
    

    // Método para inicializar os conteúdos
    init() {
        // Cria o eixo e o adiciona à cena
        if (this.axis === null) {
            this.axis = new MyAxis(this);
            //this.app.scene.add(this.axis);
        }
    
        // Habilitar sombras no renderizador
        this.app.renderer.shadowMap.enabled = true;
        this.app.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
        // Luz direcional com sombras
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.5);
        dirLight.position.set(5, 10, 7.5);
        dirLight.castShadow = true;
        this.app.scene.add(dirLight);
    
        // Luz ambiente
        const ambientLight = new THREE.AmbientLight(0x555555);
        this.app.scene.add(ambientLight);
    
        // Primeiro construa o bolo
        this.buildCake();
    
        // Em seguida, crie e adicione as velas ao bolo
        this.createCandles();
    
        // Constrói a mesa
        this.createTable();
    
        // Cria e adiciona o plano
        let plane = new THREE.PlaneGeometry(10, 10);
        this.planeMesh = new THREE.Mesh(plane, this.planeMaterial);
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = 0;
        this.app.scene.add(this.planeMesh);
    
        // Configurações adicionais de luz e cena
        const pointLight = new THREE.PointLight(0xffffff, 500, 0);
        pointLight.position.set(0, 20, 0);
        pointLight.castShadow = true;
        this.app.scene.add(pointLight);
    
        const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.5);
        this.app.scene.add(pointLightHelper);
    }
    
    

    // Método para atualizar a cor difusa do plano
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value;
        this.planeMaterial.color.set(this.diffusePlaneColor);
    }

    // Método para atualizar a cor especular do plano
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value;
        this.planeMaterial.specular.set(this.specularPlaneColor);
    }

    // Método para atualizar a shininess do plano
    updatePlaneShininess(value) {
        this.planeShininess = value;
        this.planeMaterial.shininess = this.planeShininess;
    }

    // Método para reconstruir o mesh do bolo, se necessário
    rebuildCake() {
        if (this.cakeMesh !== undefined && this.cakeMesh !== null) {
            this.app.scene.remove(this.cakeMesh);
        }
        this.buildCake();
        this.lastCakeEnabled = null;
    }

    // Método para atualizar o mesh do bolo, se necessário
    updateCakeIfRequired() {
        if (this.cakeEnabled !== this.lastCakeEnabled) {
            this.lastCakeEnabled = this.cakeEnabled;
            if (this.cakeEnabled) {
                this.app.scene.add(this.cakeMesh);
            } else {
                this.app.scene.remove(this.cakeMesh);
            }
        }
    }

    // Método para atualizar os conteúdos
    update() {
        // Atualizar o bolo, se necessário
        this.updateCakeIfRequired();

        // Ajustar a posição do bolo com base no vetor de deslocamento
        this.cakeMesh.position.x = this.cakeDisplacement.x;
        this.cakeMesh.position.y = this.cakeDisplacement.y + this.legHeight + this.tampoThickness / 2;
        this.cakeMesh.position.z = this.cakeDisplacement.z;
    }
}

export { MyContents };

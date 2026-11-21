import * as THREE from 'three';

/**
 * 3D 판타지 무림 세계 환경 (지형, 건축물, 수련 기물, 지혜의 비석, 대기 파티클)
 */
export class WorldEnvironment {
  public group: THREE.Group;
  private floatingCrystals: THREE.Mesh[] = [];
  private monolithBookMesh!: THREE.Group;
  private particlesMesh!: THREE.Points;
  private particleCount = 180;
  private particlePositions!: Float32Array;

  // 지혜의 비석 월드 좌표 (상호작용 기준점)
  public static MONOLITH_POS = new THREE.Vector3(3.5, 0, -2.5);
  // 강호 만물상인 월드 좌표 (상점 기준점)
  public static MERCHANT_POS = new THREE.Vector3(-3.8, 0, -6.2);

  constructor() {
    this.group = new THREE.Group();

    // 1. 바닥 및 메인 수련 도장 (Terrain & Dojo Platform)
    this.createTerrain();

    // 2. 무림 건축물 (전통 기와 정자)
    this.createPavilion(new THREE.Vector3(0, 0, -8));

    // 3. 고대 지혜의 비석 (학습 퀘스트 오브젝트)
    this.createWisdomMonolith(WorldEnvironment.MONOLITH_POS);

    // 4. 강호 만물상인 NPC 오브젝트
    this.createMerchantShop(WorldEnvironment.MERCHANT_POS);

    // 5. 수련용 목인장 (Wooden Dummies)
    this.createWoodenDummy(new THREE.Vector3(-4, 0, -2));
    this.createWoodenDummy(new THREE.Vector3(-5.5, 0, 0.5));

    // 5. 무협 석등 (Stone Lanterns with subtle glow)
    this.createStoneLantern(new THREE.Vector3(-2.8, 0, 3));
    this.createStoneLantern(new THREE.Vector3(2.8, 0, 3));
    this.createStoneLantern(new THREE.Vector3(-3.2, 0, -5));
    this.createStoneLantern(new THREE.Vector3(3.2, 0, -5));

    // 6. 대나무 및 소나무 (Stylized Oriental Foliage)
    this.createFoliage();

    // 7. 부유하는 영기 수정 (Spirit Crystals)
    this.createSpiritCrystals();

    // 8. 대기 흩날리는 영기/꽃잎 파티클
    this.createAtmosphereParticles();
  }

  /**
   * 잔디 지형 및 원형 수련 석판
   */
  private createTerrain() {
    const groundGeo = new THREE.PlaneGeometry(80, 80, 32, 32);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      if (dist > 8) {
        posAttr.setZ(i, Math.sin(x * 0.15) * Math.cos(y * 0.15) * 1.2);
      }
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x40916c,
      roughness: 0.9
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.group.add(ground);

    // 중앙 수련 도장 원형 석판
    const dojoGeo = new THREE.CylinderGeometry(5.5, 5.8, 0.25, 32);
    const dojoMat = new THREE.MeshStandardMaterial({
      color: 0xd8d8d8,
      roughness: 0.6,
      metalness: 0.1
    });
    const dojo = new THREE.Mesh(dojoGeo, dojoMat);
    dojo.position.y = 0.125;
    dojo.receiveShadow = true;
    this.group.add(dojo);

    // 테두리 링
    const rimGeo = new THREE.TorusGeometry(5.2, 0.08, 8, 32);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xb08968,
      metalness: 0.3
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.26;
    this.group.add(rim);

    // 중앙 태극 문양
    const centerDecoGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.02, 32);
    const centerDecoMat = new THREE.MeshLambertMaterial({ color: 0x52b788 });
    const centerDeco = new THREE.Mesh(centerDecoGeo, centerDecoMat);
    centerDeco.position.y = 0.26;
    this.group.add(centerDeco);

    // 디딤돌 길
    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x8d99ae });
    for (let i = 0; i < 7; i++) {
      const stoneGeo = new THREE.CylinderGeometry(0.55 + (i % 2) * 0.1, 0.6, 0.12, 8);
      const stone = new THREE.Mesh(stoneGeo, stoneMat);
      stone.position.set(Math.sin(i * 0.8) * 0.3, 0.08, 6.5 + i * 1.4);
      stone.rotation.y = (i * 0.5);
      stone.receiveShadow = true;
      this.group.add(stone);
    }
  }

  /**
   * 고대 지혜의 비석 (학습 퀘스트 인터랙션 오브젝트)
   */
  private createWisdomMonolith(pos: THREE.Vector3) {
    const monolithGroup = new THREE.Group();
    monolithGroup.position.copy(pos);

    // 1. 비석 기단 (2단 받침)
    const base1Geo = new THREE.BoxGeometry(1.4, 0.3, 1.4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x2b2d42, roughness: 0.4 });
    const base1 = new THREE.Mesh(base1Geo, baseMat);
    base1.position.y = 0.15;
    base1.receiveShadow = true;
    monolithGroup.add(base1);

    const base2Geo = new THREE.BoxGeometry(1.1, 0.25, 1.1);
    const base2 = new THREE.Mesh(base2Geo, baseMat);
    base2.position.y = 0.4;
    monolithGroup.add(base2);

    // 2. 비석 몸체 (흑옥석 비석)
    const stoneGeo = new THREE.BoxGeometry(0.85, 2.2, 0.35);
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1d3557,
      roughness: 0.2,
      metalness: 0.4
    });
    const stone = new THREE.Mesh(stoneGeo, stoneMat);
    stone.position.y = 1.5;
    stone.castShadow = true;
    monolithGroup.add(stone);

    // 3. 비석 전면 황금 각인 판 (Wisdom Rune Inscription)
    const runePlateGeo = new THREE.PlaneGeometry(0.65, 1.6);
    const runeMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      side: THREE.DoubleSide
    });
    const runePlate = new THREE.Mesh(runePlateGeo, runeMat);
    runePlate.position.set(0, 1.5, 0.18);
    monolithGroup.add(runePlate);

    // 4. 비석 상단 공중 부유하는 "지혜의 서책 (Wisdom Tome)" 홀로그램
    this.monolithBookMesh = new THREE.Group();
    this.monolithBookMesh.position.y = 3.0;

    const bookCoverGeo = new THREE.BoxGeometry(0.55, 0.1, 0.4);
    const bookCoverMat = new THREE.MeshStandardMaterial({
      color: 0xd90429,
      emissive: 0x9e2a2b,
      emissiveIntensity: 0.3
    });
    const bookCover = new THREE.Mesh(bookCoverGeo, bookCoverMat);
    this.monolithBookMesh.add(bookCover);

    const pagesGeo = new THREE.BoxGeometry(0.5, 0.08, 0.36);
    const pagesMat = new THREE.MeshBasicMaterial({ color: 0xfffae0 });
    const pages = new THREE.Mesh(pagesGeo, pagesMat);
    pages.position.y = 0.01;
    this.monolithBookMesh.add(pages);

    // 홀로그램 영기 링
    const holoRingGeo = new THREE.RingGeometry(0.45, 0.52, 16);
    const holoRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7
    });
    const holoRing = new THREE.Mesh(holoRingGeo, holoRingMat);
    holoRing.rotation.x = Math.PI / 2;
    holoRing.position.y = -0.15;
    this.monolithBookMesh.add(holoRing);

    monolithGroup.add(this.monolithBookMesh);

    // 비석 주변 온화한 황금빛 포인트 라이트
    const monolithLight = new THREE.PointLight(0xffd166, 1.5, 7);
    monolithLight.position.y = 2.5;
    monolithGroup.add(monolithLight);

    this.group.add(monolithGroup);
  }

  /**
   * 강호 만물상인 NPC 오브젝트 (상점)
   */
  private createMerchantShop(pos: THREE.Vector3) {
    const shopGroup = new THREE.Group();
    shopGroup.position.copy(pos);

    // 가판대 테이블
    const tableGeo = new THREE.BoxGeometry(2.0, 0.7, 1.0);
    const woodMat = new THREE.MeshLambertMaterial({ color: 0x7f4f24 });
    const table = new THREE.Mesh(tableGeo, woodMat);
    table.position.y = 0.35;
    shopGroup.add(table);

    // 차양막 기둥 2개
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.2, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x582f0e });
    const poleL = new THREE.Mesh(poleGeo, poleMat);
    poleL.position.set(-0.9, 1.4, 0.4);
    shopGroup.add(poleL);
    const poleR = new THREE.Mesh(poleGeo, poleMat);
    poleR.position.set(0.9, 1.4, 0.4);
    shopGroup.add(poleR);

    // 차양막 지붕
    const canopyGeo = new THREE.BoxGeometry(2.3, 0.08, 1.3);
    const canopyMat = new THREE.MeshLambertMaterial({ color: 0xba181b });
    const canopy = new THREE.Mesh(canopyGeo, canopyMat);
    canopy.position.set(0, 2.4, 0.1);
    canopy.rotation.x = 0.2;
    shopGroup.add(canopy);

    // 상인 NPC 몸체 (차양막 뒤)
    const merchantGroup = new THREE.Group();
    merchantGroup.position.set(0, 0, -0.4);
    const mBodyGeo = new THREE.CylinderGeometry(0.3, 0.35, 1.0, 8);
    const mRobeMat = new THREE.MeshLambertMaterial({ color: 0x3d5a80 });
    const mBody = new THREE.Mesh(mBodyGeo, mRobeMat);
    mBody.position.y = 0.8;
    merchantGroup.add(mBody);

    // 상인 머리 & 삿갓
    const mHeadGeo = new THREE.SphereGeometry(0.22, 8, 8);
    const mSkinMat = new THREE.MeshLambertMaterial({ color: 0xffdfc4 });
    const mHead = new THREE.Mesh(mHeadGeo, mSkinMat);
    mHead.position.y = 1.45;
    merchantGroup.add(mHead);

    const hatGeo = new THREE.ConeGeometry(0.55, 0.2, 8);
    const hatMat = new THREE.MeshLambertMaterial({ color: 0xddb892 });
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.62;
    merchantGroup.add(hat);

    shopGroup.add(merchantGroup);

    // 상인 머리 위 회전하는 황금 코인 홀로그램
    const coinGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16);
    const coinMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0xffb703,
      emissiveIntensity: 0.3
    });
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    coin.position.set(0, 3.0, 0);
    shopGroup.add(coin);
    this.floatingCrystals.push(coin as any);

    // 상점 조명
    const shopLight = new THREE.PointLight(0xffb703, 1.2, 5);
    shopLight.position.set(0, 2.5, 0);
    shopGroup.add(shopLight);

    this.group.add(shopGroup);
  }

  /**
   * 전통 기와 정자 (Pavilion)
   */
  private createPavilion(pos: THREE.Vector3) {
    const pavilionGroup = new THREE.Group();
    pavilionGroup.position.copy(pos);

    const baseGeo = new THREE.BoxGeometry(5.5, 0.4, 5.5);
    const baseMat = new THREE.MeshLambertMaterial({ color: 0x9e2a2b });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.2;
    base.receiveShadow = true;
    pavilionGroup.add(base);

    const pillarMat = new THREE.MeshLambertMaterial({ color: 0xba181b });
    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.18, 3.2, 10);
    const offsets = [
      [-2, -2],
      [-2, 2],
      [2, -2],
      [2, 2]
    ];
    offsets.forEach(([x, z]) => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(x, 1.8, z);
      pillar.castShadow = true;
      pavilionGroup.add(pillar);
    });

    const roof1Geo = new THREE.ConeGeometry(4.6, 1.3, 4);
    const roofMat = new THREE.MeshLambertMaterial({ color: 0x1b4332 });
    const roof1 = new THREE.Mesh(roof1Geo, roofMat);
    roof1.position.y = 4.0;
    roof1.rotation.y = Math.PI / 4;
    roof1.castShadow = true;
    pavilionGroup.add(roof1);

    const roof2Geo = new THREE.ConeGeometry(2.8, 1.1, 4);
    const roof2 = new THREE.Mesh(roof2Geo, roofMat);
    roof2.position.y = 5.0;
    roof2.rotation.y = Math.PI / 4;
    roof2.castShadow = true;
    pavilionGroup.add(roof2);

    const topOrbGeo = new THREE.SphereGeometry(0.25, 12, 12);
    const topOrbMat = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.8 });
    const topOrb = new THREE.Mesh(topOrbGeo, topOrbMat);
    topOrb.position.y = 5.7;
    pavilionGroup.add(topOrb);

    this.group.add(pavilionGroup);
  }

  /**
   * 수련용 목인장 (Wooden Training Dummy)
   */
  private createWoodenDummy(pos: THREE.Vector3) {
    const dummyGroup = new THREE.Group();
    dummyGroup.position.copy(pos);

    const woodMat = new THREE.MeshLambertMaterial({ color: 0x7f4f24 });

    const postGeo = new THREE.CylinderGeometry(0.2, 0.22, 2.2, 10);
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.y = 1.1;
    post.castShadow = true;
    dummyGroup.add(post);

    const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.8, 6);
    const arm1 = new THREE.Mesh(armGeo, woodMat);
    arm1.position.set(-0.35, 1.5, 0.2);
    arm1.rotation.z = Math.PI / 3;
    dummyGroup.add(arm1);

    const arm2 = new THREE.Mesh(armGeo, woodMat);
    arm2.position.set(0.35, 1.4, 0.2);
    arm2.rotation.z = -Math.PI / 3;
    dummyGroup.add(arm2);

    const leg = new THREE.Mesh(armGeo, woodMat);
    leg.position.set(0, 0.7, 0.35);
    leg.rotation.x = Math.PI / 4;
    dummyGroup.add(leg);

    this.group.add(dummyGroup);
  }

  /**
   * 전통 석등 (Stone Lantern)
   */
  private createStoneLantern(pos: THREE.Vector3) {
    const lanternGroup = new THREE.Group();
    lanternGroup.position.copy(pos);

    const stoneMat = new THREE.MeshLambertMaterial({ color: 0x6c757d });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });

    const baseGeo = new THREE.BoxGeometry(0.7, 0.2, 0.7);
    const base = new THREE.Mesh(baseGeo, stoneMat);
    base.position.y = 0.1;
    lanternGroup.add(base);

    const pillarGeo = new THREE.CylinderGeometry(0.14, 0.18, 1.1, 8);
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.y = 0.75;
    lanternGroup.add(pillar);

    const lampGeo = new THREE.BoxGeometry(0.5, 0.45, 0.5);
    const lamp = new THREE.Mesh(lampGeo, glowMat);
    lamp.position.y = 1.4;
    lanternGroup.add(lamp);

    const capGeo = new THREE.ConeGeometry(0.65, 0.35, 4);
    const cap = new THREE.Mesh(capGeo, stoneMat);
    cap.position.y = 1.8;
    cap.rotation.y = Math.PI / 4;
    lanternGroup.add(cap);

    const lanternLight = new THREE.PointLight(0xffb703, 0.8, 5);
    lanternLight.position.y = 1.4;
    lanternGroup.add(lanternLight);

    this.group.add(lanternGroup);
  }

  /**
   * 대나무 및 소나무 무리 배치
   */
  private createFoliage() {
    const foliageGroup = new THREE.Group();

    const bambooTrunkMat = new THREE.MeshLambertMaterial({ color: 0x55a630 });
    const bambooLeavesMat = new THREE.MeshLambertMaterial({ color: 0x80b918 });
    const pineLeavesMat = new THREE.MeshLambertMaterial({ color: 0x2d6a4f });
    const pineTrunkMat = new THREE.MeshLambertMaterial({ color: 0x582f0e });

    for (let i = 0; i < 16; i++) {
      const bx = 7 + (i % 4) * 1.5 + (Math.sin(i) * 0.8);
      const bz = -6 + Math.floor(i / 4) * 2.2 + (Math.cos(i) * 0.8);
      const bHeight = 4.5 + (i % 3) * 1.2;

      const bTrunkGeo = new THREE.CylinderGeometry(0.08, 0.1, bHeight, 6);
      const bTrunk = new THREE.Mesh(bTrunkGeo, bambooTrunkMat);
      bTrunk.position.set(bx, bHeight / 2, bz);
      bTrunk.rotation.z = (Math.sin(i * 2) * 0.05);
      bTrunk.castShadow = true;
      foliageGroup.add(bTrunk);

      const bLeavesGeo = new THREE.ConeGeometry(0.8, 1.6, 5);
      const bLeaves = new THREE.Mesh(bLeavesGeo, bambooLeavesMat);
      bLeaves.position.set(bx, bHeight + 0.5, bz);
      foliageGroup.add(bLeaves);
    }

    const pinePositions = [
      new THREE.Vector3(-9, 0, -6),
      new THREE.Vector3(-12, 0, -2),
      new THREE.Vector3(-8, 0, 5),
      new THREE.Vector3(10, 0, 8)
    ];

    pinePositions.forEach((pos) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.copy(pos);

      const pTrunkGeo = new THREE.CylinderGeometry(0.25, 0.45, 3.5, 8);
      const pTrunk = new THREE.Mesh(pTrunkGeo, pineTrunkMat);
      pTrunk.position.y = 1.75;
      pTrunk.rotation.z = -0.08;
      pTrunk.castShadow = true;
      treeGroup.add(pTrunk);

      for (let layer = 0; layer < 3; layer++) {
        const pLeavesGeo = new THREE.ConeGeometry(2.2 - layer * 0.45, 1.5, 7);
        const pLeaves = new THREE.Mesh(pLeavesGeo, pineLeavesMat);
        pLeaves.position.y = 3.2 + layer * 1.0;
        pLeaves.castShadow = true;
        treeGroup.add(pLeaves);
      }

      foliageGroup.add(treeGroup);
    });

    this.group.add(foliageGroup);
  }

  /**
   * 신비로운 무림의 영기 수정
   */
  private createSpiritCrystals() {
    const crystalGeo = new THREE.OctahedronGeometry(0.65, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x00f5d4,
      roughness: 0.15,
      metalness: 0.8,
      emissive: 0x00bbf9,
      emissiveIntensity: 0.5
    });

    const positions = [
      new THREE.Vector3(5, 2.5, -2),
      new THREE.Vector3(-5, 2.8, -7)
    ];

    positions.forEach((pos) => {
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.copy(pos);
      this.group.add(crystal);
      this.floatingCrystals.push(crystal);

      const light = new THREE.PointLight(0x00f5d4, 1.2, 6);
      light.position.copy(pos);
      this.group.add(light);
    });
  }

  /**
   * 대기 중 흩날리는 무림 영기/꽃잎 파티클
   */
  private createAtmosphereParticles() {
    const geo = new THREE.BufferGeometry();
    this.particlePositions = new Float32Array(this.particleCount * 3);

    for (let i = 0; i < this.particleCount; i++) {
      this.particlePositions[i * 3] = (Math.random() - 0.5) * 28;
      this.particlePositions[i * 3 + 1] = Math.random() * 8 + 0.2;
      this.particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffccd5,
      size: 0.14,
      transparent: true,
      opacity: 0.75
    });

    this.particlesMesh = new THREE.Points(geo, mat);
    this.group.add(this.particlesMesh);
  }

  /**
   * 애니메이션 업데이트
   */
  public update(time: number) {
    // 1. 영기 수정 회전
    this.floatingCrystals.forEach((crystal, idx) => {
      crystal.rotation.y = time * 0.9 + idx;
      crystal.rotation.x = Math.sin(time + idx) * 0.2;
      crystal.position.y += Math.sin(time * 2 + idx) * 0.004;
    });

    // 2. 지혜의 비석 상단 서책 부유 회전
    if (this.monolithBookMesh) {
      this.monolithBookMesh.rotation.y = time * 1.2;
      this.monolithBookMesh.position.y = 3.0 + Math.sin(time * 3) * 0.08;
    }

    // 3. 파티클 흩날림
    if (this.particlesMesh && this.particlePositions) {
      const pos = this.particlesMesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < this.particleCount; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let z = pos.getZ(i);

        x += Math.sin(time + i) * 0.01 + 0.008;
        y -= 0.007;
        z += Math.cos(time + i) * 0.006;

        if (y < 0.1) {
          y = 8.0;
          x = (Math.random() - 0.5) * 28;
          z = (Math.random() - 0.5) * 28;
        }

        pos.setXYZ(i, x, y, z);
      }
      pos.needsUpdate = true;
    }
  }
}

import * as THREE from 'three';

/**
 * 독창적인 스타일라이즈드 3D 무림 수련생 캐릭터
 * 유휴(Idle), 달리기(Run), 점프(Jump) 애니메이션 지원
 */
export class CharacterModel {
  public group: THREE.Group;
  private headGroup: THREE.Group;
  private bodyMesh: THREE.Mesh;
  private leftArmGroup: THREE.Group;
  private rightArmGroup: THREE.Group;
  private leftLeg: THREE.Mesh;
  private rightLeg: THREE.Mesh;
  private leftBoot: THREE.Mesh;
  private rightBoot: THREE.Mesh;
  private swordGroup: THREE.Group;
  private auraRing: THREE.Mesh;
  private ribbonMesh: THREE.Mesh;

  // 이동 모션 파라미터
  private runCycle = 0;

  constructor() {
    this.group = new THREE.Group();

    // 1. 머티리얼 정의 (무림 스타일 컬러 팔레트)
    const skinMat = new THREE.MeshLambertMaterial({ color: 0xffdfc4 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x1f2421 });
    const robeMat = new THREE.MeshLambertMaterial({ color: 0x22577a }); // 청운문파 짙은 청색 도포
    const robeTrimMat = new THREE.MeshLambertMaterial({ color: 0xe0fbfc }); // 백색/연하늘 장식선
    const beltMat = new THREE.MeshLambertMaterial({ color: 0xd90429 }); // 붉은 비단 허리띠
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x1d3557 }); // 짙은 네이비 바지
    const bootsMat = new THREE.MeshLambertMaterial({ color: 0x2b2d42 }); // 가죽 신발
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xcfd8dc,
      metalness: 0.85,
      roughness: 0.25
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffb703,
      metalness: 0.9,
      roughness: 0.3
    });
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0x48cae4,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });

    // 2. 몸통 (Body)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.28, 1.0, 8);
    this.bodyMesh = new THREE.Mesh(bodyGeo, robeMat);
    this.bodyMesh.position.y = 1.35;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // 몸통 깃 & 가슴 장식
    const vestGeo = new THREE.CylinderGeometry(0.36, 0.29, 0.5, 8);
    const vestMesh = new THREE.Mesh(vestGeo, robeTrimMat);
    vestMesh.position.y = 0.22;
    this.bodyMesh.add(vestMesh);

    // 허리띠
    const beltGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.16, 8);
    const beltMesh = new THREE.Mesh(beltGeo, beltMat);
    beltMesh.position.y = -0.32;
    this.bodyMesh.add(beltMesh);

    // 허리띠 매듭 술
    const knotGeo = new THREE.BoxGeometry(0.08, 0.3, 0.05);
    const knotMesh = new THREE.Mesh(knotGeo, beltMat);
    knotMesh.position.set(0, -0.45, 0.32);
    this.bodyMesh.add(knotMesh);

    // 3. 머리 그룹 (Head & Hair)
    this.headGroup = new THREE.Group();
    this.headGroup.position.y = 2.05;

    // 얼굴
    const headGeo = new THREE.SphereGeometry(0.26, 12, 12);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.castShadow = true;
    this.headGroup.add(headMesh);

    // 머리카락 (상투 헤어스타일)
    const hairGeo = new THREE.SphereGeometry(0.28, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.y = 0.04;
    this.headGroup.add(hairMesh);

    // 상투 묶음
    const topKnotGeo = new THREE.CylinderGeometry(0.08, 0.09, 0.16, 8);
    const topKnot = new THREE.Mesh(topKnotGeo, hairMat);
    topKnot.position.y = 0.34;
    this.headGroup.add(topKnot);

    // 상투 비녀
    const pinGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.35, 6);
    const pinMesh = new THREE.Mesh(pinGeo, goldMat);
    pinMesh.rotation.z = Math.PI / 2;
    pinMesh.position.y = 0.35;
    this.headGroup.add(pinMesh);

    // 이마 띠 & 흩날리는 리본
    const headbandGeo = new THREE.TorusGeometry(0.27, 0.03, 6, 16);
    const headband = new THREE.Mesh(headbandGeo, beltMat);
    headband.rotation.x = Math.PI / 2;
    headband.position.y = 0.06;
    this.headGroup.add(headband);

    const ribbonGeo = new THREE.BoxGeometry(0.06, 0.45, 0.02);
    this.ribbonMesh = new THREE.Mesh(ribbonGeo, beltMat);
    this.ribbonMesh.position.set(0, 0.02, -0.28);
    this.ribbonMesh.rotation.x = 0.3;
    this.headGroup.add(this.ribbonMesh);

    this.group.add(this.headGroup);

    // 4. 팔 (Arms)
    // 왼팔
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(-0.45, 1.7, 0);
    const armGeo = new THREE.CylinderGeometry(0.1, 0.08, 0.65, 8);
    const leftArmMesh = new THREE.Mesh(armGeo, robeMat);
    leftArmMesh.position.y = -0.3;
    leftArmMesh.castShadow = true;
    this.leftArmGroup.add(leftArmMesh);
    const handGeo = new THREE.SphereGeometry(0.09, 8, 8);
    const leftHand = new THREE.Mesh(handGeo, skinMat);
    leftHand.position.y = -0.65;
    this.leftArmGroup.add(leftHand);
    this.group.add(this.leftArmGroup);

    // 오른팔
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(0.45, 1.7, 0);
    const rightArmMesh = new THREE.Mesh(armGeo, robeMat);
    rightArmMesh.position.y = -0.3;
    rightArmMesh.castShadow = true;
    this.rightArmGroup.add(rightArmMesh);
    const rightHand = new THREE.Mesh(handGeo, skinMat);
    rightHand.position.y = -0.65;
    this.rightArmGroup.add(rightHand);
    this.group.add(this.rightArmGroup);

    // 5. 무협 보검 (청운검)
    this.swordGroup = new THREE.Group();
    const bladeGeo = new THREE.BoxGeometry(0.06, 0.9, 0.02);
    const bladeMesh = new THREE.Mesh(bladeGeo, metalMat);
    bladeMesh.position.y = 0.45;
    bladeMesh.castShadow = true;
    this.swordGroup.add(bladeMesh);
    const guardGeo = new THREE.BoxGeometry(0.24, 0.04, 0.06);
    const guardMesh = new THREE.Mesh(guardGeo, goldMat);
    this.swordGroup.add(guardMesh);
    const gripGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.22, 6);
    const gripMesh = new THREE.Mesh(gripGeo, beltMat);
    gripMesh.position.y = -0.11;
    this.swordGroup.add(gripMesh);
    const pommelGeo = new THREE.SphereGeometry(0.04, 8, 8);
    const pommelMesh = new THREE.Mesh(pommelGeo, goldMat);
    pommelMesh.position.y = -0.22;
    this.swordGroup.add(pommelMesh);
    const tasselGeo = new THREE.ConeGeometry(0.04, 0.15, 6);
    const tasselMesh = new THREE.Mesh(tasselGeo, beltMat);
    tasselMesh.position.y = -0.32;
    tasselMesh.rotation.x = Math.PI;
    this.swordGroup.add(tasselMesh);

    // 오른손에 검 장착
    this.swordGroup.position.set(0, -0.65, 0.15);
    this.swordGroup.rotation.x = Math.PI / 4;
    this.swordGroup.rotation.z = -Math.PI / 12;
    this.rightArmGroup.add(this.swordGroup);

    // 6. 다리 (Legs & Boots)
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.65, 8);
    this.leftLeg = new THREE.Mesh(legGeo, pantsMat);
    this.leftLeg.position.set(-0.2, 0.65, 0);
    this.leftLeg.castShadow = true;
    this.group.add(this.leftLeg);

    this.rightLeg = new THREE.Mesh(legGeo, pantsMat);
    this.rightLeg.position.set(0.2, 0.65, 0);
    this.rightLeg.castShadow = true;
    this.group.add(this.rightLeg);

    // 부츠
    const bootGeo = new THREE.BoxGeometry(0.18, 0.22, 0.28);
    this.leftBoot = new THREE.Mesh(bootGeo, bootsMat);
    this.leftBoot.position.set(-0.2, 0.12, 0.04);
    this.leftBoot.castShadow = true;
    this.group.add(this.leftBoot);

    this.rightBoot = new THREE.Mesh(bootGeo, bootsMat);
    this.rightBoot.position.set(0.2, 0.12, 0.04);
    this.rightBoot.castShadow = true;
    this.group.add(this.rightBoot);

    // 7. 발밑 무림 영기 링 (Spirit Aura Ring)
    const auraGeo = new THREE.RingGeometry(0.7, 0.85, 24);
    this.auraRing = new THREE.Mesh(auraGeo, auraMat);
    this.auraRing.rotation.x = -Math.PI / 2;
    this.auraRing.position.y = 0.02;
    this.group.add(this.auraRing);
  }

  /**
   * 프레임별 상태 애니메이션 (Idle, Run, Jump)
   * @param time 경과 시간
   * @param isMoving 이동 중 여부
   * @param speed 이동 속도 계수
   * @param isJumping 점프 상태 여부
   */
  public update(time: number, isMoving = false, speed = 1, isJumping = false) {
    if (isJumping) {
      // 점프 중 모션: 공중 도약 자세
      this.bodyMesh.position.y = 1.45;
      this.leftArmGroup.rotation.x = -0.6;
      this.rightArmGroup.rotation.x = 0.4;
      this.leftLeg.rotation.x = 0.35;
      this.rightLeg.rotation.x = -0.35;
      this.leftBoot.position.z = 0.15;
      this.rightBoot.position.z = -0.05;
      this.ribbonMesh.rotation.x = 0.6;
    } else if (isMoving) {
      // 달리기 모션
      this.runCycle += 0.18 * speed;
      const legSwing = Math.sin(this.runCycle) * 0.65;
      const armSwing = Math.cos(this.runCycle) * 0.55;
      const bodyBounce = Math.abs(Math.sin(this.runCycle)) * 0.08;

      // 몸체 및 머리 상하 바운스 & 살짝 전방 기울임
      this.bodyMesh.position.y = 1.35 + bodyBounce;
      this.bodyMesh.rotation.x = 0.12;
      this.headGroup.position.y = 2.05 + bodyBounce * 1.1;

      // 다리 앞뒤 교차
      this.leftLeg.rotation.x = legSwing;
      this.rightLeg.rotation.x = -legSwing;
      this.leftBoot.position.z = 0.04 + Math.sin(this.runCycle) * 0.22;
      this.rightBoot.position.z = 0.04 - Math.sin(this.runCycle) * 0.22;

      // 팔 앞뒤 흔들기
      this.leftArmGroup.rotation.x = -armSwing;
      this.rightArmGroup.rotation.x = armSwing;

      // 리본 바람에 날림
      this.ribbonMesh.rotation.x = 0.55 + Math.sin(this.runCycle * 1.5) * 0.1;
      this.ribbonMesh.rotation.z = Math.cos(this.runCycle) * 0.15;
    } else {
      // 정지(Idle) 호흡 모션으로 자연스럽게 복귀
      this.bodyMesh.rotation.x = 0;
      this.leftLeg.rotation.x = 0;
      this.rightLeg.rotation.x = 0;
      this.leftBoot.position.z = 0.04;
      this.rightBoot.position.z = 0.04;

      const breath = Math.sin(time * 2.5) * 0.03;
      this.bodyMesh.position.y = 1.35 + breath;
      this.headGroup.position.y = 2.05 + breath * 1.2;
      this.leftArmGroup.rotation.x = 0;
      this.leftArmGroup.rotation.z = Math.sin(time * 2.5) * 0.06 - 0.1;
      this.rightArmGroup.rotation.x = Math.sin(time * 2.5) * 0.05;

      this.ribbonMesh.rotation.z = Math.sin(time * 4) * 0.12;
      this.ribbonMesh.rotation.x = 0.3 + Math.cos(time * 3.5) * 0.08;
    }

    // 영기 링 천천히 회전
    this.auraRing.rotation.z = time * 0.8;
    const pulse = 1 + Math.sin(time * 3) * 0.08;
    this.auraRing.scale.set(pulse, pulse, 1);
  }
}

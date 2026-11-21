import * as THREE from 'three';

export type MonsterType = 'goblin' | 'boss_golem';
export type MonsterState = 'patrol' | 'chase' | 'attack' | 'hit' | 'dead';

/**
 * 독창적인 3D 몬스터 모델 (도깨비 일반 몹 & 흑요석 골렘 보스)
 */
export class MonsterModel {
  public group: THREE.Group;
  public type: MonsterType;
  public maxHp: number;
  public currentHp: number;
  public atk: number;
  public def: number;
  public expReward: number;
  public goldReward: number;
  public name: string;

  public state: MonsterState = 'patrol';
  public spawnPos: THREE.Vector3;
  private patrolTarget: THREE.Vector3;
  private patrolTimer = 0;

  // 피격 플래시 & 애니메이션 타이머
  private hitTimer = 0;
  private attackTimer = 0;
  public isDead = false;
  public deathTimer = 0;

  // 부속 메쉬
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private weaponMesh!: THREE.Mesh;
  private originalMaterials: THREE.Material[] = [];
  private hitMaterial = new THREE.MeshBasicMaterial({ color: 0xff0033 });

  // 3D HP 바 메쉬
  private hpBarGroup!: THREE.Group;
  private hpFillMesh!: THREE.Mesh;

  constructor(type: MonsterType, position: THREE.Vector3) {
    this.type = type;
    this.spawnPos = position.clone();
    this.patrolTarget = position.clone();
    this.group = new THREE.Group();
    this.group.position.copy(position);

    if (type === 'boss_golem') {
      this.name = '천년 흑요석 골렘 [보스]';
      this.maxHp = 650;
      this.currentHp = 650;
      this.atk = 45;
      this.def = 30;
      this.expReward = 450;
      this.goldReward = 350;
      this.createBossGolemMesh();
    } else {
      this.name = '수련 흑호 도깨비';
      this.maxHp = 140;
      this.currentHp = 140;
      this.atk = 22;
      this.def = 10;
      this.expReward = 95;
      this.goldReward = 70;
      this.createGoblinMesh();
    }

    // 3D 머리 위 HP 바 생성
    this.createHpBar();
  }

  /**
   * 일반 몬스터: 수련 흑호 도깨비 메쉬 생성
   */
  private createGoblinMesh() {
    const skinMat = new THREE.MeshLambertMaterial({ color: 0x9b2226 }); // 붉은 도깨비 피부
    const hornMat = new THREE.MeshStandardMaterial({ color: 0xffb703, metalness: 0.8 }); // 황금 뿔
    const clubMat = new THREE.MeshLambertMaterial({ color: 0x582f0e }); // 도깨비 쇠방망이
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x2b2d42 }); // 호랑이 가죽바지

    // 몸통
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.28, 0.9, 8);
    this.bodyMesh = new THREE.Mesh(bodyGeo, skinMat);
    this.bodyMesh.position.y = 0.95;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // 하의
    const pantsGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.35, 8);
    const pants = new THREE.Mesh(pantsGeo, pantsMat);
    pants.position.y = -0.3;
    this.bodyMesh.add(pants);

    // 머리
    const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    this.headMesh = new THREE.Mesh(headGeo, skinMat);
    this.headMesh.position.y = 1.65;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // 도깨비 외뿔
    const hornGeo = new THREE.ConeGeometry(0.09, 0.35, 6);
    const horn = new THREE.Mesh(hornGeo, hornMat);
    horn.position.set(0, 0.35, 0.08);
    horn.rotation.x = -0.2;
    this.headMesh.add(horn);

    // 눈 (빛나는 안광)
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffea00 });
    const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
    const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
    eyeLeft.position.set(-0.14, 0.06, 0.26);
    this.headMesh.add(eyeLeft);
    const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
    eyeRight.position.set(0.14, 0.06, 0.26);
    this.headMesh.add(eyeRight);

    // 도깨비 쇠방망이 (무기)
    const clubGroup = new THREE.Group();
    clubGroup.position.set(0.5, 1.2, 0);
    const handleGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6);
    const handle = new THREE.Mesh(handleGeo, clubMat);
    clubGroup.add(handle);
    const topClubGeo = new THREE.CylinderGeometry(0.16, 0.1, 0.5, 8);
    const topClub = new THREE.Mesh(topClubGeo, clubMat);
    topClub.position.y = 0.35;
    clubGroup.add(topClub);
    clubGroup.rotation.x = Math.PI / 4;
    this.weaponMesh = clubGroup as any;
    this.group.add(clubGroup);

    // 다리 2개
    const legGeo = new THREE.CylinderGeometry(0.12, 0.1, 0.55, 6);
    const leftLeg = new THREE.Mesh(legGeo, skinMat);
    leftLeg.position.set(-0.18, 0.3, 0);
    this.group.add(leftLeg);
    const rightLeg = new THREE.Mesh(legGeo, skinMat);
    rightLeg.position.set(0.18, 0.3, 0);
    this.group.add(rightLeg);

    // 도깨비불 이펙트 파티클
    const fireGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const fireMat = new THREE.MeshBasicMaterial({ color: 0x00f5d4 });
    const fire = new THREE.Mesh(fireGeo, fireMat);
    fire.position.set(0.4, 2.0, -0.2);
    this.group.add(fire);
  }

  /**
   * 보스 몬스터: 천년 흑요석 골렘 메쉬 생성
   */
  private createBossGolemMesh() {
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x1f2421,
      roughness: 0.3,
      metalness: 0.7
    });
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0055 }); // 붉은 영기 코어
    const runeMat = new THREE.MeshBasicMaterial({ color: 0xffb703 });

    // 거대한 몸통
    const bodyGeo = new THREE.BoxGeometry(1.6, 1.8, 1.2);
    this.bodyMesh = new THREE.Mesh(bodyGeo, stoneMat);
    this.bodyMesh.position.y = 2.0;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // 가슴 중앙 빛나는 붉은 골렘 영핵 (Core)
    const coreGeo = new THREE.OctahedronGeometry(0.45, 0);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 0.2, 0.65);
    this.bodyMesh.add(core);

    // 거대한 어깨 갑주
    const shoulderGeo = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const shoulderL = new THREE.Mesh(shoulderGeo, stoneMat);
    shoulderL.position.set(-1.15, 0.7, 0);
    this.bodyMesh.add(shoulderL);
    const shoulderR = new THREE.Mesh(shoulderGeo, stoneMat);
    shoulderR.position.set(1.15, 0.7, 0);
    this.bodyMesh.add(shoulderR);

    // 바위 주먹 팔
    const armGeo = new THREE.BoxGeometry(0.5, 1.4, 0.5);
    const armL = new THREE.Mesh(armGeo, stoneMat);
    armL.position.set(-1.15, -0.3, 0.2);
    this.bodyMesh.add(armL);
    const armR = new THREE.Mesh(armGeo, stoneMat);
    armR.position.set(1.15, -0.3, 0.2);
    this.bodyMesh.add(armR);

    // 머리
    const headGeo = new THREE.BoxGeometry(0.8, 0.7, 0.8);
    this.headMesh = new THREE.Mesh(headGeo, stoneMat);
    this.headMesh.position.y = 3.2;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // 눈 틈새
    const eyeSlotGeo = new THREE.BoxGeometry(0.5, 0.1, 0.05);
    const eyeSlot = new THREE.Mesh(eyeSlotGeo, coreMat);
    eyeSlot.position.set(0, 0.05, 0.42);
    this.headMesh.add(eyeSlot);

    // 굵은 다리
    const legGeo = new THREE.BoxGeometry(0.65, 1.2, 0.65);
    const legL = new THREE.Mesh(legGeo, stoneMat);
    legL.position.set(-0.55, 0.6, 0);
    this.group.add(legL);
    const legR = new THREE.Mesh(legGeo, stoneMat);
    legR.position.set(0.55, 0.6, 0);
    this.group.add(legR);

    // 골렘 발밑 충격파 링
    const bossAuraGeo = new THREE.RingGeometry(1.5, 1.8, 24);
    const bossAuraMat = new THREE.MeshBasicMaterial({
      color: 0xff0055,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const bossAura = new THREE.Mesh(bossAuraGeo, bossAuraMat);
    bossAura.rotation.x = -Math.PI / 2;
    bossAura.position.y = 0.02;
    this.group.add(bossAura);
  }

  /**
   * 머리 위 3D 빌보드 HP 게이지 바 생성
   */
  private createHpBar() {
    this.hpBarGroup = new THREE.Group();
    const barHeight = this.type === 'boss_golem' ? 4.1 : 2.4;
    this.hpBarGroup.position.y = barHeight;

    // 배경 트랙
    const trackWidth = this.type === 'boss_golem' ? 2.2 : 1.2;
    const trackGeo = new THREE.PlaneGeometry(trackWidth, 0.16);
    const trackMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    const track = new THREE.Mesh(trackGeo, trackMat);
    this.hpBarGroup.add(track);

    // 채워지는 게이지
    const fillGeo = new THREE.PlaneGeometry(trackWidth - 0.04, 0.12);
    const fillMat = new THREE.MeshBasicMaterial({
      color: this.type === 'boss_golem' ? 0xff0055 : 0xe63946,
      side: THREE.DoubleSide
    });
    this.hpFillMesh = new THREE.Mesh(fillGeo, fillMat);
    this.hpFillMesh.position.z = 0.01;
    this.hpBarGroup.add(this.hpFillMesh);

    this.group.add(this.hpBarGroup);
  }

  /**
   * 피해 적용
   */
  public takeDamage(damage: number, knockbackDir?: THREE.Vector3): boolean {
    if (this.isDead) return false;

    this.currentHp = Math.max(0, this.currentHp - damage);
    this.hitTimer = 0.25; // 0.25초 피격 플래시
    this.state = 'hit';

    // 넉백 적용
    if (knockbackDir) {
      this.group.position.addScaledVector(knockbackDir, this.type === 'boss_golem' ? 0.3 : 1.0);
    }

    // HP 바 업데이트
    const hpPercent = Math.max(0, this.currentHp / this.maxHp);
    this.hpFillMesh.scale.x = hpPercent;
    // 왼쪽 기준 축소
    const trackWidth = this.type === 'boss_golem' ? 2.2 : 1.2;
    this.hpFillMesh.position.x = ((hpPercent - 1) * trackWidth) / 2;

    if (this.currentHp <= 0) {
      this.isDead = true;
      this.state = 'dead';
      return true; // 처치됨
    }

    return false;
  }

  /**
   * 프레임별 AI 및 애니메이션 업데이트
   */
  public update(delta: number, playerPos: THREE.Vector3, camera: THREE.Camera) {
    if (this.isDead) {
      this.deathTimer += delta;
      // 천천히 침강 및 축소 소멸 연출
      this.group.position.y -= delta * 0.8;
      this.group.scale.multiplyScalar(Math.max(0.01, 1 - delta * 1.5));
      return;
    }

    // 1. HP 바가 항상 카메라를 바라보도록 회전 (Billboard)
    if (this.hpBarGroup) {
      this.hpBarGroup.quaternion.copy(camera.quaternion);
    }

    // 2. 피격 플래시 복구 타이머
    if (this.hitTimer > 0) {
      this.hitTimer -= delta;
      this.bodyMesh.material = this.hitMaterial;
    } else {
      // 본래 상태 복구
      this.bodyMesh.material =
        this.type === 'boss_golem'
          ? (new THREE.MeshStandardMaterial({ color: 0x1f2421, roughness: 0.3 }) as any)
          : (new THREE.MeshLambertMaterial({ color: 0x9b2226 }) as any);
    }

    // 3. 플레이어와의 거리 계산
    const dx = playerPos.x - this.group.position.x;
    const dz = playerPos.z - this.group.position.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    const chaseRange = this.type === 'boss_golem' ? 14.0 : 8.5;
    const attackRange = this.type === 'boss_golem' ? 2.6 : 1.7;

    // 4. 상태 머신 AI
    if (dist <= attackRange) {
      // 공격 사거리 내
      this.state = 'attack';
      this.attackTimer += delta;

      // 플레이어를 바라봄
      const targetAngle = Math.atan2(dx, dz);
      this.group.rotation.y = targetAngle;

      // 공격 팔/무기 스윙 애니메이션
      if (this.weaponMesh) {
        this.weaponMesh.rotation.x = Math.sin(this.attackTimer * 6) * 0.6 + Math.PI / 4;
      }
    } else if (dist <= chaseRange) {
      // 플레이어 추적
      this.state = 'chase';
      const moveSpeed = this.type === 'boss_golem' ? 2.8 : 3.8;

      const targetAngle = Math.atan2(dx, dz);
      this.group.rotation.y = targetAngle;

      this.group.position.x += (dx / dist) * moveSpeed * delta;
      this.group.position.z += (dz / dist) * moveSpeed * delta;

      // 걷기 바운스
      this.bodyMesh.position.y =
        (this.type === 'boss_golem' ? 2.0 : 0.95) + Math.sin(this.attackTimer * 8) * 0.08;
    } else {
      // 기본 순찰(Patrol)
      this.state = 'patrol';
      this.patrolTimer += delta;
      if (this.patrolTimer > 4.5) {
        this.patrolTimer = 0;
        // 스폰 지점 반경 4m 내 랜덤 지점 선택
        const rx = this.spawnPos.x + (Math.random() - 0.5) * 6;
        const rz = this.spawnPos.z + (Math.random() - 0.5) * 6;
        this.patrolTarget.set(rx, 0, rz);
      }

      const pdx = this.patrolTarget.x - this.group.position.x;
      const pdz = this.patrolTarget.z - this.group.position.z;
      const pDist = Math.sqrt(pdx * pdx + pdz * pdz);

      if (pDist > 0.5) {
        const pAngle = Math.atan2(pdx, pdz);
        this.group.rotation.y = pAngle;
        const pSpeed = 1.2;
        this.group.position.x += (pdx / pDist) * pSpeed * delta;
        this.group.position.z += (pdz / pDist) * pSpeed * delta;
      }
    }
  }
}

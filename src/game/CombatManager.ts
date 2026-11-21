import * as THREE from 'three';
import { MonsterManager } from './MonsterManager';
import { MonsterModel } from './MonsterModel';
import { SoundEffects } from '../services/soundEffects';

export interface FloatingDamageText {
  id: number;
  text: string;
  isCrit: boolean;
  x: number;
  y: number;
  z: number;
  life: number;
}

interface Projectile {
  mesh: THREE.Mesh;
  direction: THREE.Vector3;
  speed: number;
  distanceTraveled: number;
  maxDistance: number;
  damage: number;
  piercedMonsters: Set<MonsterModel>;
}

interface Shockwave {
  mesh: THREE.Mesh;
  radius: number;
  maxRadius: number;
  speed: number;
}

interface FallingSword {
  mesh: THREE.Group;
  targetY: number;
  speed: number;
  hasLanded: boolean;
  damage: number;
}

/**
 * 실시간 전투 판정, 공격 애니메이션, 3대 무공 스킬 이펙트 총괄
 */
export class CombatManager {
  private scene: THREE.Scene;
  private monsterMgr: MonsterManager;

  // 투사체 및 특수 이펙트 풀
  private projectiles: Projectile[] = [];
  private shockwaves: Shockwave[] = [];
  private fallingSwords: FallingSword[] = [];

  // 플로팅 대미지 리스트 (UI 렌더링용)
  public floatingTexts: FloatingDamageText[] = [];
  private textIdCounter = 0;

  // 타격 성공 시 콜백
  public onHitMonster?: (damage: number, isCrit: boolean, monster: MonsterModel) => void;

  constructor(scene: THREE.Scene, monsterMgr: MonsterManager) {
    this.scene = scene;
    this.monsterMgr = monsterMgr;
  }

  /**
   * 1. 기본 검술 (근접 부채꼴 베기)
   */
  public executeBasicAttack(playerPos: THREE.Vector3, playerRotY: number, playerAtk: number) {
    SoundEffects.playSwordSlash();
    // 1-1. 반원형 검기 호(Arc) 이펙트 순간 생성
    const slashGeo = new THREE.RingGeometry(1.2, 2.2, 16, 1, 0, Math.PI * 0.85);
    const slashMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95
    });
    const slashMesh = new THREE.Mesh(slashGeo, slashMat);
    slashMesh.rotation.x = -Math.PI / 2;
    slashMesh.rotation.z = -playerRotY - Math.PI * 0.42;
    slashMesh.position.set(playerPos.x, 1.2, playerPos.z);
    this.scene.add(slashMesh);

    // 0.15초 후 소멸 애니메이션
    let slashLife = 0.16;
    const slashInterval = setInterval(() => {
      slashLife -= 0.04;
      slashMesh.scale.multiplyScalar(1.08);
      slashMat.opacity = Math.max(0, slashLife * 6);
      if (slashLife <= 0) {
        clearInterval(slashInterval);
        this.scene.remove(slashMesh);
      }
    }, 40);

    // 1-2. 부채꼴 범위 내 몬스터 타격 판정
    const attackRange = 2.7;
    const forwardVec = new THREE.Vector3(Math.sin(playerRotY), 0, Math.cos(playerRotY)).normalize();

    this.monsterMgr.monsters.forEach((mob) => {
      if (mob.isDead) return;

      const toMob = new THREE.Vector3().subVectors(mob.group.position, playerPos);
      const dist = toMob.length();

      if (dist <= attackRange) {
        toMob.normalize();
        const dot = forwardVec.dot(toMob);
        // 약 120도 부채꼴 (dot > 0.3)
        if (dot > 0.3) {
          const isCrit = Math.random() < 0.25;
          const baseDmg = Math.max(12, playerAtk - mob.def * 0.4);
          const finalDmg = Math.round(isCrit ? baseDmg * 1.85 : baseDmg);

          const knockback = forwardVec.clone().multiplyScalar(0.8);
          const killed = mob.takeDamage(finalDmg, knockback);

          SoundEffects.playHitImpact(isCrit);
          this.addFloatingDamage(finalDmg, isCrit, mob.group.position);

          if (this.onHitMonster) {
            this.onHitMonster(finalDmg, isCrit, mob);
          }
          if (killed && this.monsterMgr.onMonsterKilled) {
            this.monsterMgr.onMonsterKilled(mob);
          }
        }
      }
    });
  }

  /**
   * 2. 무공 1: 청월참 (Q) - 푸른 초승달 검기 투사체 발사
   */
  public executeBlueMoonSlash(playerPos: THREE.Vector3, playerRotY: number, playerAtk: number) {
    SoundEffects.playSkillCast();
    const forwardVec = new THREE.Vector3(Math.sin(playerRotY), 0, Math.cos(playerRotY)).normalize();

    // 초승달 메쉬
    const crescentGeo = new THREE.TorusGeometry(1.0, 0.14, 8, 24, Math.PI * 0.7);
    const crescentMat = new THREE.MeshBasicMaterial({
      color: 0x00f5d4,
      emissive: 0x00bbf9
    } as any);
    const mesh = new THREE.Mesh(crescentGeo, crescentMat);
    mesh.rotation.x = Math.PI / 2;
    mesh.rotation.z = -playerRotY + Math.PI * 0.15;
    mesh.position.set(playerPos.x, 1.1, playerPos.z);
    this.scene.add(mesh);

    const dmg = Math.round(playerAtk * 1.6);

    this.projectiles.push({
      mesh,
      direction: forwardVec,
      speed: 18.0,
      distanceTraveled: 0,
      maxDistance: 15.0,
      damage: dmg,
      piercedMonsters: new Set()
    });
  }

  /**
   * 3. 무공 2: 기류 폭발 (E) - 360도 넉백 충격파
   */
  public executeKiExplosion(playerPos: THREE.Vector3, playerAtk: number) {
    SoundEffects.playSkillCast();
    const ringGeo = new THREE.RingGeometry(0.8, 1.2, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x48cae4,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(ringGeo, ringMat);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(playerPos.x, 0.25, playerPos.z);
    this.scene.add(mesh);

    this.shockwaves.push({
      mesh,
      radius: 1.0,
      maxRadius: 6.2,
      speed: 16.0
    });

    // 반경 5.8m 내 전방위 적 강타
    const explosionRadius = 5.8;
    this.monsterMgr.monsters.forEach((mob) => {
      if (mob.isDead) return;

      const diff = new THREE.Vector3().subVectors(mob.group.position, playerPos);
      const dist = diff.length();

      if (dist <= explosionRadius) {
        const knockDir = diff.normalize().multiplyScalar(1.8);
        const dmg = Math.round(playerAtk * 1.35);
        const killed = mob.takeDamage(dmg, knockDir);

        this.addFloatingDamage(dmg, false, mob.group.position);

        if (this.onHitMonster) {
          this.onHitMonster(dmg, false, mob);
        }
        if (killed && this.monsterMgr.onMonsterKilled) {
          this.monsterMgr.onMonsterKilled(mob);
        }
      }
    });
  }

  /**
   * 4. 무공 3: 천검 강림 (R - 궁극기) - 하늘에서 쏟아지는 황금빛 영검 비
   */
  public executeHeavenlySwords(playerPos: THREE.Vector3, playerAtk: number) {
    const swordCount = 10;
    const spreadRadius = 5.5;

    for (let i = 0; i < swordCount; i++) {
      setTimeout(() => {
        const swordGroup = new THREE.Group();

        // 황금 검신
        const bladeGeo = new THREE.BoxGeometry(0.12, 1.8, 0.04);
        const bladeMat = new THREE.MeshBasicMaterial({ color: 0xffd166 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        swordGroup.add(blade);

        // 검 자루
        const hiltGeo = new THREE.BoxGeometry(0.5, 0.08, 0.08);
        const hilt = new THREE.Mesh(hiltGeo, bladeMat);
        hilt.position.y = 0.9;
        swordGroup.add(hilt);

        // 검 위치 랜덤 분산
        const rx = playerPos.x + (Math.random() - 0.5) * spreadRadius * 2;
        const rz = playerPos.z + (Math.random() - 0.5) * spreadRadius * 2;
        swordGroup.position.set(rx, 14.0, rz);
        swordGroup.rotation.x = Math.PI; // 지면을 향해 꽂힘
        this.scene.add(swordGroup);

        const dmg = Math.round(playerAtk * 0.95);

        this.fallingSwords.push({
          mesh: swordGroup,
          targetY: 0.2,
          speed: 32.0,
          hasLanded: false,
          damage: dmg
        });
      }, i * 110);
    }
  }

  /**
   * 플로팅 대미지 추가
   */
  private addFloatingDamage(damage: number, isCrit: boolean, pos: THREE.Vector3) {
    this.floatingTexts.push({
      id: ++this.textIdCounter,
      text: isCrit ? `치명타! -${damage}` : `-${damage}`,
      isCrit,
      x: pos.x + (Math.random() - 0.5) * 0.6,
      y: pos.y + 1.8,
      z: pos.z + (Math.random() - 0.5) * 0.6,
      life: 1.2
    });
  }

  /**
   * 프레임별 전투 이펙트 및 투사체 업데이트
   */
  public update(delta: number) {
    // 1. 청월참 투사체 비행 및 관통 충돌 판정
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const moveStep = p.speed * delta;
      p.mesh.position.addScaledVector(p.direction, moveStep);
      p.distanceTraveled += moveStep;

      // 몬스터 충돌 검사
      this.monsterMgr.monsters.forEach((mob) => {
        if (mob.isDead || p.piercedMonsters.has(mob)) return;

        const dist = p.mesh.position.distanceTo(mob.group.position);
        if (dist <= 1.4) {
          p.piercedMonsters.add(mob);
          const killed = mob.takeDamage(p.damage, p.direction.clone().multiplyScalar(1.2));
          this.addFloatingDamage(p.damage, true, mob.group.position);

          if (this.onHitMonster) {
            this.onHitMonster(p.damage, true, mob);
          }
          if (killed && this.monsterMgr.onMonsterKilled) {
            this.monsterMgr.onMonsterKilled(mob);
          }
        }
      });

      if (p.distanceTraveled >= p.maxDistance) {
        this.scene.remove(p.mesh);
        this.projectiles.splice(i, 1);
      }
    }

    // 2. 기류 폭발 팽창 링 애니메이션
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const s = this.shockwaves[i];
      s.radius += s.speed * delta;
      const scale = s.radius;
      s.mesh.scale.set(scale, scale, 1);

      const mat = s.mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - s.radius / s.maxRadius);

      if (s.radius >= s.maxRadius) {
        this.scene.remove(s.mesh);
        this.shockwaves.splice(i, 1);
      }
    }

    // 3. 천검 강림 낙하 검들 업데이트
    for (let i = this.fallingSwords.length - 1; i >= 0; i--) {
      const sword = this.fallingSwords[i];
      if (!sword.hasLanded) {
        sword.mesh.position.y -= sword.speed * delta;
        if (sword.mesh.position.y <= sword.targetY) {
          sword.mesh.position.y = sword.targetY;
          sword.hasLanded = true;

          // 착지 시 주변 반경 2.5m 폭발 대미지
          this.monsterMgr.monsters.forEach((mob) => {
            if (mob.isDead) return;
            const dist = mob.group.position.distanceTo(sword.mesh.position);
            if (dist <= 2.8) {
              const killed = mob.takeDamage(sword.damage);
              this.addFloatingDamage(sword.damage, false, mob.group.position);
              if (killed && this.monsterMgr.onMonsterKilled) {
                this.monsterMgr.onMonsterKilled(mob);
              }
            }
          });

          // 착지 0.4초 후 소멸
          setTimeout(() => {
            this.scene.remove(sword.mesh);
            const idx = this.fallingSwords.indexOf(sword);
            if (idx !== -1) this.fallingSwords.splice(idx, 1);
          }, 450);
        }
      }
    }

    // 4. 플로팅 텍스트 수명 및 부유 계산
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= delta;
      ft.y += delta * 1.5; // 위로 둥둥 떠오름
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}

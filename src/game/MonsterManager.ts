import * as THREE from 'three';
import { MonsterModel } from './MonsterModel';

/**
 * 필드 몬스터 스폰, AI 갱신, 플레이어 공격 감지 매니저
 */
export class MonsterManager {
  public monsters: MonsterModel[] = [];
  private scene: THREE.Scene;
  private attackCooldowns: Map<MonsterModel, number> = new Map();

  // 플레이어 피격 콜백
  public onPlayerDamaged?: (damage: number) => void;
  // 몬스터 처치 콜백
  public onMonsterKilled?: (monster: MonsterModel) => void;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.spawnInitialMonsters();
  }

  /**
   * 초기 필드 몬스터 스폰
   */
  private spawnInitialMonsters() {
    // 1. 일반 도깨비 몬스터들 (수련장 외곽 숲 방면)
    const goblinSpawns = [
      new THREE.Vector3(-10, 0, -4),
      new THREE.Vector3(-8, 0, 7),
      new THREE.Vector3(12, 0, 4),
      new THREE.Vector3(9, 0, -8)
    ];

    goblinSpawns.forEach((pos) => {
      const mob = new MonsterModel('goblin', pos);
      this.monsters.push(mob);
      this.scene.add(mob.group);
      this.attackCooldowns.set(mob, 0);
    });

    // 2. 필드 보스: 천년 흑요석 골렘 (북서쪽 깊은 숲)
    const boss = new MonsterModel('boss_golem', new THREE.Vector3(-15, 0, -12));
    this.monsters.push(boss);
    this.scene.add(boss.group);
    this.attackCooldowns.set(boss, 0);
  }

  /**
   * 프레임별 몬스터 AI 및 플레이어 피격 판정
   */
  public update(delta: number, playerPos: THREE.Vector3, camera: THREE.Camera) {
    for (let i = this.monsters.length - 1; i >= 0; i--) {
      const mob = this.monsters[i];

      // 몬스터 AI 갱신
      mob.update(delta, playerPos, camera);

      // 사망 후 소멸 처리
      if (mob.isDead && mob.deathTimer > 1.8) {
        this.scene.remove(mob.group);
        this.monsters.splice(i, 1);
        this.attackCooldowns.delete(mob);

        // 12초 후 리스폰
        setTimeout(() => {
          const respawned = new MonsterModel(mob.type, mob.spawnPos);
          this.monsters.push(respawned);
          this.scene.add(respawned.group);
          this.attackCooldowns.set(respawned, 0);
        }, 12000);

        continue;
      }

      // 플레이어 공격 시도 (공격 상태일 때 쿨다운 체크)
      if (!mob.isDead && mob.state === 'attack') {
        const cd = this.attackCooldowns.get(mob) || 0;
        if (cd <= 0) {
          // 공격 적중!
          this.attackCooldowns.set(mob, mob.type === 'boss_golem' ? 2.5 : 1.6);
          if (this.onPlayerDamaged) {
            this.onPlayerDamaged(mob.atk);
          }
        } else {
          this.attackCooldowns.set(mob, cd - delta);
        }
      } else {
        const cd = this.attackCooldowns.get(mob) || 0;
        if (cd > 0) {
          this.attackCooldowns.set(mob, Math.max(0, cd - delta));
        }
      }
    }
  }

  /**
   * 미니맵 표시용 살아있는 몬스터 위치 목록 반환
   */
  public getLivingMonsterPositions(): { x: number; z: number; isBoss: boolean }[] {
    return this.monsters
      .filter((m) => !m.isDead)
      .map((m) => ({
        x: m.group.position.x,
        z: m.group.position.z,
        isBoss: m.type === 'boss_golem'
      }));
  }
}

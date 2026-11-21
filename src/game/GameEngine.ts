import * as THREE from 'three';
import { WorldEnvironment } from './WorldEnvironment';
import { CharacterModel } from './CharacterModel';
import { PlayerController } from './PlayerController';
import { MonsterManager } from './MonsterManager';
import { CombatManager, FloatingDamageText } from './CombatManager';

/**
 * Three.js 메인 3D 게임 엔진
 * 씬, 렌더러, 카메라 팔로우, 플레이어 물리, 몬스터 AI, 전투 시스템 통합
 */
export class GameEngine {
  private container: HTMLElement;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public world: WorldEnvironment;
  public player: CharacterModel;
  public controller: PlayerController;
  public monsterMgr: MonsterManager;
  public combatMgr: CombatManager;

  private clock: THREE.Clock;
  private animationFrameId: number | null = null;
  private isDisposed = false;

  // 카메라 팔로우 및 오빗
  private cameraDistance = 8.0;
  private cameraPitch = 0.38;
  private cameraYaw = Math.PI;
  private cameraTarget = new THREE.Vector3(0, 1.3, 0);

  private isDragging = false;
  private previousPointerX = 0;
  private previousPointerY = 0;

  // 이벤트 콜백들
  public onPlayerPositionChange?: (x: number, z: number) => void;
  public onMonstersChange?: (monsters: { x: number; z: number; isBoss: boolean }[]) => void;
  public onPlayerDamaged?: (damage: number) => void;
  public onMonsterKilled?: (name: string, expReward: number, goldReward: number) => void;
  public onFloatingTextsChange?: (texts: { id: number; text: string; isCrit: boolean; screenX: number; screenY: number; opacity: number }[]) => void;

  constructor(container: HTMLElement) {
    this.container = container;
    this.clock = new THREE.Clock();

    // 1. 씬 생성
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xa7c5eb);
    this.scene.fog = new THREE.FogExp2(0xa7c5eb, 0.020);

    // 2. 카메라 설정
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 120);
    this.updateCameraTransform();

    // 3. 렌더러
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    container.appendChild(this.renderer.domElement);

    // 4. 조명
    this.setupLighting();

    // 5. 세계 환경
    this.world = new WorldEnvironment();
    this.scene.add(this.world.group);

    // 6. 플레이어 및 컨트롤러
    this.player = new CharacterModel();
    this.player.group.position.set(0, 0, 0);
    this.scene.add(this.player.group);
    this.controller = new PlayerController(this.player);

    // 7. 4단계: 몬스터 관리자 & 전투 매니저
    this.monsterMgr = new MonsterManager(this.scene);
    this.combatMgr = new CombatManager(this.scene, this.monsterMgr);

    // 몬스터 이벤트 바인딩
    this.monsterMgr.onPlayerDamaged = (dmg) => {
      if (this.onPlayerDamaged) this.onPlayerDamaged(dmg);
    };

    this.monsterMgr.onMonsterKilled = (mob) => {
      if (this.onMonsterKilled) {
        this.onMonsterKilled(mob.name, mob.expReward, mob.goldReward);
      }
    };

    // 8. 마우스 및 터치 오빗 조작
    this.initControls();

    // 9. 렌더 루프 시작
    this.animate();
  }

  /**
   * 조명 배치
   */
  private setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x386641, 0.5);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff3b0, 1.35);
    sunLight.position.set(12, 22, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    const shadowD = 20;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0xa2d2ff, 0.45);
    rimLight.position.set(-10, 8, -12);
    this.scene.add(rimLight);
  }

  /**
   * 전투 기술 실행 메서드들
   */
  public executeAttack(playerAtk: number) {
    this.combatMgr.executeBasicAttack(
      this.controller.position,
      this.player.group.rotation.y,
      playerAtk
    );
  }

  public executeSkill1(playerAtk: number) {
    this.combatMgr.executeBlueMoonSlash(
      this.controller.position,
      this.player.group.rotation.y,
      playerAtk
    );
  }

  public executeSkill2(playerAtk: number) {
    this.combatMgr.executeKiExplosion(this.controller.position, playerAtk);
  }

  public executeSkill3(playerAtk: number) {
    this.combatMgr.executeHeavenlySwords(this.controller.position, playerAtk);
  }

  /**
   * 카메라 변환
   */
  private updateCameraTransform() {
    const horizontalDist = this.cameraDistance * Math.cos(this.cameraPitch);
    const camY = this.cameraTarget.y + this.cameraDistance * Math.sin(this.cameraPitch);
    const camX = this.cameraTarget.x + horizontalDist * Math.sin(this.cameraYaw);
    const camZ = this.cameraTarget.z + horizontalDist * Math.cos(this.cameraYaw);

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(this.cameraTarget);
  }

  /**
   * 사용자 시점 조작
   */
  private initControls() {
    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousPointerX = e.clientX;
      this.previousPointerY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousPointerX;
      const deltaY = e.clientY - this.previousPointerY;
      this.previousPointerX = e.clientX;
      this.previousPointerY = e.clientY;

      this.cameraYaw -= deltaX * 0.007;
      this.cameraPitch = Math.max(0.1, Math.min(1.25, this.cameraPitch + deltaY * 0.005));
      this.updateCameraTransform();
    });

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.cameraDistance = Math.max(3.5, Math.min(18.0, this.cameraDistance + e.deltaY * 0.008));
      this.updateCameraTransform();
    }, { passive: false });

    dom.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousPointerX = e.touches[0].clientX;
        this.previousPointerY = e.touches[0].clientY;
      }
    }, { passive: true });

    dom.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - this.previousPointerX;
      const deltaY = e.touches[0].clientY - this.previousPointerY;
      this.previousPointerX = e.touches[0].clientX;
      this.previousPointerY = e.touches[0].clientY;

      this.cameraYaw -= deltaX * 0.009;
      this.cameraPitch = Math.max(0.1, Math.min(1.25, this.cameraPitch + deltaY * 0.007));
      this.updateCameraTransform();
    }, { passive: true });

    dom.addEventListener('touchend', () => {
      this.isDragging = false;
    });
  }

  public resize(width: number, height: number) {
    if (this.isDisposed || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * 렌더 루프
   */
  private animate = () => {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. 플레이어 컨트롤러 업데이트
    this.controller.update(delta, this.cameraYaw);

    // 2. 캐릭터 애니메이션 업데이트
    this.player.update(
      elapsedTime,
      this.controller.isMoving,
      this.controller.currentSpeed / 6.0,
      !this.controller.isGrounded
    );

    // 3. 몬스터 매니저 및 AI 업데이트
    this.monsterMgr.update(delta, this.controller.position, this.camera);

    // 4. 전투 매니저 (투사체, 충격파, 플로팅 텍스트) 업데이트
    this.combatMgr.update(delta);

    // 5. 카메라 추적
    const targetPlayerY = this.controller.position.y + 1.3;
    const desiredTarget = new THREE.Vector3(
      this.controller.position.x,
      targetPlayerY,
      this.controller.position.z
    );
    this.cameraTarget.lerp(desiredTarget, Math.min(1, delta * 8));
    this.updateCameraTransform();

    // 6. 세계 환경
    this.world.update(elapsedTime);

    // 7. 콜백 전송 (플레이어 좌표 & 몬스터 좌표)
    if (this.onPlayerPositionChange) {
      this.onPlayerPositionChange(this.controller.position.x, this.controller.position.z);
    }
    if (this.onMonstersChange) {
      this.onMonstersChange(this.monsterMgr.getLivingMonsterPositions());
    }

    // 8. 3D 플로팅 대미지를 2D 화면 좌표로 투영하여 콜백 전달
    if (this.onFloatingTextsChange && this.combatMgr.floatingTexts.length > 0) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;

      const screenTexts = this.combatMgr.floatingTexts.map((ft) => {
        const v = new THREE.Vector3(ft.x, ft.y, ft.z);
        v.project(this.camera);

        const screenX = ((v.x + 1) / 2) * width;
        const screenY = ((-v.y + 1) / 2) * height;

        return {
          id: ft.id,
          text: ft.text,
          isCrit: ft.isCrit,
          screenX,
          screenY,
          opacity: Math.max(0, ft.life / 1.2)
        };
      });

      this.onFloatingTextsChange(screenTexts);
    } else if (this.onFloatingTextsChange) {
      this.onFloatingTextsChange([]);
    }

    this.renderer.render(this.scene, this.camera);
  };

  public dispose() {
    this.isDisposed = true;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}

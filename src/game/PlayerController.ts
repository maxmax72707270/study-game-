import * as THREE from 'three';
import { CharacterModel } from './CharacterModel';

export interface ObstacleCollider {
  x: number;
  z: number;
  radius: number;
  name: string;
}

/**
 * 플레이어 이동 조작, 물리(점프/중력), 충돌 감지 컨트롤러
 */
export class PlayerController {
  public player: CharacterModel;

  // 위치 및 물리 상태
  public position = new THREE.Vector3(0, 0, 0);
  public velocityY = 0;
  public isGrounded = true;
  public isMoving = false;
  public currentSpeed = 0;

  // 이동 속도 설정
  private normalSpeed = 6.0;   // 일반 달리기 속도 (단위: m/s)
  private dashSpeed = 11.5;    // 질풍보(경공) 대시 속도
  private jumpForce = 8.5;     // 점프 초기 상승 속도
  private gravity = 22.0;      // 중력 가속도

  // 입력 키 상태
  private keys: Record<string, boolean> = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    dash: false
  };

  // 모바일 가상 조이스틱/D-Pad 지속 입력
  private virtualMoveDir = new THREE.Vector2(0, 0);

  // 충돌체 목록 (WorldEnvironment의 주요 장애물들과 동기화)
  private colliders: ObstacleCollider[] = [
    { x: 0, z: -8, radius: 2.8, name: '기와 정자 기단' },
    { x: 3.5, z: -2.5, radius: 0.9, name: '지혜의 비석' },
    { x: -3.8, z: -6.2, radius: 1.3, name: '강호 만물상' },
    { x: -4, z: -2, radius: 0.6, name: '목인장 1' },
    { x: -5.5, z: 0.5, radius: 0.6, name: '목인장 2' },
    { x: -2.8, z: 3, radius: 0.5, name: '석등 1' },
    { x: 2.8, z: 3, radius: 0.5, name: '석등 2' },
    { x: -3.2, z: -5, radius: 0.5, name: '석등 3' },
    { x: 3.2, z: -5, radius: 0.5, name: '석등 4' }
  ];

  // 전체 탐험 가능 맵 반경
  private maxMapRadius = 36.0;

  constructor(player: CharacterModel) {
    this.player = player;
    this.initKeyboardListeners();
  }

  /**
   * 키보드 이벤트 등록
   */
  private initKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
      // 인풋 필드 포커스 시 조작 무시
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      this.handleKey(e.code, true);
    });

    window.addEventListener('keyup', (e) => {
      this.handleKey(e.code, false);
    });
  }

  private handleKey(code: string, isPressed: boolean) {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.keys.forward = isPressed;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.keys.backward = isPressed;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.keys.left = isPressed;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.keys.right = isPressed;
        break;
      case 'Space':
        if (isPressed && this.isGrounded) {
          this.jump();
        }
        this.keys.jump = isPressed;
        break;
      case 'ShiftLeft':
      case 'ShiftRight':
        this.keys.dash = isPressed;
        break;
      default:
        break;
    }
  }

  /**
   * 점프 실행
   */
  public jump() {
    if (this.isGrounded) {
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
    }
  }

  /**
   * 질풍보(대시) 트리거 (스킬 바 클릭 등 외부 호출 지원)
   */
  public dash() {
    this.keys.dash = true;
    setTimeout(() => {
      this.keys.dash = false;
    }, 600);
  }

  /**
   * 모바일 가상 패드 입력 설정
   */
  public setVirtualMove(dirX: number, dirY: number) {
    this.virtualMoveDir.set(dirX, dirY);
  }

  /**
   * 프레임별 물리 및 위치 업데이트
   * @param delta 이전 프레임과의 시간 차이 (초)
   * @param cameraYaw 현재 카메라의 수평 회전각 (라디안)
   */
  public update(delta: number, cameraYaw: number) {
    // 1. 입력 벡터 계산 (키보드 + 모바일 가상 패드)
    let moveX = 0;
    let moveZ = 0;

    if (this.keys.forward) moveZ -= 1;
    if (this.keys.backward) moveZ += 1;
    if (this.keys.left) moveX -= 1;
    if (this.keys.right) moveX += 1;

    // 모바일 가상 입력 합산
    if (this.virtualMoveDir.lengthSq() > 0.01) {
      moveX += this.virtualMoveDir.x;
      moveZ += this.virtualMoveDir.y;
    }

    const inputVector = new THREE.Vector2(moveX, moveZ);
    this.isMoving = inputVector.lengthSq() > 0.01;

    // 2. 이동 방향 및 속도 계산 (카메라 Yaw 각도 기준 변환)
    if (this.isMoving) {
      inputVector.normalize();

      // 카메라 각도에 맞게 회전
      const moveAngle = Math.atan2(inputVector.x, inputVector.y) + cameraYaw;
      const speed = this.keys.dash ? this.dashSpeed : this.normalSpeed;
      this.currentSpeed = speed;

      const vx = Math.sin(moveAngle) * speed * delta;
      const vz = Math.cos(moveAngle) * speed * delta;

      // 충돌 처리 후 이동 적용
      const nextX = this.position.x + vx;
      const nextZ = this.position.z + vz;

      this.applyMoveWithCollision(nextX, nextZ);

      // 캐릭터가 이동하는 방향으로 부드럽게 몸체 회전
      const targetRotationY = moveAngle;
      // 각도 최단 경로 보간
      let diff = targetRotationY - this.player.group.rotation.y;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;
      this.player.group.rotation.y += diff * Math.min(1, delta * 14);
    } else {
      this.currentSpeed = 0;
    }

    // 3. 점프 및 중력 계산
    if (!this.isGrounded) {
      this.velocityY -= this.gravity * delta;
      this.position.y += this.velocityY * delta;

      // 지면 착지 판정 (기준 높이 0)
      if (this.position.y <= 0) {
        this.position.y = 0;
        this.velocityY = 0;
        this.isGrounded = true;
      }
    }

    // 4. 캐릭터 메쉬 실제 위치 반영
    this.player.group.position.copy(this.position);
  }

  /**
   * 장애물 충돌 검사 및 맵 경계 제한
   */
  private applyMoveWithCollision(nextX: number, nextZ: number) {
    const playerRadius = 0.4; // 플레이어 충돌 반경

    // 맵 경계 검사 (원형 경계)
    const distFromOrigin = Math.sqrt(nextX * nextX + nextZ * nextZ);
    if (distFromOrigin + playerRadius > this.maxMapRadius) {
      const angle = Math.atan2(nextZ, nextX);
      nextX = Math.cos(angle) * (this.maxMapRadius - playerRadius);
      nextZ = Math.sin(angle) * (this.maxMapRadius - playerRadius);
    }

    // 기물 장애물 충돌 검사
    for (const collider of this.colliders) {
      const dx = nextX - collider.x;
      const dz = nextZ - collider.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const minDist = collider.radius + playerRadius;

      if (dist < minDist) {
        // 충돌 발생: 장애물 밖으로 밀어냄
        const overlap = minDist - dist;
        const pushAngle = Math.atan2(dz, dx);
        nextX += Math.cos(pushAngle) * overlap;
        nextZ += Math.sin(pushAngle) * overlap;
      }
    }

    this.position.x = nextX;
    this.position.z = nextZ;
  }
}

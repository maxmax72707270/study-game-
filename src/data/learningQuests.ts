// 초등 및 중등 수준의 수학, 영어, 과학 학습 퀘스트 문제 데이터

export interface QuizQuestion {
  id: string;
  subject: '수학' | '영어' | '과학';
  gradeLevel: string;
  questTitle: string;
  problem: string;
  hint?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  rewardExp: number;
  rewardGold: number;
}

export const LEARNING_QUESTS_DATA: QuizQuestion[] = [
  // 1. 수학 문제군
  {
    id: 'math_1',
    subject: '수학',
    gradeLevel: '초등 3-4학년',
    questTitle: '장문인의 첫 가르침: 기본 사칙연산',
    problem: '청운문의 수련생이 하루에 목인장을 25번 치고, 장문인이 추가로 18번 더 치라고 했습니다. 오늘 친 목인장은 총 몇 번일까요?',
    hint: '25와 18을 더해보세요.',
    options: ['39번', '41번', '43번', '45번'],
    correctIndex: 2,
    explanation: '25 + 18 = 43입니다. 받아올림을 주의하여 5+8=13, 10의 자리 2+1+1=4가 됩니다.',
    rewardExp: 150,
    rewardGold: 100
  },
  {
    id: 'math_2',
    subject: '수학',
    gradeLevel: '초등 5-6학년',
    questTitle: '분수의 기운 다루기',
    problem: '물약 항아리에 1/2 리터의 영약이 들어 있습니다. 여기에 1/4 리터의 영약을 더 부었다면, 항아리에는 총 몇 리터가 있을까요?',
    hint: '분모를 통분해 보세요. 1/2은 몇 분의 몇일까요?',
    options: ['2/6 리터', '3/4 리터', '2/4 리터', '5/8 리터'],
    correctIndex: 1,
    explanation: '1/2을 통분하면 2/4입니다. 따라서 2/4 + 1/4 = 3/4 리터가 됩니다.',
    rewardExp: 180,
    rewardGold: 120
  },
  {
    id: 'math_3',
    subject: '수학',
    gradeLevel: '중등 기초',
    questTitle: '고대 암호 석문 해독 (일차방정식)',
    problem: '석문에 새겨진 미지의 수 x를 구하시오:  2x + 6 = 20',
    hint: '먼저 양변에서 6을 뺀 다음, 2로 나누어 보세요.',
    options: ['x = 5', 'x = 7', 'x = 8', 'x = 10'],
    correctIndex: 1,
    explanation: '2x = 20 - 6 -> 2x = 14 -> x = 7입니다.',
    rewardExp: 220,
    rewardGold: 150
  },

  // 2. 영어 문제군
  {
    id: 'eng_1',
    subject: '영어',
    gradeLevel: '초등 공통',
    questTitle: '서역 무역상의 기초 영단어',
    problem: '다음 중 "기사(검객)" 또는 "무사"를 뜻하는 올바른 영어 단어는 무엇일까요?',
    hint: 'k로 시작하지만 k 소리가 나지 않는 단어예요.',
    options: ['Night', 'Knight', 'King', 'Knife'],
    correctIndex: 1,
    explanation: '"Knight"는 기사/무사를 뜻합니다. 묵음 k가 있어서 "나이트"로 발음되며, 밤을 뜻하는 "Night"와 발음이 같습니다.',
    rewardExp: 150,
    rewardGold: 100
  },
  {
    id: 'eng_2',
    subject: '영어',
    gradeLevel: '초등 5-6학년',
    questTitle: '길 안내 회화 문장 완성',
    problem: '빈칸에 들어갈 알맞은 말은 무엇일까요?\n"Excuse me, where ________ the training dojo?"',
    hint: 'dojo는 단수 명사입니다.',
    options: ['are', 'is', 'am', 'be'],
    correctIndex: 1,
    explanation: '주어인 "the training dojo"가 3인칭 단수이므로 be동사는 "is"가 와야 합니다.',
    rewardExp: 180,
    rewardGold: 120
  },
  {
    id: 'eng_3',
    subject: '영어',
    gradeLevel: '중등 기초',
    questTitle: '고대 비급서의 격언 독해',
    problem: '"Practice makes perfect." 이 속담의 올바른 한국어 뜻은 무엇일까요?',
    hint: '매일 연습하고 수련하는 것의 중요성을 말합니다.',
    options: [
      '수련은 완벽을 만든다 (연습이 최고다)',
      '시작이 반이다',
      '돌다리도 두들겨 보고 건너라',
      '백지장도 맞들면 낫다'
    ],
    correctIndex: 0,
    explanation: '"Practice makes perfect"는 반복된 연습과 수련이 완벽함을 이끌어낸다는 유명한 영어 격언입니다.',
    rewardExp: 200,
    rewardGold: 140
  },

  // 3. 과학 문제군
  {
    id: 'sci_1',
    subject: '과학',
    gradeLevel: '초등 3-4학년',
    questTitle: '물의 상태 변화와 기운',
    problem: '얼음(고체)이 열을 받아서 물(액체)로 변하는 현상을 과학적으로 무엇이라고 부를까요?',
    hint: '눈사람이 녹을 때를 생각해보세요.',
    options: ['응고', '융해 (녹음)', '기화', '승화'],
    correctIndex: 1,
    explanation: '고체가 열을 흡수하여 액체로 변하는 현상을 "융해"라고 부릅니다. 반대로 액체가 얼어 고체가 되는 것은 "응고"입니다.',
    rewardExp: 160,
    rewardGold: 110
  },
  {
    id: 'sci_2',
    subject: '과학',
    gradeLevel: '초등 5-6학년',
    questTitle: '태양계 행성의 신비',
    problem: '태양계에서 가장 크며, 아름다운 거대한 붉은 점(대적점)을 가진 가스 행성은 무엇일까요?',
    hint: '지구보다 질량이 300배 이상 큽니다.',
    options: ['화성', '목성', '토성', '금성'],
    correctIndex: 1,
    explanation: '목성(Jupiter)은 태양계에서 가장 큰 행성이며, 거대한 소용돌이인 대적점을 가지고 있습니다.',
    rewardExp: 190,
    rewardGold: 130
  },
  {
    id: 'sci_3',
    subject: '과학',
    gradeLevel: '중등 기초',
    questTitle: '작용과 반작용의 무공 원리',
    problem: '내가 벽을 힘껏 밀었을 때, 벽도 나를 같은 크기의 힘으로 반대 방향으로 밀어내는 뉴턴의 제3법칙은 무엇일까요?',
    hint: '주는 힘이 있으면 반드시 돌아오는 힘이 있습니다.',
    options: [
      '관성의 법칙',
      '가속도의 법칙',
      '작용·반작용의 법칙',
      '만유인력의 법칙'
    ],
    correctIndex: 2,
    explanation: '한 물체가 다른 물체에 힘을 가하면(작용), 다른 물체도 동시에 크기가 같고 방향이 반대인 힘을 가한다(반작용)는 원리입니다.',
    rewardExp: 220,
    rewardGold: 150
  }
];

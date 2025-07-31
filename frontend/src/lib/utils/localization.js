// Централизованные маппинги для локализации

// Возрастные группы
export const AGE_GROUP_MAPPINGS = {
  // Русские ID (основные)
  'начальные-классы': 'Начальные классы (1-4)',
  'старшие-классы': 'Старшие классы (5-11)',
  // Обратная совместимость с английскими ID
  'primary': 'Начальные классы (1-4)',
  'secondary': 'Старшие классы (5-11)',
  'preschool': 'Дошкольники',
  'adult': 'Взрослые'
};

// Навыки
export const SKILL_MAPPINGS = {
  // Русские ID (основные)
  'критическое-мышление': 'Критическое мышление',
  'командная-работа': 'Командная работа',
  'рефлексия': 'Рефлексия',
  'креативное-мышление': 'Креативное мышление',
  'систематизация-материала': 'Систематизация материала',
  'коммуникация': 'Коммуникативные навыки',
  // Обратная совместимость с английскими ID
  'critical': 'Критическое мышление',
  'teamwork': 'Командная работа',
  'reflection': 'Рефлексия',
  'creative': 'Креативное мышление',
  'systematization': 'Систематизация материала',
  'communication': 'Коммуникативные навыки'
};

// Этапы урока
export const STAGE_MAPPINGS = {
  // Новые русские ID (основные)
  'начало-урока': 'Начало урока',
  'объяснение-нового-материала': 'Объяснение нового материала',
  'закрепление': 'Закрепление',
  'конец-урока': 'Конец урока',
  // Обратная совместимость со старыми русскими ID
  'мотивация': 'Мотивация',
  'объяснение': 'Объяснение',
  'практика': 'Практика',
  'рефлексия': 'Рефлексия',
  // Обратная совместимость с английскими ID
  'motivation': 'Мотивация',
  'explanation': 'Объяснение',
  'practice': 'Практика',
  'reflection': 'Рефлексия'
};

// Типы работы
export const TYPE_MAPPINGS = {
  // Русские ID (основные)
  'индивидуальная': 'Индивидуальная',
  'парная': 'Парная',
  'командная': 'Командная',
  'фронтальная': 'Фронтальная',
  // Обратная совместимость с английскими ID
  'individual': 'Индивидуальная',
  'pair': 'Парная',
  'team': 'Командная',
  'frontal': 'Фронтальная'
};

// Предопределенные данные для форм
export const PREDEFINED_DATA = {
  ageGroups: [
    { id: 'начальные-классы', name: 'Начальные классы (1-4)' },
    { id: 'старшие-классы', name: 'Старшие классы (5-11)' }
  ],
  
  skills: [
    { id: 'критическое-мышление', name: 'Критическое мышление' },
    { id: 'командная-работа', name: 'Командная работа' },
    { id: 'рефлексия', name: 'Рефлексия' },
    { id: 'креативное-мышление', name: 'Креативное мышление' },
    { id: 'систематизация-материала', name: 'Систематизация материала' },
    { id: 'коммуникация', name: 'Коммуникативные навыки' }
  ],
  
  stages: [
    { id: 'начало-урока', name: 'Начало урока' },
    { id: 'объяснение-нового-материала', name: 'Объяснение нового материала' },
    { id: 'закрепление', name: 'Закрепление' },
    { id: 'конец-урока', name: 'Конец урока' }
  ],
  
  types: [
    { id: 'индивидуальная', name: 'Индивидуальная' },
    { id: 'парная', name: 'Парная' },
    { id: 'командная', name: 'Командная' },
    { id: 'фронтальная', name: 'Фронтальная' }
  ]
};

// Функции для получения локализованных названий
export function getAgeGroupName(id) {
  return AGE_GROUP_MAPPINGS[id] || id;
}

export function getSkillName(id) {
  return SKILL_MAPPINGS[id] || id;
}

export function getStageName(id) {
  return STAGE_MAPPINGS[id] || id;
}

export function getTypeName(id) {
  return TYPE_MAPPINGS[id] || id;
}

// Функции для получения списков названий
export function getAgeGroupNames(ageGroups) {
  if (!ageGroups || ageGroups.length === 0) return 'Не указано';
  return ageGroups.map(group => {
    // Если group - это объект с полем name, используем его
    if (typeof group === 'object' && group.name) {
      return group.name;
    }
    // Если group - это строка (ID), переводим через маппинг
    return getAgeGroupName(group);
  }).join(', ');
}

export function getSkillNames(skills) {
  if (!skills || skills.length === 0) return 'Не указано';
  return skills.map(skill => {
    // Если skill - это объект с полем name, используем его
    if (typeof skill === 'object' && skill.name) {
      return skill.name;
    }
    // Если skill - это строка (ID), переводим через маппинг
    return getSkillName(skill);
  }).join(', ');
}

export function getStageNames(stages) {
  if (!stages || stages.length === 0) return 'Не указано';
  return stages.map(stage => {
    // Если stage - это объект с полем name, используем его
    if (typeof stage === 'object' && stage.name) {
      return stage.name;
    }
    // Если stage - это строка (ID), переводим через маппинг
    return getStageName(stage);
  }).join(', ');
}

export function getTypeNames(types) {
  if (!types || types.length === 0) return 'Не указано';
  return types.map(type => {
    // Если type - это объект с полем name, используем его
    if (typeof type === 'object' && type.name) {
      return type.name;
    }
    // Если type - это строка (ID), переводим через маппинг
    return getTypeName(type);
  }).join(', ');
}

// Функции для преобразования русских ID в английские для backend
export function convertRussianToEnglishId(russianId, type) {
  const mappings = {
    ageGroups: {
      'начальные-классы': 'primary',
      'старшие-классы': 'secondary'
    },
    skills: {
      'критическое-мышление': 'critical',
      'командная-работа': 'teamwork',
      'рефлексия': 'reflection',
      'креативное-мышление': 'creative',
      'систематизация-материала': 'systematization',
      'коммуникация': 'communication'
    },
    stages: {
      // Основные этапы урока (с дефисами для backend)
      'начало-урока': 'lesson-start',
      'объяснение-нового-материала': 'new-material',
      'закрепление': 'practice',
      'конец-урока': 'lesson-end',
      // Обратная совместимость со старыми ID
      'мотивация': 'motivation',
      'объяснение': 'explanation',
      'практика': 'practice',
      'рефлексия': 'reflection'
    },
    types: {
      'индивидуальная': 'individual',
      'парная': 'pair',
      'командная': 'team',
      'фронтальная': 'frontal'
    }
  };

  return mappings[type]?.[russianId] || russianId;
}

export function convertEnglishToRussianId(englishId, type) {
  const mappings = {
    ageGroups: {
      'primary': 'начальные-классы',
      'secondary': 'старшие-классы'
    },
    skills: {
      'critical': 'критическое-мышление',
      'teamwork': 'командная-работа',
      'reflection': 'рефлексия',
      'creative': 'креативное-мышление',
      'systematization': 'систематизация-материала',
      'communication': 'коммуникация'
    },
    stages: {
      'lesson_start': 'начало-урока',
      'new_material': 'объяснение-нового-материала',
      'reinforcement': 'закрепление',
      'lesson_end': 'конец-урока',
      // Обратная совместимость со старыми ID
      'motivation': 'мотивация',
      'explanation': 'объяснение',
      'practice': 'практика',
      'reflection': 'рефлексия'
    },
    types: {
      'individual': 'индивидуальная',
      'pair': 'парная',
      'team': 'командная',
      'frontal': 'фронтальная'
    }
  };

  return mappings[type]?.[englishId] || englishId;
}

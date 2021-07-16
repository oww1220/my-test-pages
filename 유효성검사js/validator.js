/* eslint-disable complexity */
const BAD_KEYWORDS_NAME =
  'help|lol|admin|root|riot|delete|champion|select|update|union|insert|drop|having|rioter|krt|function|database|webmaster|test|none|javascript|script';

const validator = async (value, rules, opt = {}) => {
  let isValid = true;
  let validationMsg;

  for (const rule in rules) {
    if (!isValid) {
      break;
    }

    switch (rule) {
      case 'isRequired':
        isValid = isValid && requiredValidator(value);
        validationMsg = !isValid && '값을 입력해 주세요.';
        break;
      case 'minLength':
        isValid = isValid && minLengthValidator(value, rules[rule]);
        validationMsg = !isValid && `${rules[rule]}자 이상 입력해 주세요.`;
        break;
      case 'maxLength':
        isValid = isValid && maxLengthValidator(value, rules[rule]);
        validationMsg = !isValid && `${rules[rule]}자 이하로 입력해 주세요.`;
        break;
      case 'fixLength':
        isValid = isValid && fixLengthValidator(value, rules[rule]);
        validationMsg = !isValid && `${rules[rule]}자로 입력해 주세요.`;
        break;
      case 'alphaNumberic':
        isValid = isValid && alphaNumericValidator(value, rules[rule]);
        validationMsg = !isValid && '영문으로 시작하는 영문+숫자 조합이어야 합니다.';
        break;
      case 'numberic':
        isValid = isValid && numericValidator(value, rules[rule]);
        validationMsg = !isValid && '숫자가 아닙니다.';
        break;
      case 'badKeywords':
        isValid = isValid && badKeywordsValidator(value);
        validationMsg = !isValid && '허용되지 않는 단어가 포함되어 있습니다.';
        break;
      case 'forbiddenChar':
        isValid = isValid && forbiddenCharValidator(value);
        validationMsg = !isValid && '슬래시(/), 역슬래시(\\), 쌍따옴표("), 공백은 사용하실 수 없습니다.';
        break;
      case 'alphabet':
        isValid = isValid && alphabetValidator(value);
        validationMsg = !isValid && '영문자를 반드시 포함해야 합니다.';
        break;
      case 'number':
        isValid = isValid && numberValidator(value);
        validationMsg = !isValid && '숫자를 반드시 포함해야 합니다.';
        break;
      case 'specialChar':
        isValid = isValid && specialCharValidator(value);
        validationMsg = !isValid && '특수문자를 반드시 포함해야 합니다.';
        break;
      case 'duplicatedChars':
        isValid = isValid && duplicatedCharsValidator(value);
        validationMsg = !isValid && '동일한 숫자 또는 문자를 3자 이상 사용할 수 없습니다.';
        break;
      case 'similarName':
        isValid = isValid && similarNameValidator(value, opt.username);
        validationMsg = !isValid && '아이디와 4개 이상 동일한 연속 문자의 설정이 불가능합니다.';
        break;
      case 'confirmPassword': {
        const { available, availableMsg } = confirmPasswordValidator(value, opt.confirmPwd);
        isValid = isValid && available;
        validationMsg = availableMsg;
        break;
      }
      case 'email': {
        const { available, availableMsg } = emailValidator(value);
        isValid = isValid && available;
        validationMsg = availableMsg;
        break;
      }
      case 'availableUserName': {
        const { available, availableMsg } = await availableUserNameValidator(value, opt.actions);
        isValid = isValid && available;
        validationMsg = !isValid && availableMsg;
        break;
      }
      default:
        isValid = true;
    }
  }

  return {
    isValid,
    validationMsg
  };
};

const alphaNumericValidator = (value) => /^[a-zA-Z]+[a-zA-Z0-9]+$/.test(value);
const alphabetValidator = (value) => /[a-zA-Z]/.test(value);
const numericValidator = (value) => /^\d+$/.test(value);
const numberValidator = (value) => /[0-9]/.test(value);
const specialCharValidator = (value) => /[`~!@#$%^&*()\-_=+\x5b\x5d{}\x7c;:',<.>?']/.test(value);
const duplicatedCharsValidator = (value) =>
  /([A-Za-z0-9`~!@#$%^&*()\-_=+\x5b\x5d{}\x7c;:',<.>?])\1{2,}/.test(value) === false;
const minLengthValidator = (value, minLength) => value.length >= minLength;
const maxLengthValidator = (value, maxLength) => value.length <= maxLength;
const fixLengthValidator = (value, fixLength) => value.length === fixLength;
const requiredValidator = (value) => value.trim() !== '';

const forbiddenCharValidator = (value) => /[\\"/\\\\\s]/.test(value) === false;

const similarNameValidator = (value, username) => {
  for (let i = 0; i <= username.length - 4; i++) {
    const pattern = username.substr(i, 4);

    if (value.includes(pattern)) {
      return false;
    }
  }
  return true;
};

const badKeywordsValidator = (value) => {
  const isVerified =
    BAD_KEYWORDS_NAME.split('|').filter((keyword) => value.toLowerCase().indexOf(keyword) >= 0).length === 0;

  return isVerified;
};

const confirmPasswordValidator = (value, confirmPwd) => {
  const isAvailable = value === confirmPwd;
  return {
    available: isAvailable,
    availableMsg: isAvailable ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.'
  };
};

const emailValidator = (value) => {
  const re = /^(([^<>()\x5b\x5d\\.,;:\s@"]+(\.[^<>()\x5b\x5d\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const isAvailable = re.test(String(value).toLowerCase());
  // const isAvailable = value.length < 4 ? true : re.test(String(value).toLowerCase());
  return {
    available: isAvailable,
    availableMsg: !isAvailable && '메일 주소의 형식이 올바르지 않습니다.'
  };
};

const availableUserNameValidator = async (name, { availableUserName }) => {
  if (!name) {
    return {
      available: false,
      availableMsg: ''
    };
  }

  try {
    await availableUserName(name);

    return {
      available: true,
      availableMsg: ''
    };
  } catch ({ response }) {
    const { status } = response;
    let availableMsg;

    if (status === 409) {
      availableMsg = '이미 사용중인 아이디입니다.';
    } else if (status === 429) {
      availableMsg = '전광석화와 같이 확인하셨네요. 한 박자 쉬었다가!';
    } else {
      availableMsg = '서버와의 통신중 오류가 발생되었습니다.';
    }

    return {
      available: false,
      availableMsg
    };
  }
};

export default validator;

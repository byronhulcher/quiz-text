'use strict';

const parse = require('../').parse,
  expect = require('chai').expect,
  question = 'Question?',
  htmlQuestion = 'What\'s a <strong>GOOD</strong> question?',
  text = 'answer',
  htmlText = '<span class="ok">Cool Answer</span>',
  val = 'val',
  answer = { name: text, value: text },
  answerWithVal = { name: text, value: val },
  correctAnswer = { name: text, value: text, correct: true },
  correctAnswerWithVal = { name: text, value: val, correct: true },
  htmlAnswer = { name: htmlText, value: val };

describe('Quiz Text', function () {
  describe('Radio', function () {
    const radio = `() ${text}`,
      correctTextResult = `Yes, that's correct`,
      correctText = `^${correctTextResult}`,
      incorrectTextResult = `Sorry, that's incorrect`,
      incorrectText = `<${incorrectTextResult}`;

    it('parses question', function () {
      expect(parse(`${question}\n${radio}`)[0].question).to.equal(question);
    });

    it('parses single answer', function () {
      expect(parse(`${question}\n${radio}`)[0].answers).to.deep.equal([answer]);
    });

    it('parses multiple answers', function () {
      expect(parse(`${question}\n${radio}\n${radio}`)[0].answers).to.deep.equal([answer, answer]);
    });

    it('disregards whitespace', function () {
      expect(parse(` ${question} \n${radio}`)[0].question).to.equal(question);
      expect(parse(`${question}\n( ) ${text}`)[0].answers).to.deep.equal([answer]);
      expect(parse(`${question}\n()${text}`)[0].answers).to.deep.equal([answer]);
      expect(parse(`${question}\n${radio} `)[0].answers).to.deep.equal([answer]);
    });

    it('passes through html in questions', function () {
      expect(parse(`${htmlQuestion}\n${radio}`)[0].question).to.equal(htmlQuestion);
    });

    it('passes through html in answers', function () {
      expect(parse(`${question}\n(val) ${htmlText}`)[0].answers).to.deep.equal([htmlAnswer]);
    });

    it('allows commas in questions', function () {
      expect(parse(`Good, or bad?\n${radio}`)[0].question).to.equal('Good, or bad?');
    });

    it('allows commas in answers', function () {
      expect(parse(`${question}\n(val) Cool, Answer`)[0].answers).to.deep.equal([{ name: 'Cool, Answer', value: val }]);
    });

    it('parses correct answers', function () {
      const correctRadio = `(*) ${text}`;

      expect(parse(`${question}\n${correctRadio}`)[0].answers).to.deep.equal([correctAnswer]);
    });

    it('parses answers with values', function () {
      expect(parse(`${question}\n(val) answer`)[0].answers).to.deep.equal([answerWithVal]);
      expect(parse(`${question}\n(*val) answer`)[0].answers).to.deep.equal([correctAnswerWithVal]);
    });

    it('allows correct answer text result', function () {
      expect(parse(`${question}\n${correctText}\n${incorrectText}\n${radio}\n${radio}`)[0].correctText).to.deep.equal(correctTextResult);
    });

    it('allows incorrect answer text result', function () {
      expect(parse(`${question}\n${correctText}\n${incorrectText}\n${radio}\n${radio}`)[0].incorrectText).to.deep.equal(incorrectTextResult);
    });

    it('allows for no correct or incorrect text results', function () {
      expect(parse(`${question}\n${radio}\n${radio}`)[0].incorrectText).to.deep.equal(undefined);
      expect(parse(`${question}\n${radio}\n${radio}`)[0].correctText).to.deep.equal(undefined);
    });
  });

  describe('Checkbox', function () {
    const checkbox = `[] ${text}`;

    it('parses question', function () {
      expect(parse(`${question}\n${checkbox}`)[0].question).to.equal(question);
    });

    it('parses single answer', function () {
      expect(parse(`${question}\n${checkbox}`)[0].answers).to.deep.equal([answer]);
    });

    it('parses multiple answers', function () {
      expect(parse(`${question}\n${checkbox}\n${checkbox}`)[0].answers).to.deep.equal([answer, answer]);
    });

    it('disregards whitespace', function () {
      expect(parse(` ${question} \n${checkbox}`)[0].question).to.equal(question);
      expect(parse(`${question}\n[ ] ${text}`)[0].answers).to.deep.equal([answer]);
      expect(parse(`${question}\n[]${text}`)[0].answers).to.deep.equal([answer]);
      expect(parse(`${question}\n${checkbox} `)[0].answers).to.deep.equal([answer]);
    });

    it('passes through html in questions', function () {
      expect(parse(`${htmlQuestion}\n${checkbox}`)[0].question).to.equal(htmlQuestion);
    });

    it('passes through html in answers', function () {
      expect(parse(`${question}\n[val] ${htmlText}`)[0].answers).to.deep.equal([htmlAnswer]);
    });

    it('parses correct answers', function () {
      const correctCheckbox = `[*] ${text}`;

      expect(parse(`${question}\n${correctCheckbox}`)[0].answers).to.deep.equal([correctAnswer]);
      expect(parse(`${question}\n${correctCheckbox}\n${checkbox}\n${correctCheckbox}`)[0].answers).to.deep.equal([correctAnswer, answer, correctAnswer]);
    });

    it('parses answers with values', function () {
      expect(parse(`${question}\n[val] answer`)[0].answers).to.deep.equal([answerWithVal]);
      expect(parse(`${question}\n[*val] answer`)[0].answers).to.deep.equal([correctAnswerWithVal]);
    });
  });

  describe('Range', function () {
    const range = '{1-3} left | right',
      rangeWithMiddle = '{1-3} left | middle | right',
      rangeWithCategory = '{1-3} left | right\n-A cool category-';

    it('parses question', function () {
      expect(parse(`${question}\n${range}`)[0].question).to.equal(question);
    });

    it('parses range with dashes', function () {
      expect(parse(`${question}\n${range}`)[0].answers).to.deep.equal([1, 2, 3]);
    });

    it('parses range with commas', function () {
      // forwards
      expect(parse(`${question}\n{1,2,3} left | right`)[0].answers).to.deep.equal([1, 2, 3]);
      expect(parse(`${question}\n{2,4,6} left | right`)[0].answers).to.deep.equal([2, 4, 6]);
      // backwards
      expect(parse(`${question}\n{3, 2, 1} left | right`)[0].answers).to.deep.equal([3, 2, 1]);
      // any direction!
      expect(parse(`${question}\n{6,2,4} left | right`)[0].answers).to.deep.equal([6, 2, 4]);
    });

    it('parses ranges with commas and dashes', function () {
      expect(parse(`${question}\n{1-3, 5} left | right`)[0].answers).to.deep.equal([1, 2, 3, 5]);
      expect(parse(`${question}\n{1, 3-5, 7} left | right`)[0].answers).to.deep.equal([1, 3, 4, 5, 7]);
      expect(parse(`${question}\n{1, 3-5} left | right`)[0].answers).to.deep.equal([1, 3, 4, 5]);
    });

    it('allows left and right text', function () {
      expect(parse(`${question}\n${range}`)[0].leftText).to.equal('left');
      expect(parse(`${question}\n${range}`)[0].rightText).to.equal('right');
    });

    it('allows middle text', function () {
      expect(parse(`${question}\n${rangeWithMiddle}`)[0].middleText).to.equal('middle');
    });

    it('parses range with category', function () {
      expect(parse(`${question}\n${rangeWithCategory}`)[0].category).to.equal('A cool category');
    });

    it('parses range without category', function () {
      expect(parse(`${question}\n${rangeWithMiddle}`)[0].category).to.equal(undefined);
    });

    it('disregards whitespace', function () {
      // question
      expect(parse(` ${question} \n${range}`)[0].question).to.equal(question);
      // ranges
      expect(parse(`${question}\n{ 1-2 } left| right`)[0].answers).to.deep.equal([1, 2]);
      expect(parse(`${question}\n{1 - 2} left| right`)[0].answers).to.deep.equal([1, 2]);
      expect(parse(`${question}\n{1 - 2, 3 } left| right`)[0].answers).to.deep.equal([1, 2, 3]);
      expect(parse(`${question}\n{1, 2- 3 } left| right`)[0].answers).to.deep.equal([1, 2, 3]);
      // text
      expect(parse(`${question}\n{1-2}left|right `)[0].leftText).to.equal('left');
      expect(parse(`${question}\n{1-2} left |right `)[0].rightText).to.equal('right');
      expect(parse(`${question}\n{1-2} left| middle | right `)[0].middleText).to.equal('middle');
    });

    it('passes through html in questions', function () {
      expect(parse(`${htmlQuestion}\n${range}`)[0].question).to.equal(htmlQuestion);
    });

    it('passes through html in answers', function () {
      const left = '<span class="left">left</span>',
        middle = '<span class="middle">middle</span>',
        right = '<span class="right">right</span>';

      expect(parse(`${question}\n{1-3} ${left}| right`)[0].leftText).to.equal(left);
      expect(parse(`${question}\n{1-3} left| ${right}`)[0].rightText).to.equal(right);
      expect(parse(`${question}\n{1-3} left | ${middle} | right`)[0].middleText).to.equal(middle);
    });
  });
});

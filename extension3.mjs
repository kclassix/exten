import puppeteer from "puppeteer";
import * as cheerio from 'cheerio';
import * as chromeLauncher from 'chrome-launcher';
import { app, dialog } from 'electron';

let userDocument = app.getPath('documents') + '/Documents';
let extensionPath = userDocument + '/dist/extension';

const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function mode(arr) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length
    - arr.filter(v => v === b).length
  ).pop();
}

let oneformaLoginPage;
let oneformaGrammarExamPage;
let pageGemini;
let pageChatGpt;
let grammarExam = true;
let hasLaunchedGemini = false;

let answerList = [];
let answerInputList = [];


export default function extension3(userDetails, certId) {

  async function oneformaLogin(userDetails) {
    let chromeDir = '/Oneforma';
    let chromeProfile = 'Profile ' + userDetails?.profile;
    const chrome = await chromeLauncher.launch({
      ignoreDefaultFlags: true,
      chromeFlags: ["--disable-gpu", "--no-first-run", "--silent-debugger-extension-api", "--enable-extension", "--load-extension=extension", '--proxy-server=geo.iproyal.com:12321']
      // chromeFlags: ["--disable-gpu", "--no-first-run", "--profile-directory=" + chromeProfile, "--user-data-dir=" + userDocument + chromeDir,  "--silent-debugger-extension-api", "--enable-extension", "--load-extension=" + extensionPath, '--proxy-server=geo.iproyal.com:12321']
    });
    const browserURL = `http://localhost:${chrome.port}`;
    const browser = await puppeteer.connect({ browserURL, defaultViewport: null });

    const pages = await browser.pages();
    const pageAuth = pages[pages.length - 1];

    await checkBeforeRelaunch();

    await pageAuth.authenticate({
      username: userDetails.proxyUsername,
      password: userDetails.proxyPassword

    });

    await pageAuth.goto("chrome-extension://ncbknoohfjmcfneopnfkapmkblaenokb/popup.html", {
      timeout: 0,
      waitUntil: 'networkidle2'
    });

    await pageAuth.goto("https://example.com", {
      timeout: 0,
      waitUntil: 'networkidle2'
    });

    await pageAuth.close();
    oneformaLoginPage = await browser.newPage();

    // await oneformaLoginPage.setRequestInterception(true);
    // oneformaLoginPage.on("request", (request) => {
    //   if (request.resourceType() === "image") {
    //     // console.log("Blocking image request: " + request.url());
    //     request.abort();
    //   } else {
    //     request.continue();
    //   }
    // });
    await oneformaLoginPage.goto('https://my.oneforma.com/Account/login.php', {
      timeout: 0,
      waitUntil: 'networkidle2'
    });

    if (oneformaLoginPage.url().includes('login')) {
      await oneformaLoginPage.bringToFront();
      await sleep(2000);
      await oneformaLoginPage.waitForSelector('#form-email', { timeout: 0 });
      await oneformaLoginPage.type("#form-email", userDetails.emailAddress);
      await oneformaLoginPage.type("#form-password", userDetails.password);
      // sleep(1000);
      await oneformaLoginPage.click("#login_btn");

      await oneformaLoginPage.waitForNavigation({ timeout: 0 });
    }

    await oneformaLoginPage.goto('https://my.oneforma.com/UserPortal/certifications', {
      timeout: 0,
      waitUntil: 'networkidle2'
    });

    if (grammarExam) {
      try {
        examGrammar(certId, oneformaLoginPage);
      } catch (error) {
        // console.log('something sup')
      }
    }
  }
  let fetchDataLength = 0;
  async function checkBeforeRelaunch(question, deleteWord) {

    answerList = [];
    answerInputList = [];

    if (!hasLaunchedGemini) {
      let chromeDir = '/Gemini';
      let chromeProfile = 'Person 2';
      const chrome = await chromeLauncher.launch({
        ignoreDefaultFlags: true,
        chromeFlags: ["--no-first-run", "--disable-gpu", "--profile-directory=" + chromeProfile, "--user-data-dir=" + userDocument + chromeDir],
      });
      const browserURL = `http://localhost:${chrome.port}`;
      const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
      pageGemini = await browser.pages();
      pageChatGpt = pageGemini[pageGemini.length - 1];

      hasLaunchedGemini = true;

      await pageChatGpt.goto("https://chatgpt.com/auth/login", {
      waitUntil: "networkidle2",
    });

    // await pageChatGpt.waitForSelector('body > div > div.relative.flex.grow.flex-col.items-center.justify-between.bg-white.px-5.py-8.text-black.dark\\:bg-black.dark\\:text-white.sm\\:rounded-t-\\[30px\\].md\\:rounded-none.md\\:px-6 > div.relative.flex.w-full.grow.flex-col.items-center.justify-center > div > div > button:nth-child(1)');
    // await pageChatGpt.click('body > div > div.relative.flex.grow.flex-col.items-center.justify-between.bg-white.px-5.py-8.text-black.dark\\:bg-black.dark\\:text-white.sm\\:rounded-t-\\[30px\\].md\\:rounded-none.md\\:px-6 > div.relative.flex.w-full.grow.flex-col.items-center.justify-center > div > div > button:nth-child(1)');
    await sleep(1000);

    await pageChatGpt.evaluate(() => {
      document
        .querySelector(
          "body > div > div.relative.flex.grow.flex-col.items-center.justify-between.bg-white.px-5.py-8.text-black.dark\\:bg-black.dark\\:text-white.sm\\:rounded-t-\\[30px\\].md\\:rounded-none.md\\:px-6 > div.relative.flex.w-full.grow.flex-col.items-center.justify-center > div > div > button:nth-child(1)"
        )
        .click();
    });

    await pageChatGpt.waitForNavigation({ timeout: 0 });
    await pageChatGpt.waitForSelector("#email-input");
    await pageChatGpt.type("#email-input", "ugonnaya2018@gmail.com");
    await sleep(1000);
    await pageChatGpt.click(".continue-btn");
    await sleep(5000);
    await pageChatGpt.type("#password", "Emmaorakwue007");

    await sleep(1000);

    await pageChatGpt.click("._button-login-password");

    await pageChatGpt.waitForNavigation({ timeout: 0 });

    await pageChatGpt.goto("https://chatgpt.com", {
      waitUntil: "networkidle2",
      timeout: 0
    });
    };

    if (question) {

      let promptText;
      let answerBoxInfo

      answerBoxInfo = 'Answer this question: ';

      promptText = answerBoxInfo + question?.Task + question?.Body + (question?.Options ? question?.Options : '') + (question?.Options ? '. Answer either A,B,C. Returning only the result of the answer and adhering strictly to the question instruction.' : ' .Returning only the' + (deleteWord ? ' deleted word as' : '') + ' result of the answer and adhering strictly to the question instruction.');
      // console.log('promptText', promptText)

      function pushAnswer(finalResult) {
        if (finalResult?.toLowerCase()?.includes('a')) {
          answerList.push('A');
        } else if (finalResult?.toLowerCase()?.includes('b')) {
          answerList.push('B');
        } else if (finalResult?.toLowerCase()?.includes('c')) {
          answerList.push('C');
        } else if (finalResult?.toLowerCase()?.includes('d')) {
          answerList.push('D');
        } else if (finalResult?.toLowerCase()?.includes('e')) {
          answerList.push('E');
        }
      }

      function pushAnswerInput(finalResult) {
        answerInputList.push(finalResult);
      }

      async function checkResultChatGpt(question) {

        await pageChatGpt.evaluate((question) => {
          document.querySelector("#prompt-textarea > p").innerText = question;
        }, question);

        await sleep(1000);

        await pageChatGpt.evaluate(() => {
          document.querySelector("#composer-background > div.flex.h-\\[44px\\].items-center.justify-between > button").click()
        });
        await sleep(5000);

        async function getData() {
          return await pageChatGpt.$$eval('.prose', async el => {
            let returnedText;
            const sleep = (milliseconds) => {
              return new Promise((resolve) => setTimeout(resolve, milliseconds));
            }
            while (returnedText == undefined) {
              try {
                returnedText = { length: el?.length, text: el[el.length - 1]?.innerText };
              } catch (error) {
                await sleep(3000);
              } finally {
                returnedText = { length: el?.length, text: el[el.length - 1]?.innerText };
              }
            }
            return returnedText;
          });

        };

        let fetchData = await getData();

        while (fetchDataLength == fetchData?.length) {
          await sleep(3000);
          fetchData = await getData();
        };

        fetchDataLength = fetchData?.length;

        let foundData = fetchData?.text;
        // console.log('foundData ChatGpt', foundData);

        if (foundData?.includes('"')) {
          foundData = foundData?.replaceAll('"', '')
        }
        // console.log('finalResult ChatGpt', foundData);

        if (promptText.includes('Options:')) {
          pushAnswer(foundData);
        } else {
          pushAnswerInput(foundData);
        }
      };

      // console.log(promptText)
      let result4 = await checkResultChatGpt(promptText);

      // console.log('answerList', answerList);
      // console.log('answerList', answerInputList);

      if (promptText.includes('Options:')) {
        return mode(answerList);
      } else {
        return mode(answerInputList);
      }

    };
  };

  async function examGrammar(certId, page) {
    oneformaGrammarExamPage = page;

    await oneformaGrammarExamPage.waitForSelector('.suggested-box', { timeout: 0 });

    await oneformaGrammarExamPage.click('#all-tab');

    await oneformaGrammarExamPage.waitForSelector('.suggested-box', { timeout: 0 });

    await oneformaGrammarExamPage.evaluate(async (searchText) => {
      const elements = document.querySelectorAll('.suggested-box .suggested-box-body  .sdescription-box');
      elements.forEach(async (element) => {
        if (element.innerText.includes(searchText)) {
          element.parentElement.children[1].children[0].click();
        }
      });
    }, certId);
    await oneformaGrammarExamPage.waitForSelector('.modal.fade.show', { timeout: 0 });

    async function checkAvailableAttempt() {
      return await oneformaGrammarExamPage.evaluate(() => {
        console.log(document.querySelector("#CertificationsDetails > div > div > div.modal-body > div > div.col-md-5 > div.container > div:nth-child(2) > div.col-xs-6.text-left").innerText)
        return document.querySelector("#CertificationsDetails > div > div > div.modal-body > div > div.col-md-5 > div.container > div:nth-child(2) > div.col-xs-6.text-left").innerText;
      })
    }

    let availableAttempt = await checkAvailableAttempt();

    await sleep(5000);

    if (!availableAttempt.includes('0')) {

      async function checkExamStatus() {
        return await oneformaGrammarExamPage.evaluate(() => {
          if (document.querySelector('#available_certification_container').style.display == 'none') {
            return 'retry_certification_link';
          } else {
            return 'attempt_certification_button';
          };
        });
      };
      let examStatus = await checkExamStatus();

      if (examStatus == 'attempt_certification_button') {
        await oneformaGrammarExamPage.click('#attempt_certification_button');
      } else if (examStatus == 'retry_certification_link') {
        await oneformaGrammarExamPage.click('#retry_certification_link');
      };

      if (certId.includes('Welcome')) {

        await sleep(5000);

        await oneformaGrammarExamPage.waitForSelector('.arrow-btn', { timeout: 0 });
        await oneformaGrammarExamPage.click('.arrow-btn');
      } else {
        async function checkExamMove() {
          return await oneformaGrammarExamPage.evaluate(() => {
            return document.querySelector('#exam_modal').style.display == 'none';
          });
        };
        let examMove = await checkExamMove();

        // console.log('examMove', examMove);

        while (examMove) {
          await sleep(2000);
          examMove = await checkExamMove();
        };

        await sleep(5000);

        await oneformaGrammarExamPage.click('#movetoexam');

      }

      let previousQuestion = ''

      async function checkExamBody() {
        return await oneformaGrammarExamPage.evaluate(async (previousQuestion) => {
          const sleep = (milliseconds) => {
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
          }

          async function checkQuestionBody() {
            try {
              let questionBodyFetch = [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].innerText;

              return questionBodyFetch;
            } catch (error) {

              return '';
            }
          }

          let questionBody = await checkQuestionBody();

          while (questionBody == undefined || questionBody == null || questionBody == '' || questionBody == previousQuestion) {
            await sleep(3000);
            questionBody = await checkQuestionBody();
          }

          return questionBody;
        }, previousQuestion);
      };

      let examSubmit = await checkExamBody();

      // console.log('examSubmit1', examSubmit);

      // previousQuestion = examSubmit;

      await sleep(2000);
      async function examLogic() {

        async function omoCheck() {

          return await oneformaGrammarExamPage.$eval('#webapp_frame', el => {
            return el?.contentDocument?.documentElement.innerHTML;
          });
        };
        let mainResult = await omoCheck();
        let $ = cheerio?.load(mainResult);

        let instruction = $('#question_panel > div.panel-body > #question_header').text() + " ";
        let questionBody = $('#question_panel > div.panel-body > #question_container').text();
        let questionOption = " " + $('#question_panel').html();
        let questionIdentifier = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

        while (previousQuestion == questionBody) {
          await sleep(3000);
          mainResult = await omoCheck();
          $ = cheerio?.load(mainResult);
          instruction = $('#question_panel > div.panel-body > #question_header').text() + " ";
          questionBody = $('#question_panel > div.panel-body > #question_container').text();
          questionOption = " " + $('#question_panel').html();
        };

        previousQuestion = questionBody;

        if (questionOption.includes('radio')) {
          const optionsResult = await oneformaGrammarExamPage.evaluate(async (questionOption) => {
            function removeDiacritics(str) {
              const defaultDiacriticsRemovalMap = [
                { base: 'A', letters: /[\u00C0-\u00C5]/g },
                { base: 'a', letters: /[\u00E0-\u00E5]/g },
                { base: 'C', letters: /[\u00C7]/g },
                { base: 'c', letters: /[\u00E7]/g },
                { base: 'E', letters: /[\u00C8-\u00CB]/g },
                { base: 'e', letters: /[\u00E8-\u00EB]/g },
                { base: 'I', letters: /[\u00CC-\u00CF]/g },
                { base: 'i', letters: /[\u00EC-\u00EF]/g },
                { base: 'N', letters: /[\u00D1]/g },
                { base: 'n', letters: /[\u00F1]/g },
                { base: 'O', letters: /[\u00D2-\u00D6\u00D8]/g },
                { base: 'o', letters: /[\u00F2-\u00F6\u00F8]/g },
                { base: 'S', letters: /[\u00DF]/g },
                { base: 'U', letters: /[\u00D9-\u00DC]/g },
                { base: 'u', letters: /[\u00F9-\u00FC]/g },
                { base: 'Y', letters: /[\u00DD]/g },
                { base: 'y', letters: /[\u00FD\u00FF]/g }
              ];

              for (let i = 0; i < defaultDiacriticsRemovalMap.length; i++) {
                str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
              }
              return str;
            };

            var wrapper = document.createElement('div');
            wrapper.innerHTML = questionOption;
            var returnedOptions = wrapper.querySelectorAll('.custom-control-label');

            let foundOptions = [];
            returnedOptions.forEach(option => {
              foundOptions.push(removeDiacritics(option?.innerText.toLowerCase()));
            })

            return foundOptions;
          }, questionOption);

          // console.log('optionsResult', optionsResult);

          let questionInit = '';
          let questionNum = 0;
          optionsResult.forEach((option) => {
            questionInit += `${questionIdentifier[questionNum]})${option} `;
            questionNum++
          })

          let questionTemplate = {
            Task: instruction,
            Body: questionBody,
            Options: 'Options: ' + questionInit
          };

          // console.log('questionTemplate', questionTemplate);

          let rere = await checkBeforeRelaunch(questionTemplate);

          // console.log('rere', await rere);

          let rereIndex;

          if (rere?.includes('A')) {
            rereIndex = 0;
          } else if (rere?.includes('B')) {
            rereIndex = 1;
          } else if (rere?.includes('C')) {
            rereIndex = 2;
          } else if (rere?.includes('D')) {
            rereIndex = 3;
          } else if (rere?.includes('E')) {
            rereIndex = 4;
          }

          // console.log('rereIndex', rereIndex)
          const response = await oneformaGrammarExamPage.evaluate((rereIndex) => {
            [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].children[0].children[0].children[0].children[1].children[2].children[rereIndex].firstElementChild.click();

            setTimeout(() => {
              [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].children[0].children[0].children[0].children[1].lastElementChild.children[0].click();
            }, 1000);
          }, rereIndex);

          setTimeout(() => {
            examLogic();
          }, 10000);

        }
      };
      examLogic();
    };
  };

  oneformaLogin(userDetails)
}

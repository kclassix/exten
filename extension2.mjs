import puppeteer from "puppeteer";
import * as cheerio from 'cheerio';
import * as chromeLauncher from 'chrome-launcher';
import { app, dialog } from 'electron';
import UserAgent from 'user-agents';

let userDocument = app.getPath('documents');
let extensionPath = userDocument + '/dist/extension';


validarErrores: (error, escenario) => {
  console.log(`${error.toString()}`.bgRed);
  if (typeof escenario == `undefined`) {
    return self.mensajeError(`Error 500 - Objeto indefinido`);
  }
  const { TimeoutError } = require('puppeteer/Errors');
  if (error instanceof TimeoutError) {
    if (error.toString().search(`Navigation Timeout`) != -1) {
      return self.mensajeError(`Se produjo un error de <strong> Timeout </strong> al navegar`);
    }
    for (pasos in escenario) {
      for (prop in escenario[pasos]) {
        if (error.toString().search(escenario[pasos][prop]) != -1) {
          return self.mensajeError(`Se produjo un error al <strong> no poder localizar </strong> el campo <strong>${escenario[pasos][prop]}</strong>`);
        }
      }
    }
    return self.mensajeError(`Error 500 - ${error.toString}`);
  }
  else if (error instanceof Error) {
    switch (true) {
      case (error.toString().includes(`ERR_INTERNET_DISCONNECTED`)):
        return self.mensajeError(`No hay conexión fisica a la red Local`);
        break;
      case (error.toString().includes(`ERR_CONNECTION_TIMED_OUT`)):
        return self.mensajeError(`La aplicacion no se encuentra en línea`);
        break;
      case (error.toString().includes(`ERR_CONNECTION_REFUSED`)):
        return self.mensajeError(`La dirección de la aplicacion no es correcta`);
        break;
      default:
        return self.mensajeError(`La aplicación a encontrado el ${error}`);
        break;
    }
  }
  // throw new Error(error);
}

let oneformaLoginPage;
let oneformaGrammarExamPage;
let pageGemini;
let pageChatGpt;
let grammarExam = true;
let hasLaunchedGemini = false;


const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

let fetchDataLength = 0;
async function checkBeforeRelaunch(question) {

  //   answerList = [];
  //   answerInputList = [];

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

    await pageChatGpt.goto("https://chatgpt.com/?model=o1-preview", {
      waitUntil: "networkidle2",
      timeout: 0
    });

    if (pageChatGpt.url() != 'https://chatgpt.com/?model=o1-preview') {
      await pageChatGpt.goto("https://chatgpt.com/?model=o1-preview", {
        waitUntil: "networkidle2",
        timeout: 0
      });
    }

    let instruction = 'For each question you will see a sentence in the source language and underneath an initial translation has been provided. But, this initial translation will contain one absolute/objective error that can be fixed with one edit. spot the only single error highlight and correct the single error only. Note; there is only a single error do not correct more than one word as it only contains one word error. don’t correct the sentence structure just the one objective error. return only the Revised Translation.'

    await sleep(2000);

    await pageChatGpt.evaluate((instruction) => {
      document.querySelector("#prompt-textarea > p").innerText = instruction;
    }, instruction);

    await sleep(1000);

    await pageChatGpt.evaluate(() => {
      document.querySelector("#composer-background > div.flex.h-\\[44px\\].items-center.justify-between > button").click()
    });

  };

  if (question) {
    let promptText;

    // promptText = `Source Language Text: ${question.sourceLang}

    //                 Initial Translation: ${question.initialTrans}

    //                 Proposed Translation: For each question you will see a sentence in the source language and underneath an initial translation has been provided. But, this initial translation will contain one absolute/objective error that can be fixed with one edit. spot the only single error highlight and correct the single error only.

    //                 Note;
    //                 they is only a single error do not correct more than one word as it only contains one word error. Return only the corrected translation and adhering strictly to the question instruction.
    //             `;

    promptText = `Source Language Text: ${question.sourceLang}

                    Initial Translation: ${question.initialTrans}
                `;
    console.log('promptText', promptText)

    async function checkResultChatGpt(question) {

      await sleep(1000);
      await pageChatGpt.evaluate((question) => {
        document.querySelector("#prompt-textarea > p").innerText = question;
      }, question);

      await sleep(1000);

      await pageChatGpt.evaluate(() => {
        document.querySelector("#composer-background > div.flex.h-\\[44px\\].items-center.justify-between > button").click()
        // try {
        //   document.querySelector("body > div.relative.flex.h-full.w-full.overflow-hidden.transition-colors.z-0 > div.relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden > main > div.composer-parent.flex.h-full.flex-col.focus-visible\\:outline-0 > div.flex-1.overflow-hidden > div > div.flex.h-full.flex-col.items-center.justify-center.text-token-text-primary > div > div > div > div:nth-child(4) > form > div > div.group.relative.flex.w-full.items-center > div > div > div.mb-1.me-1 > button").click();
        // } catch (error) {
        //   document.querySelector("body > div.relative.flex.h-full.w-full.overflow-hidden.transition-colors.z-0 > div.relative.flex.h-full.max-w-full.flex-1.flex-col.overflow-hidden > main > div.composer-parent.flex.h-full.flex-col.focus-visible\\:outline-0 > div.md\\:pt-0.dark\\:border-white\\/20.md\\:border-transparent.md\\:dark\\:border-transparent.w-full > div > div.m-auto.text-base.px-3.md\\:px-4.w-full.md\\:px-5.lg\\:px-4.xl\\:px-5 > div > form > div > div.group.relative.flex.w-full.items-center > div > div > div.mb-1.me-1 > button").click();
        // }
      });
      await sleep(5000);

      async function getData() {
        return await pageChatGpt.evaluate(async () => {
          let returnedText;

          const sleep = (milliseconds) => {
            return new Promise((resolve) => setTimeout(resolve, milliseconds));
          }
          while (returnedText == undefined) {
            let el = document.querySelectorAll('.prose');
            try {
              await sleep(10000);
              returnedText = { length: el.length, text: el[el.length - 1].innerText };
            } catch (error) {
              await sleep(3000);
            }
            // finally {
            //   returnedText = { length: el.length, text: el[el.length - 1].innerText };
            // }
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

      let foundData = fetchData.text;
      console.log('foundData ChatGpt', foundData);

      return foundData;
    };

    return await checkResultChatGpt(promptText);

  };
};



export default async function extension2(userDetails, certId) {

  hasLaunchedGemini = false;


  let chromeDir = '/' + userDetails.firstname;
  let chromeProfile = 'Person ' + userDetails.profile;
  const chrome = await chromeLauncher.launch({
    ignoreDefaultFlags: true,
    // chromeFlags: ["--disable-gpu", "--no-first-run"]
    chromeFlags: ["--disable-gpu", "--no-first-run", "--profile-directory=" + chromeProfile, "--user-data-dir=" + userDocument + chromeDir, "--silent-debugger-extension-api", "--enable-extension", "--load-extension=" + extensionPath, '--proxy-server=geo.iproyal.com:12321']
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

  const userAgent = new UserAgent({ deviceCategory: 'desktop' }); // You can specify the device category

  const randomUserAgent = userAgent.toString();

  await oneformaLoginPage.setUserAgent(randomUserAgent);
  // oneformaLogin(userDetails);
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
    // oneformaGrammarExamPage = await browser.newPage();
    try {
      examGrammar(certId, oneformaLoginPage);
    } catch (error) {
      console.log('something sup')
    }
  }
}

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


  async function enterTCGExam(value) {
    // await oneformaGrammarExamPage.waitForNavigation();

    await oneformaGrammarExamPage.waitForSelector('.arrow-btn', { timeout: 0 });
    await oneformaGrammarExamPage.click('.arrow-btn');


    // console.log(value)
    // console.log(page1.url())
    await sleep(2000);

    if (!oneformaGrammarExamPage.url().includes('CertificationMaster')) {
      await oneformaGrammarExamPage.click('.arrow-btn');
    }

    await sleep(2000);
    console.log('here');
  };

  // await oneformaGrammarExamPage.waitForNavigation();

  // console.log('hereeee')

  enterTCGExam();

  let previousQuestion = ''

  async function checkExamBody() {
    return await oneformaGrammarExamPage.evaluate(async (previousQuestion) => {
      const sleep = (milliseconds) => {
        return new Promise((resolve) => setTimeout(resolve, milliseconds));
      }

      async function checkQuestionBody() {
        try {
          // let questionBodyFetch = [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].firstElementChild.lastElementChild.lastElementChild.innerText;
          let questionBodyFetch = [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].firstElementChild.firstElementChild.children[1].firstElementChild.lastElementChild.lastElementChild.lastElementChild.lastElementChild.innerText;
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

  await oneformaGrammarExamPage.waitForSelector('.arrow-btn', { timeout: 0 });
  await oneformaGrammarExamPage.click('.arrow-btn');

  while (!oneformaGrammarExamPage.url().includes('CertificationMaster')) {
    await sleep(2000)
  }

  let examSubmit = await checkExamBody();

  console.log('examSubmit1', examSubmit);

  await sleep(2000);
  async function examLogic() {

    async function omoCheck() {
      return await oneformaGrammarExamPage.$eval('#webapp_frame', el => {
        return el?.contentDocument?.documentElement.innerHTML;
      });
    };
    let mainResult = await omoCheck();
    const $ = cheerio?.load(mainResult);

    let sourceLanguageText = $('#source_text').text();
    let initialTransLation = $('#mt_textbox').text();
    let proposedTranslation = $('#translation_textbox').text();

    console.log('sourceLanguageText', sourceLanguageText);
    console.log('initialTransLation', initialTransLation);
    console.log('proposedTranslation', proposedTranslation);

    let questionTemplate = {
      sourceLang: sourceLanguageText,
      initialTrans: initialTransLation
    };

    console.log('questionTemplate', questionTemplate);

    let rere = await checkBeforeRelaunch(questionTemplate);

    console.log('rere', await rere);

    const response = await oneformaGrammarExamPage.evaluate((rere) => {
      [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].lastElementChild.firstElementChild.children[1].lastElementChild.children[0].firstElementChild[3].value = rere;
      setTimeout(() => {
        [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].lastElementChild.firstElementChild.children[1].lastElementChild.children[0].firstElementChild[4].click();
      }, 1000);
    }, rere);

    setTimeout(() => {
      examLogic();
    }, 5000);
  };
  examLogic();
};

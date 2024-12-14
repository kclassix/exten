import puppeteer from "puppeteer";
import { dialog } from "electron";
import * as cheerio from 'cheerio';
import * as chromeLauncher from 'chrome-launcher';

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

function mode(arr) {
    return arr.sort((a, b) =>
        arr.filter(v => v === a).length
        - arr.filter(v => v === b).length
    ).pop();
}

let fetchDataLength = 0;
let pageGemini;
let pageChatGpt;
let oneformaGrammarExamPage;

let answerList = [];
let answerInputList = [];

let translatePage;
let translateOpen;
let sentInstruction = false;

export default async function extension6({ reconnectValue }) {
    sentInstruction = false;

    function reconnectReading() {

        dialog.showErrorBox('Reading', `yooo`);

        let fetchDataLength = 0;
        async function checkBeforeRelaunch(question, deleteWord) {

            answerList = [];
            answerInputList = [];

            if (question) {

                const browserURL = reconnectValue.gpt;
                const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
                pageGemini = await browser.pages();
                pageChatGpt = pageGemini[pageGemini.length - 1];


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

                if (promptText.includes('Options:')) {
                    return mode(answerList);
                } else {
                    return mode(answerInputList);
                }

            };
        };

        examGrammarReading()
        async function examGrammarReading(certId, page) {

            const browserURL = reconnectValue.oneForma;
            const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
            const pages = await browser.pages();
            oneformaGrammarExamPage = pages[pages.length - 1];



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

                    let rere;
                    try {
                        rere = await checkBeforeRelaunch(questionTemplate);
                    } catch (error) {
                        rere = await checkBeforeRelaunch(questionTemplate);
                    }

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


    function examsProficiency(userDetails, certId) {
        dialog.showErrorBox('Grammar', `yooo`);

        async function checkInstruction(context) {

            if (!translateOpen) {
                const chrome = await chromeLauncher.launch({
                    // chromeFlags: ["--headless"],
                });
                const browserURL = `http://localhost:${chrome.port}`;
                const browser = await puppeteer.connect({ browserURL, defaultViewport: null });

                const pages = await browser.pages();
                translatePage = pages[pages.length - 1];
                translateOpen = true;
                await translatePage.goto('https://translate.google.com/?sl=auto&tl=en&op=translate', {
                    timeout: 0,
                    waitUntil: 'networkidle2'
                });
            }

            if (context) {
                // const page = translatePage[translatePage.length - 1];
                const inputField = await translatePage.$('#yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > div > c-wiz > span > span > div > textarea');
                await inputField.click({ clickCount: 3 }); // Selecting all text in the field
                await inputField.type(String.fromCharCode(8));
                await sleep(2000);
                await translatePage.keyboard.type(context);

                async function omoCheck() {
                    try {
                        await translatePage.evaluate(async () => {
                            const sleep = (milliseconds) => {
                                return new Promise((resolve) => setTimeout(resolve, milliseconds));
                            };
                            while (document.querySelector('#yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > c-wiz > div > div.usGWQd > div > div.lRu31') == null || document.querySelector('#yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > c-wiz > div > div.usGWQd > div > div.lRu31') == undefined) {
                                await sleep(3000)
                            }
                        })
                        return await translatePage.$eval('#yDmH0d > c-wiz > div > div.ToWKne > c-wiz > div.OlSOob > c-wiz > div.ccvoYb > div.AxqVh > div.OPPzxe > c-wiz > div > div.usGWQd > div > div.lRu31', el => {
                            return el.innerText;
                        });
                    } catch (error) {

                    }
                };

                let result = await omoCheck();

                while (result < 4) {
                    await sleep(3000)
                    result = await omoCheck();
                }

                console.log('result context', result)
                return result;
            }
        };

        let fetchDataLength = 0;
        async function checkBeforeRelaunch(question, deleteWord) {

            answerList = [];
            answerInputList = [];

            if (question) {

                // const browserURL = `http://localhost:49598`;

                pageChatGpt = pageGemini[pageGemini.length - 1];


                let promptText;
                let answerBoxInfo

                answerBoxInfo = 'Answer this question: ';

                promptText = answerBoxInfo + question?.Task + question?.Body + (question?.Options ? question?.Options : '') + (question?.Options ? '. Answer either A,B,C. Returning only the result of the answer and adhering strictly to the question instruction.' : ' .Returning only the' + (deleteWord ? ' deleted word as' : '') + ' result of the answer and adhering strictly to the question instruction.');
                console.log('promptText', promptText)

                function pushAnswer(finalResult) {
                    console.log(finalResult)
                }

                function pushAnswerInput(finalResult) {
                    answerInputList.push(finalResult);
                }

                async function checkResultChatGpt(question) {

                    // await sleep(1000);
                    // console.log('question', question)
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
                                    returnedText = { length: el.length, text: el[el.length - 1].innerText };
                                } catch (error) {
                                    await sleep(3000);
                                } finally {
                                    returnedText = { length: el.length, text: el[el.length - 1].innerText };
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

                    let foundData = fetchData.text;
                    console.log('foundData ChatGpt', foundData);

                    return foundData;
                };

                // let result1 = await checkResultGemini(promptText);
                console.log(promptText)
                let result4 = await checkResultChatGpt(promptText);


                return result4;
            };
        };

        examGrammar()
        async function examGrammar(certId, page) {

            // const browserURL = `http://localhost:49586`;
            // const browserURL = `http://localhost:55079`;

            // const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
            // const pages = await browser.pages();
            // oneformaGrammarExamPage = pages[pages.length - 1];




            let previousQuestion = 'bnnb'

            async function checkExamBody() {

                return await oneformaGrammarExamPage.evaluate(async (previousQuestion) => {
                    const sleep = (milliseconds) => {
                        return new Promise((resolve) => setTimeout(resolve, milliseconds));
                    }

                    async function checkQuestionBody() {
                        try {
                            let questionBodyFetch = [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].firstElementChild.lastElementChild.lastElementChild.innerText;

                            return questionBodyFetch;
                        } catch (error) {

                            return '';
                            // await sleep(2000);

                            // questionBody = [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].firstElementChild.lastElementChild.lastElementChild.innerText;
                        }
                    }

                    let questionBody = await checkQuestionBody();

                    console.log(questionBody)

                    while (questionBody == undefined || questionBody == null || questionBody == '' || questionBody == previousQuestion) {
                        await sleep(3000);
                        questionBody = await checkQuestionBody();
                    }

                    return questionBody;
                }, previousQuestion);
            };

            console.log('here')

            // let examSubmit = await checkExamBody();
            console.log('here')


            // console.log('examSubmit1', examSubmit);

            // previousQuestion = examSubmit;

            await sleep(2000);
            async function examLogic() {

                async function omoCheck() {
                    await sleep(4000);

                    return await oneformaGrammarExamPage.$eval('#webapp_frame', el => {
                        return el?.contentDocument?.documentElement.innerHTML;
                    });
                };
                let mainResult = await omoCheck();
                let $ = cheerio?.load(mainResult);

                let instruction = $('#unique_question > div.form-question.col-sm-8 > div > div.question_text.alert.alert-info').text() + " ";
                let questionBody = $('#unique_question > div.form-question.col-sm-8 > div > div.position-relative > div').text();
                let questionOption = " " + $('#unique_question > div.form-elements.col-sm-4 > form > div').html();
                let sanitisedOption;
                let questionIdentifier = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

                while (previousQuestion == questionBody) {
                    await sleep(3000);
                    mainResult = await omoCheck();
                    $ = cheerio?.load(mainResult);
                    instruction = $('#unique_question > div.form-question.col-sm-8 > div > div.question_text.alert.alert-info').text() + " ";
                    questionBody = $('#unique_question > div.form-question.col-sm-8 > div > div.position-relative > div').text();
                    questionOption = " " + $('#unique_question > div.form-elements.col-sm-4 > form > div').html();
                    // sanitisedOption = { field: $?.text() != undefined ? $?.text() : '' };
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
                        let questionTag = wrapper.querySelectorAll('.shadow-sm');



                        let foundOptions = [];
                        returnedOptions.forEach(option => {
                            foundOptions.push(removeDiacritics(option?.innerText.toLowerCase()));
                        })

                        // questionTag.forEach(item => {
                        //   foundOptions.push(item.innerText)
                        // })

                        return foundOptions;
                    }, questionOption);


                    // console.log('questionOption', questionOption);
                    console.log('optionsResult', optionsResult);

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

                    console.log('questionTemplate', questionTemplate);

                    let rere;

                    try {
                        rere = await checkBeforeRelaunch(questionTemplate);
                    } catch (error) {
                        rere = await checkBeforeRelaunch(questionTemplate);
                    }

                    console.log('rere', await rere);

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

                    console.log('rereIndex', rereIndex);
                    if (certId == 'ISAAC_LanguageProficiencyTest_Grammar_SV') {
                        rereIndex += 1;
                    }
                    const response = await oneformaGrammarExamPage.evaluate((rereIndex) => {
                        [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild[4].children[rereIndex].firstElementChild.click();

                        setTimeout(() => {
                            [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild.lastElementChild.click();
                        }, 1000);
                    }, rereIndex);

                    setTimeout(() => {
                        examLogic();
                    }, 10000);

                } else {
                    const $ = cheerio?.load(questionOption);
                    sanitisedOption = { field: $?.text() != undefined ? $?.text() : '' };

                    let questionTemplate = {
                        Task: instruction,
                        Body: questionBody,
                        AnswerInfo: sanitisedOption?.field
                    }

                    let infoCheck = await checkInstruction(questionTemplate.Task);

                    console.log('infoCheck', infoCheck);

                    let rere = await checkBeforeRelaunch(questionTemplate, infoCheck.toLowerCase().includes('delete') ? true : false);

                    const response = await oneformaGrammarExamPage.evaluate((rere) => {

                        try {
                            [[document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild[4].children[1].firstElementChild][0].value = rere;

                        } catch (error) {
                            [[document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild[4].children[0].firstElementChild][0].value = rere;

                        }
                        setTimeout(() => {
                            [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild.lastElementChild.click();
                        }, 1000);

                    }, rere);

                    setTimeout(() => {
                        examLogic();
                    }, 10000);

                };
            };
            examLogic();
        };
    };


    function examsAcceptability(userDetails, certId) {
        dialog.showErrorBox('Acceptability', `yooo`);

        let fetchDataLength = 0;
        async function checkBeforeRelaunch(question, deleteWord) {

            answerList = [];
            answerInputList = [];

            if (question) {

                const browserURL = reconnectValue.gpt;
                const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
                pageGemini = await browser.pages();
                pageChatGpt = pageGemini[pageGemini.length - 1];


                await pageChatGpt.evaluate((question) => {
                    document.querySelector("#prompt-textarea > p").innerText = question;
                }, question);

                await sleep(1000);

                await pageChatGpt.evaluate(() => {
                    document.querySelector("#composer-background > div.flex.h-\\[44px\\].items-center.justify-between > button").click()
                });

                async function getData() {
                    return await pageChatGpt.$$eval('.prose', async el => {
                        // let returnedText = { length: el.length, text: el[el.length - 1].innerText };
                        let returnedText = el[el.length - 1].innerText;
                        return returnedText;
                    });

                };

                await sleep(3000);

                let fetchData = await getData();
                return fetchData;

            };
        };

        examGrammar()
        async function examGrammar(certId, page) {

            // const browserURL = `http://localhost:49586`;
            const browserURL = reconnectValue.oneForma;

            const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
            const pages = await browser.pages();
            oneformaGrammarExamPage = pages[pages.length - 1];


            let acceptabilityQuizInfo = `Use this information to answer the questions that comes after.
    
        INSTRUCTIONS FOR THE TASK
        
        You will be given a long source consisting of one or several paragraphs. Please read the source and its translation carefully, and then annotate any errors.
        
        When annotating an error, you will have to select the error category from predefined error categories, it's severity, its span (part of text with the error), and some categories also will ask you to select the error clue. For instance, if the error is a context one, the span would be a specific part of the source and it's translation and the error clue would be the part of the context that indicated the error.
        
        
        SEVERITY
        Each error can be considered major or minor (slider ON for Severe, slider OFF for minor):
        
        * Major or Severe: Errors that may confuse or mislead the reader due to significant change in meaning
        
        * Minor: Errors that don't lead to loss of meaning and wouldn't confuse or mislead the reader but would be noticed, would decrease stylistic quality, fluency or clarity, or would make the content less appealing.
        SPAN
        The span is a single word, phrase, sentence, or multiple sentences that correspond to a translation error. If two words are adjacent but correspond to two separate translation errors, two separate errors should be annotated. The span should only include text within one paragraph; if two adjacent paragraphs contain the same error, please annotate them separately, one error per paragraph.
        You will be asked to select the span in the source, in the translation, or both depending on the error category you select. For instance, if you select Addition error, that means something was added in the translation that wasn't in the source, so you should just mark that span in the Translation. In another example, if you have a mistranslation error, you will be asked to select the relevant part of the source and its corresponding incorrect part on the translation. You can find more details of this in the Error category section. For some categories like “Fluency/Inconsistency”, selecting multiple target spans is required.
        If it is difficult to identify distinct translation errors because the translation is so bad or unrelated to the source, please select the whole affected segment and choose the non-translation error category.
        ERROR CLUE
        It's the important piece of information in the context that indicates the error. Without it, the translation on its own would be correct. It should be the shortest span of text which gives a clue to the error.
        
        * 1 error clue per error: There should be a single error clue per annotation.
        * It can be in the same sentence as the error or a different one in the context. If you think there are several clues, please select the one closest to the error.
        * Error clues can be found in the source or translation depending on the error category.
        
        ERROR CATEGORIES
        Depending on the error category you choose, you might need to select span on the source or the target (or both) and an Error clue. Find down below a list of all the error categories:
        
        
        Error Category	Description	Source Span(s)	Translation Span(s)	Error Clue
        Accuracy/Addition	Translation includes information not present in the source	Not allowed	(required) Select span of added information in the translation which is not present in the source	(optional) Select source/target span which provides a clue to the error
        Accuracy/Omission	Translation is missing content from the source	(required) Select span in the source text which has no translation	Not allowed	(optional) Select source/target s pan which provides a clue to the error
        Accuracy/Mistranslation	Translation does not accurately represent the source	(required) Select source span which corresponds to the mistranslation error	(required) Select mistranslation error span in the translation	(required) Select span in the source context which provides a clue to the mistranslation error
        Accuracy/Untranslated Text	Source text was left untranslated in the target when a translation is expected	(optional) Select source text which was left untranslated	(required) Select untranslated span in the translation	(optional) Select source/target s pan which provides a clue to the error
        Accuracy/Non-translation	Impossible to reliably characterize distinct translation errors because the translation is garbled or is unrelated to the source text	(optional) Select source text whose translation is garbled or unrelated to the source	(required) Select span of the non-translation error in the translation	(optional) Select source/target s pan which provides a clue to the error
        Fluency/Punctuation	Incorrect punctuation for locale or style	(optional) Select source span of the punctuation error	(required) Select span of the punctuation error in the translation	(optional) Select source or target span which provides a clue to the punctuation error
        Fluency/Spelling	Incorrect spelling or capitalization	Not allowed	(required) Select span of the spelling error in the translation	(optional) Select source/target s pan which provides a clue to the error
        Fluency/Grammar	Problems with grammar, other than orthography	(optional) Select source span of the grammatical error	(required) Select span of the grammatical error in the translation	(required) Select span in the target context which provides a clue to the grammatical error.
        Fluency/Register	Wrong grammatical register (eg, inappropriately informal pronouns).	(optional) Select source span of the register error	(required) Select span of the register error in the translation	(required) Select span in the source context which provides a clue to the register error
        Fluency/Inconsistency	Translation of the same word/phrase is inconsistent across the text	Not allowed	(required) Select all the spans of inconsistent translations of the same word/phrase	(optional) Select source/target s pan which provides a clue to the error
        Style/Awkward	Translation has inappropriate language style despite being accurate and grammatical	(optional) Select source span of the style/awkward error	(required) Select span of the style error in the translation	(optional) Select source/target s pan which provides a clue to the error
        Locale convention /Address, Currency, Date, Name, Telephone, Time	Translation is in wrong format	(optional) Select source span of the locale convention error	(required) Select span of the locale convention error in the translation	(optional) Select source/target s pan which provides a clue to the error
        Source error	An error in the source. (the text is not in the expected language, is garbled, nonsensical, has spelling errors, typos, non coherent, etc.)	(required) Select source span which has source error	(optional) Select span in the translation which corresponds to the source error	(optional) Select source/target s pan which provides a clue to the error
        Other	Any other issue in the source or translation	(required) Select source span of the issue (if applicable) with a description of the issue	(required) Select target span of the issue (if applicable) with a description of the issue	(optional) Select source/target s pan which provides a clue to
        the error
        
        MISTRANSLATION
        The phrase which corresponds to the Spanish National Team in Chinese “⽃⽜军团” is translated to “the Bulls” which is a literal translation that ignores the context. This is a mistranslation error as the translation does not accurately represent the source. The annotator follows these steps to create a mistranslation error annotation:
        * The annotator selects the phrase “the Bulls” which corresponds to the error in the translation, and chooses the Mistranslation error category:
        
        * The mistranslation error category requires selecting a source span which corresponds to the error. The annotator selects the source phrase which corresponds to the translation error in the source.
        
        * The mistranslation error category requires selecting a clue span in the source which provides contextual clue to the Long-Context Human Acceptability Guidelines error. The annotator selects the clue span in the source which is a previous mention to the Spanish National Team in the previous context and checks the clue checkbox in the annotation box.
        * This error severely affects the quality of the translation. The annotator marks the error as sever by switching the severity toggle.
        
        * The annotator hits the Save button to save the annotation before creating another annotation.
        
        INCONSISTENCY
        The Chinese phrases corresponding to the “Chelsea” team is translated inconsistently, sometimes to “Chelsea” and
        sometimes to “Chelsea FC”. The annotators follows these steps to create an inconsistency error annotation:
        ● The annotators selects the word “Chelsea” in the translation and chooses the Inconsistency error category.
        
        The annotators selects “Chelsea FC” in the translation which is inconsistent with previous translation.
        
        * The translation is still understandable despite the inconsistency error so the annotator does not switch the severity toggle and hits the Save button to save the annotation
        
        GRAMMAR
        The translation has a grammatical error in the phrase “has reach” where the verb “reach” is in the wrong tense. The annotator follows these steps to create a grammar error annotation:
        * The annotator selects the verb “reach” in the translation and chooses the Grammar error category
        
        The Grammar error category requires selecting a span in the target context which provides a clue to the error. In this example the auxiliary verb “has” provides a clue to the Grammar error. The annotator selects the word “has” in the translation and marks it as a clue.
        
        The translation is still understandable despite the Grammar error so the annotator does not switch the severity toggle and hits the Save button to save the annotation
        
        `;

            checkBeforeRelaunch(acceptabilityQuizInfo);

            await sleep(7000)

            let questionTemplate = 'as usual, only reply with either A,B,C,D... of the answer and adhering strictly to the question instruction.'

            checkBeforeRelaunch(questionTemplate);

            await sleep(5000)


            let previousQuestion = ''
            await sleep(2000);
            async function examLogic() {
                async function omoCheck() {
                    return await oneformaGrammarExamPage.$eval('#webapp_frame', el => {
                        return el?.contentDocument?.documentElement.innerHTML;
                    });
                };
                let mainResult = await omoCheck();
                let $ = cheerio?.load(mainResult);

                let instruction = $('#unique_question > div.form-question.col-sm-8 > div').text() + " ";
                // let instruction = $('#unique_question > div.form-question.col-sm-8 > div > div.question_text.alert.alert-info').text() + " ";
                // let questionBody = $('#unique_question > div.form-question.col-sm-8 > div > div.position-relative > div').text();
                let questionOption = " " + $('#unique_question > div.form-elements.col-sm-4 > form > div').html();
                let sanitisedOption;
                let questionIdentifier = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']

                while (previousQuestion == instruction) {
                    await sleep(3000);
                    mainResult = await omoCheck();
                    $ = cheerio?.load(mainResult);
                    // instruction = $('#unique_question > div.form-question.col-sm-8 > div > div.question_text.alert.alert-info').text() + " ";
                    instruction = $('#unique_question > div.form-question.col-sm-8 > div').text() + " ";
                    // questionBody = $('#unique_question > div.form-question.col-sm-8 > div > div.position-relative > div').text();
                    questionOption = " " + $('#unique_question > div.form-elements.col-sm-4 > form > div').html();
                    // sanitisedOption = { field: $?.text() != undefined ? $?.text() : '' };
                };

                previousQuestion = instruction;

                if (questionOption.includes('radio') || questionOption.includes('checkbox')) {
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

                        let questionBody = wrapper.querySelectorAll('.shadow-sm');

                        for (let i = 0; i < questionBody.length; i++) {
                            let sectionArray = [];
                            let questionTag = [...wrapper.querySelectorAll('.shadow-sm')[i].children];
                            questionTag.forEach(item => {
                                sectionArray.push(item.innerText)
                            })
                            foundOptions.push(sectionArray)
                        }

                        return foundOptions;
                    }, questionOption);


                    console.log('optionsResult', optionsResult);

                    async function chillSmall(sendQuestion) {

                        for (let i = 1; i < sendQuestion.length; i++) {
                            questionInit += `${questionIdentifier[questionNum]})${sendQuestion[i]} `;
                            questionNum++
                        }

                        return (sendQuestion[0] + ': ' + questionInit);
                    }

                    let questionInit = '';
                    let questionNum = 0;
                    let rere = '';

                    await sleep(5000)



                    let answerArray = [];
                    let returnedAnswer = '';
                    for (let ti = 0; ti < optionsResult.length; ti++) {
                        let checkDoings = await chillSmall(optionsResult[ti]);

                        questionInit = '';
                        questionNum = 0;

                        if (ti == 0) {
                            returnedAnswer = await checkBeforeRelaunch(instruction + checkDoings);
                            answerArray.push(returnedAnswer)
                            // console.log(rere);
                        } else {
                            returnedAnswer = await checkBeforeRelaunch(checkDoings);
                            answerArray.push(returnedAnswer);
                            // console.log(rere);
                        }

                    }

                    await sleep(5000)

                    // let questionTemplate = {
                    //   Task: instruction,
                    //   Body: questionBody,
                    //   Options: optionsResult[0][0] + ': ' + questionInit
                    // };


                    console.log('rere', answerArray);
                    const response = await oneformaGrammarExamPage.evaluate((answerArray, optionsResult) => {
                        // console.log(optionsResult.length)

                        let rereIndex;

                        if (optionsResult.length == 1 && answerArray[0]?.includes(', ')) {
                            let newSpread = answerArray[0].split(',');

                            // console.log(newSpread)
                            for (let i = 0; i < newSpread.length; i++) {
                                if (newSpread[i]?.includes('A)') || newSpread[i]?.includes('A')) {
                                    rereIndex = 0;
                                } else if (newSpread[i]?.includes('B)') || newSpread[i]?.includes('B')) {
                                    rereIndex = 1;
                                } else if (newSpread[i]?.includes('C)') || newSpread[i]?.includes('C')) {
                                    rereIndex = 2;
                                } else if (newSpread[i]?.includes('D)') || newSpread[i]?.includes('D')) {
                                    rereIndex = 3;
                                } else if (newSpread[i]?.includes('E)') || newSpread[i]?.includes('E')) {
                                    rereIndex = 4;
                                } else if (newSpread[i]?.includes('F)') || newSpread[i]?.includes('F')) {
                                    rereIndex = 5;
                                } else if (newSpread[i]?.includes('G)') || newSpread[i]?.includes('G')) {
                                    rereIndex = 6;
                                } else if (newSpread[i]?.includes('H)') || newSpread[i]?.includes('H')) {
                                    rereIndex = 7;
                                } else if (newSpread[i]?.includes('I)') || newSpread[i]?.includes('I')) {
                                    rereIndex = 8;
                                } else if (newSpread[i]?.includes('J)') || newSpread[i]?.includes('J')) {
                                    rereIndex = 9;
                                } else if (newSpread[i]?.includes('K)') || newSpread[i]?.includes('K')) {
                                    rereIndex = 10;
                                } else if (newSpread[i]?.includes('L)') || newSpread[i]?.includes('L')) {
                                    rereIndex = 11;
                                } else if (newSpread[i]?.includes('M)') || newSpread[i]?.includes('M')) {
                                    rereIndex = 12;
                                } else if (newSpread[i]?.includes('N)') || newSpread[i]?.includes('N')) {
                                    rereIndex = 13;
                                } else if (newSpread[i]?.includes('O)') || newSpread[i]?.includes('O')) {
                                    rereIndex = 14;
                                } else if (newSpread[i]?.includes('P)') || newSpread[i]?.includes('P')) {
                                    rereIndex = 15;
                                } else if (newSpread[i]?.includes('Q)') || newSpread[i]?.includes('Q')) {
                                    rereIndex = 16;
                                };
                                [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.children[1].children[4].children[0].children[rereIndex + 1].firstElementChild.click();

                                setTimeout(() => {
                                    try {
                                        [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild.lastElementChild.click();

                                    } catch (error) {
                                        [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild.lastElementChild.click();

                                    }

                                }, 5000);
                            }
                        } else {
                            for (let i = 0; i < answerArray.length; i++) {
                                if (answerArray[i]?.includes('A)') || answerArray[i]?.includes('A')) {
                                    rereIndex = 0;
                                } else if (answerArray[i]?.includes('B)') || answerArray[i]?.includes('B')) {
                                    rereIndex = 1;
                                } else if (answerArray[i]?.includes('C)') || answerArray[i]?.includes('C')) {
                                    rereIndex = 2;
                                } else if (answerArray[i]?.includes('D)') || answerArray[i]?.includes('D')) {
                                    rereIndex = 3;
                                } else if (answerArray[i]?.includes('E)') || answerArray[i]?.includes('E')) {
                                    rereIndex = 4;
                                } else if (answerArray[i]?.includes('F)') || answerArray[i]?.includes('F')) {
                                    rereIndex = 5;
                                } else if (answerArray[i]?.includes('G)') || answerArray[i]?.includes('G')) {
                                    rereIndex = 6;
                                } else if (answerArray[i]?.includes('H)') || answerArray[i]?.includes('H')) {
                                    rereIndex = 7;
                                } else if (answerArray[i]?.includes('I)') || answerArray[i]?.includes('I')) {
                                    rereIndex = 8;
                                } else if (answerArray[i]?.includes('J)') || answerArray[i]?.includes('J')) {
                                    rereIndex = 9;
                                } else if (answerArray[i]?.includes('K)') || answerArray[i]?.includes('K')) {
                                    rereIndex = 10;
                                } else if (answerArray[i]?.includes('L)') || answerArray[i]?.includes('L')) {
                                    rereIndex = 11;
                                } else if (answerArray[i]?.includes('M)') || answerArray[i]?.includes('M')) {
                                    rereIndex = 12;
                                } else if (answerArray[i]?.includes('N)') || answerArray[i]?.includes('N')) {
                                    rereIndex = 13;
                                } else if (answerArray[i]?.includes('O)') || answerArray[i]?.includes('O')) {
                                    rereIndex = 14;
                                } else if (answerArray[i]?.includes('P)') || answerArray[i]?.includes('P')) {
                                    rereIndex = 15;
                                } else if (answerArray[i]?.includes('Q)') || answerArray[i]?.includes('Q')) {
                                    rereIndex = 16;
                                };
                                [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.children[1].children[4].children[i].children[rereIndex + 1].firstElementChild.click();

                            }

                            setTimeout(() => {
                                try {
                                    [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild.lastElementChild.click();

                                } catch (error) {
                                    [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children['unique_question'].lastElementChild.lastElementChild.lastElementChild.click();

                                }

                            }, 1000);
                        }

                    }, answerArray, optionsResult);

                    setTimeout(() => {
                        examLogic();
                    }, 10000);

                }
            };
            examLogic();
        };
    };

    async function oneformaCertificationGuidance() {
        dialog.showErrorBox('Guidance', `yooo`);

        async function checkBeforeRelaunch(question) {

            if (question) {
                const browserURL = reconnectValue.gpt;
                const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
                pageGemini = await browser.pages();
                pageChatGpt = pageGemini[pageGemini.length - 1];

                if (!sentInstruction) {
                    let instruction = 'For each question you will see a sentence in the source language and underneath an initial translation has been provided. But, this initial translation will contain one absolute/objective error that can be fixed with one edit. spot the only single error highlight and correct the single error only. Note; there is only a single error do not correct more than one word as it only contains one word error. don’t correct the sentence structure just the one objective error. return only the Revised Translation.'

                    await sleep(2000);

                    await pageChatGpt.evaluate((instruction) => {
                        document.querySelector("#prompt-textarea > p").innerText = instruction;
                    }, instruction);

                    await sleep(1000);

                    await pageChatGpt.evaluate(() => {
                        document.querySelector("#composer-background > div.flex.h-\\[44px\\].items-center.justify-between > button").click()
                    });

                    await sleep(4000);
                    sentInstruction = true;
                }

                let promptText;

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

        const browserURL = reconnectValue.oneForma;
        const browser = await puppeteer.connect({ browserURL, defaultViewport: null });

        const pages = await browser.pages();

        oneformaGrammarExamPage = pages[pages.length - 1];

        let previousQuestion = ''

        async function checkExamBody() {
            return await oneformaGrammarExamPage.evaluate(async (previousQuestion) => {
                const sleep = (milliseconds) => {
                    return new Promise((resolve) => setTimeout(resolve, milliseconds));
                }

                async function checkQuestionBody() {
                    try {
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

                await sleep(3000);
                questionBody = await checkQuestionBody();

                return questionBody;
            }, previousQuestion);
        };

        let examSubmit = await checkExamBody();

        console.log('examSubmit1', examSubmit);

        async function examLogic() {
            await sleep(2000);


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

            let rere;
            try {
                rere = await checkBeforeRelaunch(questionTemplate);
            } catch (error) {
                rere = await checkBeforeRelaunch(questionTemplate);
            }

            console.log('rere', await rere);

            const response = await oneformaGrammarExamPage.evaluate((rere) => {
                [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].lastElementChild.firstElementChild.children[1].lastElementChild.children[0].firstElementChild[3].value = rere;
                setTimeout(() => {
                    [document.querySelector('#webapp_frame').contentDocument.documentElement][0].lastElementChild.children[0].children[0].lastElementChild.firstElementChild.children[1].lastElementChild.children[0].firstElementChild[4].click();
                }, 1000);
            }, rere);

            await sleep(1000)

            setTimeout(() => {
                examLogic();
            }, 5000);
        };
        examLogic();
    };

    async function checkCases(examTitle) {
        // dialog.showErrorBox('checkcases', `${JSON.stringify(examTitle)}`);

        if (examTitle.toLowerCase().includes('grammar')) {
            // oneformaGrammarExamPage = pages[pages.length - 1];
            examsProficiency();
        } else if (examTitle.toLowerCase().includes('reading')) {
            // examsProficiencyReading();
            dialog.showErrorBox('checkcases2', `${JSON.stringify(examTitle)}`);

            reconnectReading();


        } else if (examTitle.toLowerCase().includes('guidance')) {
            // oneformaGrammarExamPage = pages[pages.length - 1];
            oneformaCertificationGuidance();
        } 
        // else if (examTitle.toLowerCase().includes('acceptability')) {
        //     // oneformaGrammarExamPage = pages[pages.length - 1];
        //     // oneformaGrammarExamPage = pages[pages.length - 1];
        //     examsAcceptability();
        // }
        else if (examTitle.toLowerCase().includes('welcome')) {
            reconnectReading();
        };
    }

    async function allExams() {

        const browserURL = reconnectValue.oneForma;
        const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
        const pages = await browser.pages();
        oneformaGrammarExamPage = pages[pages.length - 1];

        let examTitle = await oneformaGrammarExamPage.evaluate(() => {
            return document.querySelector("#page-top > div:nth-child(1) > div.row.heading-strip > div > div > div:nth-child(1)").innerText;
        });
        checkCases(examTitle);

    };
    allExams();
}

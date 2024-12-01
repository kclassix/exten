import puppeteer from "puppeteer";
import *  as chromeLauncher from "chrome-launcher";
import fs from 'fs';
import { app, dialog } from 'electron';
import UserAgent from 'user-agents';

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

let userDocument = app.getPath('documents');
let extensionPath = userDocument + '/Documents' + '/dist/extension';
const filename = userDocument + '/Documents' + '/name-proxy-email.json';
const nameProxyList = userDocument + '/Documents' + '/name-proxy.json';
console.log('nameProxyList', nameProxyList);
let newOneFormaCredential;

async function createNewEmail(registerData, gotNewData) {

    // dialog.showErrorBox('omo', `${registerData}`)

    let chromeDir = '/' + registerData[0].firstname;
    let chromeProfile = 'Person ' + registerData[0].profile;
    const chrome = await chromeLauncher.launch({
        ignoreDefaultFlags: true,
        chromeFlags: ["--disable-gpu", "--no-first-run", "--profile-directory=" + chromeProfile, "--user-data-dir=" + userDocument + '/Documents' + chromeDir, "--silent-debugger-extension-api", "--enable-extension", "--load-extension=extension", '--proxy-server=geo.iproyal.com:12321']
    });
    const browserURL = `http://localhost:${chrome.port}`;
    const browser = await puppeteer.connect({ browserURL, defaultViewport: null });

    const pages = await browser.pages();
    const page = pages[pages.length - 1];

    // await page.setRequestInterception(true);
    // page.on("request", (request) => {
    //     if (request.resourceType() === "image") {
    //         // console.log("Blocking image request: " + request.url());
    //         request.abort();
    //     } else {
    //         request.continue();
    //     }
    // });
    await page.authenticate({
        username: registerData[0].proxyUsername,
        password: registerData[0].proxyPassword

    });

    await page.goto("chrome-extension://ncbknoohfjmcfneopnfkapmkblaenokb/popup.html", {
        timeout: 0,
        waitUntil: 'networkidle2'
    });


    await page.goto('https://signup.mail.com/#.7518-header-signup1-1', {
        timeout: 0,
        waitUntil: 'networkidle2'
    });

    await page.evaluate((registerData) => {
        console.log(registerData)
    }, registerData)

    let currentTabs = pages.length;

    while (currentTabs < registerData.length) {
        let newTab = await browser.newPage()
        await newTab.goto('https://signup.mail.com/#.7518-header-signup1-1', {
            timeout: 0,
            waitUntil: 'networkidle2'
        });
        await newTab.evaluate((registerData) => {
            console.log(registerData)
        }, registerData)
        currentTabs = (await browser.pages()).length;
    }

    await sleep(3000);

    let newNo = 0
    let allPages = await browser.pages();

    while (newNo < allPages.length) {
        await allPages[newNo].bringToFront();

        await task(allPages[newNo], registerData[newNo]);

        await sleep(10000)

        newNo += 1
        // console.log(newNo)
    }

    // if (newNo == (allPages.length - 1)) {
    //     let oneFormaPage = await browser.newPage();

    //     await oneFormaPage.goto('https://my.oneforma.com/Account/register', {
    //         timeout: 0,
    //         waitUntil: 'networkidle2'
    //     })
    // }

    async function task(page, userData) {
        let genderSelect = userData.gender;

        console.log(userData)

        let lastName;
        if (userData?.lastname == undefined) {
            lastName = userData.lastName;
        } else {
            lastName = userData.lastname;
        }


        let firstName;
        if (userData?.firstname == undefined) {
            firstName = userData.firstName;
        } else {
            firstName = userData.firstname;
        }

        let year = Math.floor(Math.random() * (1999 - 1989) + 1989);
        let month = Math.floor(Math.random() * (12 - 1) + 1);
        let day = Math.floor(Math.random() * (28 - 1) + 1);

        async function getRegisteredEmail() {
            if (page.url().includes('interception-lxa.mail.com')) {
                await page.waitForSelector('#registeredEmail', { timeout: 0 });
                return await page.$eval('#registeredEmail', el => {
                    return el.innerText;
                })
                // return registeredEmail;
            } else {
                return false;
            }

        }

        const stateList = [
            "AL",
            "AK",
            "AZ",
            "AR",
            "CA",
            "CO",
            "CT",
            "DE",
            "DC",
            "FL",
            "GA",
            "HI",
            "ID",
            "IL",
            "IN",
            "IA",
            "KS",
            "KY",
            "LA",
            "ME",
            "MD",
            "MA",
            "MI",
            "MN",
            "MS",
            "MO",
            "MT",
            "NE",
            "NV",
            "NH",
            "NJ",
            "NM",
            "NY",
            "NC",
            "ND",
            "OH",
            "OK",
            "OR",
            "PA",
            "RI",
            "SC",
            "SD",
            "TN",
            "TX",
            "UT",
            "VT",
            "VA",
            "WA",
            "WV",
            "WI",
            "WY",
        ];


        async function removeDiacritics(str) {
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

        continueForm();

        async function continueForm() {

            if (genderSelect == 'female') {
                await page.click("body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > div.l-flex.l-horizontal.l-wrap.a-mb-space-1 > div > onereg-radio-wrapper:nth-child(1) > pos-input-radio > label > input");
            } else if (genderSelect == 'male') {
                await page.click("body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > div > div > onereg-radio-wrapper:nth-child(2) > pos-input-radio > label > input");
            }

            await sleep(1000);

            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > onereg-form-row:nth-child(4) > div > div:nth-child(3) > pos-input > input",
                firstName
            );
            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > onereg-form-row:nth-child(5) > div > div:nth-child(3) > pos-input > input",
                lastName
            );
            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > onereg-form-row:nth-child(7) > div > div > div > onereg-dob-wrapper > pos-input-dob > pos-input:nth-child(1) > input",
                month.toString().length == 1 ? "0" + month.toString() : month.toString()
            );
            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > onereg-form-row:nth-child(7) > div > div > div > onereg-dob-wrapper > pos-input-dob > pos-input:nth-child(2) > input",
                day.toString().length == 1 ? "0" + day.toString() : day.toString()
            );
            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > onereg-form-row:nth-child(7) > div > div > div > onereg-dob-wrapper > pos-input-dob > pos-input:nth-child(3) > input",
                year.toString()
            );
            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--password > onereg-password > fieldset > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-form-row:nth-child(4) > div > div > pos-input > input",
                "stupidmoneyBsf@"
            );
            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--password > onereg-password > fieldset > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-form-row:nth-child(6) > div > div > pos-input > input",
                "stupidmoneyBsf@"
            );
            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--password-recovery > onereg-password-recovery > fieldset > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-form-row:nth-child(4) > div > div > div > pos-input.pos-input.l-flex-1 > input",
                "2015" + Math.floor(Math.random() * (999999 - 100000 + 1))
            );
            await page.select(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > fieldset > onereg-form-row > div > div > pos-input > select",
                "US"
            );
            await page.select(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--personal-info > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-personal-info > fieldset > fieldset > onereg-form-row:nth-child(2) > div > div > pos-input > select",
                stateList[Math.floor(Math.random() * stateList.length)]
            );
            await page.select(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--password-recovery > onereg-password-recovery > fieldset > onereg-progress-meter > div.onereg-progress-meter__grow-container > onereg-form-row:nth-child(4) > div > div > div > pos-input:nth-child(1) > select",
                "27: Object"
            );

            await page.type(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--email-alias > onereg-alias > fieldset > onereg-progress-meter > div.onereg-progress-meter__grow-container > div > div.pos-form-wrapper > div > pos-input.pos-input.email-alias-input__alias-input-wrapper.l-flex-1 > input",
                await removeDiacritics(firstName.toLowerCase() + lastName.toLowerCase())
            );
            await page.click(
                "body > onereg-app > div > onereg-form > div > div > form > section > section.form__panel--email-alias > onereg-alias > fieldset > onereg-progress-meter > div.onereg-progress-meter__grow-container > div > div.pos-form-wrapper > div > button > span"
            );

            let waitToGetEmail = await getRegisteredEmail();

            console.log('waitToGetEmail111', waitToGetEmail);
            while (!waitToGetEmail) {
                await sleep(2000);
                waitToGetEmail = await getRegisteredEmail();
            };




            // return 

            let registedUser = {
                proxyUsername: userData.proxyUsername,
                proxyPassword: userData.proxyPassword,
                country: userData.proxyCountry,
                proxyState: userData.proxyState,
                gender: userData.gender,
                profile: userData.profile,
                firstname: firstName,
                lastname: lastName,
                password: 'stupidmoneyBsf@',
                emailAddress: waitToGetEmail
            };

            if (page == allPages[0]) {
                newOneFormaCredential = registedUser;
            }

            if (page == allPages[allPages.length - 1]) {
                for (let i = 1; i < allPages.length; i++) {
                    await allPages[i].close();
                }
                let oneFormaPage = await browser.newPage();

                // await oneFormaPage.setRequestInterception(true);
                // oneFormaPage.on("request", (request) => {
                //     if (request.resourceType() === "image") {
                //         // console.log("Blocking image request: " + request.url());
                //         request.abort();
                //     } else {
                //         request.continue();
                //     }
                // });

                const userAgent = new UserAgent({ deviceCategory: 'desktop' }); // You can specify the device category

                const randomUserAgent = userAgent.toString();

                await oneFormaPage.setUserAgent(randomUserAgent);

                await oneFormaPage.goto('https://my.oneforma.com/Account/register', {
                    timeout: 0,
                    waitUntil: 'networkidle2'
                })

                continueOneForma(oneFormaPage, newOneFormaCredential, gotNewData)
            }


            function modifyJsonFile(filename, newData) {
                fs.readFile(filename, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }

                    let jsonData = JSON.parse(data);
                    jsonData.push(newData);

                    fs.writeFile(filename, JSON.stringify(jsonData, null, 2), async (err) => {
                        if (err) {
                            console.error('Error writing file:', err);
                        } else {
                            console.log(newData, ' added successfully!');
                            removeNewlyAddedData(newData);
                            // gotNewData('done');
                        }
                    });
                });
            }

            async function removeNewlyAddedData(userToRemove) {

                fs.readFile(nameProxyList, 'utf8', (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return;
                    }
                    let jsonData = JSON.parse(data);

                    for (let i = 0; i < jsonData.length; i++) {
                        if (jsonData[i].firstname == userToRemove.firstname && jsonData[i].lastname == userToRemove.lastname) {
                            jsonData.splice(i, 1);

                            fs.writeFile(nameProxyList, JSON.stringify(jsonData, null, 2), async (err) => {
                                if (err) {
                                    console.error('Error writing file:', err);
                                } else {
                                    console.log(userToRemove, ' removed successfully!');
                                    gotNewData('done');

                                }
                            });
                        }
                    }
                });

            }

            modifyJsonFile(filename, registedUser);


        }
        // return (newNo + 1);
    }
}

async function continueOneForma(page, userDetails, gotNewData) {
    await page.type("#firstname", userDetails.firstname);
    await page.type("#lastname", userDetails.lastname);
    await page.type("#username", userDetails.firstname + userDetails.lastname);
    await page.type("#email", userDetails.emailAddress);
    await page.type("#passwordbox", userDetails.password);
    await page.type("#confirmpasswordbox", userDetails.password);
    await page.type("#city_of_residence", userDetails.proxyState);
    await sleep(2000);

    await page.click("#select2-country-container")
    // await page.waitForSelector('#select2-country-results')
    let countryCount = await page.evaluate((userDetails) => {
        let el = document.querySelector('#select2-country-results');
        for (let i = 0; i < el.children.length; i++) {
            // const element = array[index];
            if (el.children[i].innerText.toLowerCase() == userDetails.country.toLowerCase()) {
                return i
            }

        }
    }, userDetails);


    await sleep(1000);

    await page.click(`ul > li:nth-child(${countryCount + 1})`);

    sleep(2000);
    await page.click("#next-btn");


    async function getRegisteredEmail() {
        if (page.url().includes('Account/email_activation')) {
            // await sleep(3000);
            // return registeredEmail;
            function saveDataToNew(registedUser) {
                function modifyJsonFile(filename, newData) {
                    fs.readFile(filename, 'utf8', (err, data) => {
                        if (err) {
                            console.error('Error reading file:', err);
                            return;
                        }

                        let jsonData = JSON.parse(data);
                        jsonData.push(newData);

                        fs.writeFile(filename, JSON.stringify(jsonData, null, 2), async (err) => {
                            if (err) {
                                console.error('Error writing file:', err);
                            } else {
                                console.log(newData, ' added successfully!');
                                removeNewlyAddedData(newData);
                                // gotNewData('done');
                            }
                        });
                    });
                }

                const nameProxyList = userDocument + '/Documents' + '/name-proxy-email.json';
                const filename = userDocument + '/Documents' + '/oneformaCredentials.json';

                modifyJsonFile(filename, registedUser);

                async function removeNewlyAddedData(userToRemove) {

                    fs.readFile(nameProxyList, 'utf8', (err, data) => {
                        if (err) {
                            console.error('Error reading file:', err);
                            return;
                        }
                        let jsonData = JSON.parse(data);

                        for (let i = 0; i < jsonData.length; i++) {
                            if (jsonData[i].firstname == userToRemove.firstname && jsonData[i].lastname == userToRemove.lastname) {
                                jsonData.splice(i, 1);

                                fs.writeFile(nameProxyList, JSON.stringify(jsonData, null, 2), (err) => {
                                    if (err) {
                                        console.error('Error writing file:', err);
                                    } else {
                                        console.log(userToRemove, ' removed successfully!');
                                        gotNewData('done');
                                    }
                                });
                            }
                        }
                    });

                }
            }
            saveDataToNew(userDetails);
            return true
        } else {
            return false;
        }

    }

    let waitToGetEmail = await getRegisteredEmail();

    console.log('waitToGetEmail111', waitToGetEmail);
    while (!waitToGetEmail) {
        await sleep(2000);
        waitToGetEmail = await getRegisteredEmail();
    };

    // await sleep(2000);
    // await page.goto('https://mail.com', {
    //     timeout: 0,
    //     waitUntil: 'networkidle2'
    // })

}


export default async function extension1(userDetailsArray, createEmail, gotNewData) {
    // let userDocument = app.getPath('documents');
    if (createEmail) {
        createNewEmail(JSON.parse(userDetailsArray), gotNewData);
    } else {
        let emailListArray = JSON.parse(userDetailsArray);

        for (let i = 0; i < emailListArray.length; i++) {
            setTimeout(() => {
                // let emailListArray = JSON.parse(emailList);

                createOneFormaNormally(emailListArray[i], gotNewData);
            }, 2000 * i);
        }

        async function createOneFormaNormally(userDetails, gotNewData) {
            let chromeDir = '/' + userDetails.firstname;
            // let chromeProfile = 'Person ' + userDetails.profile;
            const chrome = await chromeLauncher.launch({
                ignoreDefaultFlags: true,
                chromeFlags: ["--no-first-run",  "--silent-debugger-extension-api", "--enable-extension", "--load-extension=extension", '--proxy-server=geo.iproyal.com:12321']

                // chromeFlags: ["--disable-gpu", "--no-first-run", "--silent-debugger-extension-api", "--enable-extension", "--load-extension=" + extensionPath, '--proxy-server=geo.iproyal.com:12321']
            });
            const browserURL = `http://localhost:${chrome.port}`;
            const browser = await puppeteer.connect({ browserURL, defaultViewport: null });

            const pages = await browser.pages();
            const pageAuth = pages[pages.length - 1];


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

            const page = await browser.newPage();

            // await page.setRequestInterception(true);
            // page.on("request", (request) => {
            //     if (request.resourceType() === "image") {
            //         // console.log("Blocking image request: " + request.url());
            //         request.abort();
            //     } else {
            //         request.continue();
            //     }
            // });

            await page.goto('https://my.oneforma.com/Account/register', {
                timeout: 300000,
                waitUntil: 'networkidle2'
            });


            await page.type("#firstname", userDetails.firstname);
            await page.type("#lastname", userDetails.lastname);
            await page.type("#username", userDetails.firstname + userDetails.lastname);
            await page.type("#email", userDetails.emailAddress);
            await page.type("#passwordbox", userDetails.password);
            await page.type("#confirmpasswordbox", userDetails.password);
            await page.type("#city_of_residence", userDetails.proxyState);
            await sleep(2000);

            await page.click("#select2-country-container")
            // await page.waitForSelector('#select2-country-results')
            let countryCount = await page.evaluate((userDetails) => {
                let el = document.querySelector('#select2-country-results');
                for (let i = 0; i < el.children.length; i++) {
                    // const element = array[index];
                    if (el.children[i].innerText.toLowerCase() == userDetails.country.toLowerCase()) {
                        return i
                    }

                }
            }, userDetails);


            await sleep(1000);

            await page.click(`ul > li:nth-child(${countryCount + 1})`);

            sleep(2000);
            await page.click("#next-btn");


            async function getRegisteredEmail() {
                if (page.url().includes('Account/email_activation')) {
                    function saveDataToNew(registedUser) {
                        function modifyJsonFile(filename, newData) {
                            fs.readFile(filename, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Error reading file:', err);
                                    return;
                                }

                                let jsonData = JSON.parse(data);
                                jsonData.push(newData);

                                fs.writeFile(filename, JSON.stringify(jsonData, null, 2), async (err) => {
                                    if (err) {
                                        console.error('Error writing file:', err);
                                    } else {
                                        console.log(newData, ' added successfully!');
                                        removeNewlyAddedData(newData);
                                        // gotNewData('done');
                                    }
                                });
                            });
                        }

                        const nameProxyList = userDocument + '/Documents' + '/name-proxy-email.json';
                        const filename = userDocument + '/Documents' + '/oneformaCredentials.json';

                        modifyJsonFile(filename, registedUser);

                        async function removeNewlyAddedData(userToRemove) {

                            fs.readFile(nameProxyList, 'utf8', (err, data) => {
                                if (err) {
                                    console.error('Error reading file:', err);
                                    return;
                                }
                                let jsonData = JSON.parse(data);

                                for (let i = 0; i < jsonData.length; i++) {
                                    if (jsonData[i].firstname == userToRemove.firstname && jsonData[i].lastname == userToRemove.lastname) {
                                        jsonData.splice(i, 1);

                                        fs.writeFile(nameProxyList, JSON.stringify(jsonData, null, 2), (err) => {
                                            if (err) {
                                                console.error('Error writing file:', err);
                                            } else {
                                                console.log(userToRemove, ' removed successfully!');
                                                gotNewData('done');
                                            }
                                        });
                                    }
                                }
                            });

                        }
                    }
                    saveDataToNew(userDetails);
                    return true
                } else {
                    return false;
                }

            }

            let waitToGetEmail = await getRegisteredEmail();

            console.log('waitToGetEmail111', waitToGetEmail);
            while (!waitToGetEmail) {
                await sleep(2000);
                waitToGetEmail = await getRegisteredEmail();
            };

            await sleep(2000);
            await page.goto('https://mail.com', {
                timeout: 0,
                waitUntil: 'networkidle2'
            })


        };
    };

};

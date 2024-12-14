import puppeteer from "puppeteer";
import *  as chromeLauncher from "chrome-launcher";
import fs from 'fs';

const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

let userDocument = '';
let filename = '';
let nameProxyList = '';

let proxyData = {
    examType: 'Reading',
    oneForma: '',
    gpt: ''
};


async function createNewEmail(registerData, gotNewData, sendReconnect) {
    const chrome = await chromeLauncher.launch({
        ignoreDefaultFlags: true,
        chromeFlags: ["--no-first-run", "--silent-debugger-extension-api", "--enable-extension", "--load-extension=extension", '--proxy-server=geo.iproyal.com:12321']
    });
    const browserURL = `http://localhost:${chrome.port}`;
    proxyData.oneForma = browserURL;
    const browser = await puppeteer.connect({ browserURL, defaultViewport: null });

    const pages = await browser.pages();
    const page = pages[pages.length - 1];
    let index = 0;


    await page.authenticate({
        username: registerData[index].proxyUsername,
        password: registerData[index].proxyPassword

    });

    await page.goto('https://signup.mail.com/#.7518-header-signup1-1', {
        timeout: 0,
        waitUntil: 'networkidle2'
    });

    let currentPage = page.url();
    console.log('currentPage', currentPage)
    console.log('user', registerData[index])


    async function changeProxy() {
        if (index < registerData.length) {
            index += 1;
        }
        console.log('user', registerData[index])

        await page.authenticate({
            username: registerData[index].proxyUsername,
            password: registerData[index].proxyPassword
        });

        // console.log(registerData[index])
        await page.goto('https://signup.mail.com/#.7518-header-signup1-1', {
            timeout: 0,
            waitUntil: 'networkidle2'
        });

        console.log('currentPage', page.url())

        return page.url();
    }

    while (currentPage.includes('support')) {

        currentPage = await changeProxy();
    };

    let currentTabs = pages.length;

    console.log('emails', registerData.length, 'tabs', currentTabs)


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
            let randomNumber = Math.floor(Math.random() * (999999 - 100000 + 1));
            if (randomNumber.toString().length != 6) {
                randomNumber = Number(randomNumber.toString() + Math.floor(Math.random() * (9 - 1)).toString());
            }

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
                "2015" + randomNumber.toString()
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

            let registedUser = {
                proxyUsername: userData.proxyUsername,
                proxyPassword: userData.proxyPassword,
                proxyCountry: userData.proxyCountry,
                proxyState: userData.proxyState,
                gender: userData.gender,
                // profile: userData.profile,
                firstname: firstName,
                lastname: lastName,
                password: 'stupidmoneyBsf@',
                emailAddress: waitToGetEmail
            };


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

            createOneFormaNormally(registedUser, gotNewData, sendReconnect)

            // continueOneForma(oneFormaPage, registedUser, gotNewData);



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
            if (el.children[i].innerText.toLowerCase() == userDetails.proxyCountry.toLowerCase()) {
                return i
            }

        }
    }, userDetails);


    await sleep(1000);

    if (!isNaN(Number(countryCount + 1))) {
        await page.click(`ul > li:nth-child(${countryCount + 1})`);

        sleep(1000);
        await page.click("#next-btn");
    } else {
        await page.keyboard.type(userDetails.proxyCountry.toLowerCase());

        await page.keyboard.press('Enter');
        sleep(1000);
        await page.click("#next-btn");
    };


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
                            }
                        });
                    });
                }

                const nameProxyList = userDocument + '/name-proxy-email.json';
                const filename = userDocument + '/oneformaCredentials.json';

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

    while (!waitToGetEmail) {
        await sleep(2000);
        waitToGetEmail = await getRegisteredEmail();
    };

    await sleep(2000);
    await page.goto("https://www.mail.com/#.7518-header-navlogin2-1", {
        waitUntil: "networkidle2",
        timeout: 0
    });
    let pageUrl = page.url();
    while (!pageUrl.includes('https://www.mail.com/#.7518-header-navlogin2-1')) {
        await page.goto("https://www.mail.com/#.7518-header-navlogin2-1", {
            waitUntil: "networkidle2",
            timeout: 0
        });
        pageUrl = page.url();
    }
    await page.type('#login-email', userDetails.emailAddress);
    await page.type('#login-password', userDetails.password);

    await sleep(1000);
    await page.click('#header-login-box > form > button');

}

async function createOneFormaNormally(userDetails, gotNewData, sendReconnect) {
    const chrome = await chromeLauncher.launch({
        ignoreDefaultFlags: true,
        chromeFlags: ["--no-first-run", "--silent-debugger-extension-api", "--enable-extension", "--load-extension=extension", '--proxy-server=geo.iproyal.com:12321']
    });
    const browserURL = `http://localhost:${chrome.port}`;
    proxyData.oneForma = browserURL;
    // sendReconnect(proxyData);
    const browser = await puppeteer.connect({ browserURL, defaultViewport: null });

    const pages = await browser.pages();
    const page = pages[pages.length - 1];

    function getUrlVars(url) {
        var hash;
        var myJson = {};
        var hashes = url.split('&');
        for (var i = 0; i < hashes.length; i++) {
          hash = hashes[i].split('=');
          myJson[hash[0]] = hash[1];
        }
        return myJson;
      };

    await page.setRequestInterception(true);
    page.on('request', interceptedRequest => {

        if (interceptedRequest.url().includes('ApplyToJobTrans.php') && interceptedRequest.method() === 'POST') {
            let posttt = interceptedRequest.postData();
            console.log(posttt)
            var params = getUrlVars(posttt);
            if (!isNaN(params.proxy) > 0 || !isNaN(proxy.fraudChance) > 0 || !isNaN(params.vpn) > 0) {

                params.proxy = 0;
                params.fraudChance = 0;
                params.vpn = 0;


                if (isNaN(params.deviceId[0])) {
                    params.deviceId = 'y' + params.deviceId.slice(1);
                } else {
                    params.deviceId = 1 + params.deviceId.slice(1);
                }

                console.log(params)

                var hashes = JSON.stringify(params).replaceAll(/:/g, "=").replaceAll(/,/g, "&").replaceAll(/"/g, "").replaceAll(/{/g, "").replaceAll(/}/g, "");

                interceptedRequest.continue({
                    postData: hashes
                });
            }
        } else {
            interceptedRequest.continue();
        }
    });

    browser.on('targetcreated', async target => {
        const newPage = await target.page();
        if (newPage) {
            await newPage.setRequestInterception(true);
            newPage.on('request', interceptedRequest => {
                if (interceptedRequest.url().includes('ApplyToJobTrans.php') && interceptedRequest.method() === 'POST') {
                    let posttt = interceptedRequest.postData();
                    console.log(posttt)
                    var params = getUrlVars(posttt);
                    if (!isNaN(params.proxy) > 0 || !isNaN(proxy.fraudChance) > 0 || !isNaN(params.vpn) > 0) {

                        params.proxy = 0;
                        params.fraudChance = 0;
                        params.vpn = 0;


                        if (isNaN(params.deviceId[0])) {
                            params.deviceId = 'y' + params.deviceId.slice(1);
                        } else {
                            params.deviceId = 1 + params.deviceId.slice(1);
                        }

                        console.log(params)

                        var hashes = JSON.stringify(params).replaceAll(/:/g, "=").replaceAll(/,/g, "&").replaceAll(/"/g, "").replaceAll(/{/g, "").replaceAll(/}/g, "");

                        interceptedRequest.continue({
                            postData: hashes
                        });
                    }
                } else {
                    interceptedRequest.continue();
                }
            });

            if (newPage.url().includes('deref-mail.com')) {
                await sleep(4000);

                let redirectResult = newPage.url();

                while (!redirectResult.includes('emailactivated=1')) {
                    await sleep(2000);
                    redirectResult = newPage.url();
                };

                initGpt(sendReconnect);

                await newPage.waitForSelector('#form-email', { timeout: 0 });
                await newPage.type("#form-email", userDetails.emailAddress);
                await newPage.type("#form-password", userDetails.password);
                await sleep(4000);
                await newPage.click("#login_btn");

                while (redirectResult.includes('emailactivated=1')) {
                await sleep(4000);
                    await newPage.click("#login_btn");
                    await sleep(3000);
                    redirectResult = newPage.url();
                };


                await page.goto('https://my.oneforma.com/UserPortal/certifications', {
                    timeout: 0,
                    waitUntil: 'networkidle2'
                });


            }
        }
    });


    await page.authenticate({
        username: userDetails.proxyUsername,
        password: userDetails.proxyPassword

    });

    await page.goto("chrome-extension://ncbknoohfjmcfneopnfkapmkblaenokb/popup.html", {
        timeout: 0,
        waitUntil: 'networkidle2'
    });

    await page.goto("https://example.com", {
        timeout: 0,
        waitUntil: 'networkidle2'
    });


    await page.goto('https://my.oneforma.com/Account/register', {
        timeout: 0,
        waitUntil: 'networkidle2'
    });

    continueOneForma(page, userDetails, gotNewData)
};

async function initGpt(sendReconnect) {
    let chromeDir = '/Gemini';
    let chromeProfile = 'Person 2';
    const chrome = await chromeLauncher.launch({
        ignoreDefaultFlags: true,
        chromeFlags: ["--no-first-run", "--disable-gpu", "--profile-directory=" + chromeProfile, "--user-data-dir=" + userDocument + chromeDir],
    });
    const browserURL = `http://localhost:${chrome.port}`;
    proxyData.gpt = browserURL;
    sendReconnect(proxyData);
    const browserGpt = await puppeteer.connect({ browserURL, defaultViewport: null });
    let pageGemini = await browserGpt.pages();
    let pageChatGpt = pageGemini[pageGemini.length - 1];

    await pageChatGpt.goto("https://chatgpt.com", {
        waitUntil: "networkidle2",
        timeout: 0
    });
}

export default async function extension1(userDetailsArray, createEmail, gotNewData, userDocumentSent, sendReconnect) {
    userDocument = userDocumentSent;
    filename = userDocument + '/name-proxy-email.json';
    nameProxyList = userDocument + '/name-proxy.json';

    if (createEmail) {
        createNewEmail(userDetailsArray, gotNewData, sendReconnect);
    } else {
        for (let i = 0; i < userDetailsArray.length; i++) {
            createOneFormaNormally(userDetailsArray[i], gotNewData);
        }
        
    };

};

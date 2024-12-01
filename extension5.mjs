import puppeteer from 'puppeteer';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import { app, dialog } from 'electron';
import decompress from "decompress";
// import { spawn } from 'child_process';


let userDocument = app.getPath('documents')  + '/Documents';

// console.log(userDocument)

let countryRandom = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(1) > label > div.relative.w-full > div > div > div > span';
let firstWaitSelector = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(4)';
let skipISPStaticSelector = 'div.\\@container > div.tp-body-s.flex.flex-col.gap-20.border-b.border-neutral-100.pb-24.sm\\:flex-row.sm\\:items-center > div > label:nth-child(2) > button';
let highEndPoolSelector = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.tp-body-s.flex.flex-col.gap-20.border-b.border-neutral-100.pb-24.sm\\:flex-row.sm\\:items-center > div > label:nth-child(1) > button';
let scrollToSelector = 'div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(1) > label > div.relative.w-full > div';
let ifCountrySelectorOccupied = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(1) > label > div.relative.w-full > div > div > div > span';
let stateAvailableSelector = "#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(2) > label > div.relative.w-full";
let stateListSelector = '#app > focus-trap > div > ul';
let stateListClick = '#app > focus-trap > div > ul > li:nth-child(';
let firstChildSelector = '#app > focus-trap > div > ul > li:nth-child(1)';
let proxyUsernameSelector = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div:nth-child(4) > label input';
let proxyPasswordSelector = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div:nth-child(5) > label input';
let protocolSelector = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(3) > label > div.relative.w-full > div > div > div > div';
let rightProtocolRotaSelector = '#app > focus-trap > div > ul > li:nth-child(2)';
let rotaProtocolSelector = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(4) > label > div.relative.w-full > div > div > div';
let countrySelectSellector = '#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(1) > label > div.relative.w-full > div';


const sleep = (milliseconds) => {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

const filename = 'file:///' + userDocument + '/name-proxy.json';

fs.access(filename, fs.constants.F_OK, (err) => {
    if (err) {
        fs.writeFile(filename, '[]', (err) => {
            if (err) {
                console.error('Error creating file:', err);
            } else {
                console.log('File created successfully!');
            }
        });
    }
});



let currentlyDownloading = false;

async function downloadExtension() {

    if (!currentlyDownloading) {
        currentlyDownloading = true;
        let chromeDir = userDocument + '/setupinit';
        let chromeProfile = 'Person 1';

        const chrome = await chromeLauncher.launch({
            ignoreDefaultFlags: true,
            chromeFlags: ['--no-first-run', '--disable-gpu', '--headless', '--profile-directory=' + chromeProfile, '--user-data-dir=' + `"C:\Users\new\AppData\Local\Google\Chrome\User Data\"`],
        });
        const browserURL = `http://localhost:${chrome.port}`;
        const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
        // const browser = await puppeteer.launch({ headless: false });
        const pages = await browser.pages();
        const page = pages[pages.length - 1];

        await page.goto(
            'https://example.com',
            { waitUntil: 'networkidle2' }
        );

        await page._client().send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: userDocument
        });

        await page.evaluate(() => {
            var zip_file_path = "https://raw.githubusercontent.com/kclassix/oneforma/refs/heads/main/extension.zip" //put inside "" your path with file.zip
            var zip_file_name = "extension1" //put inside "" file name or something
            var aFile = document.createElement("a");
            document.body.appendChild(aFile);
            aFile.style = "display: none";
            aFile.href = zip_file_path;
            aFile.download = zip_file_name;
            aFile.click();
            document.body.removeChild(aFile);
        })

        await sleep(4000);

        await browser.close();

        return true;

    } else {
        return 'extension downloading'
    }

}

async function unpackExtension() {
    return await decompress(userDocument + '/extension.zip', userDocument + '/dist')
        .then(async (files) => {
            return true
        })
        .catch((error) => {
            dialog.showErrorBox('extension', `error unpacking`)
            return false
        });
}

export default async function createProxyNName(countryList) {

    if (countryList == 'killAll') {
        await chromeLauncher.killAll();
    } else {
        // const ls = spawn('ls', [userDocument]);
        let lsExitcode;
        let foundFiles = false;
      
        initIproyal(countryList);

    }

};

let hasLaunchedGemini = false;
let pageGemini;
let pageChatGpt;
let browserGPT;
let fetchDataLength = 0;
async function getNames(country, done) {
    if (!hasLaunchedGemini) {
        // let chromeDir = './gpt';
        let chromeProfile = 'Person 2';
        let extensionPath = userDocument + '/dist/extension'
        const chrome = await chromeLauncher.launch({
            ignoreDefaultFlags: true,
            chromeFlags: ["--no-first-run", "--disable-gpu", "--profile-directory=" + chromeProfile],
        });
        const browserURL = `http://localhost:${chrome.port}`;
        browserGPT = await puppeteer.connect({ browserURL, defaultViewport: null });
        pageGemini = await browserGPT.pages();
        pageGemini = pageGemini[pageGemini.length - 1];

        hasLaunchedGemini = true;
        pageChatGpt = pageGemini;
        await pageChatGpt.goto("https://chatgpt.com", {
            waitUntil: "networkidle2",
            timeout: 0
        });
    }

    let promptText = "Generate a random firstname and lastname, native to " + country + " returning the result in {firstname: '', lastname: '', gender: ''} inside code tag. Generate unique name from the names you've generated previously and specify if the name is male or female";

    if (country) {
        await pageChatGpt.evaluate((promptText) => {
            document.querySelector("#prompt-textarea > p").innerText = promptText;
        }, promptText);

        await sleep(1000);
        await pageChatGpt.click("form > div > div > div > div > div > button");
        await sleep(2000);

        async function getData() {
            return await pageChatGpt.evaluate(async () => {
                let returnedText;

                const sleep = (milliseconds) => {
                    return new Promise((resolve) => setTimeout(resolve, milliseconds));
                }
                while (returnedText == undefined) {
                    try {
                        await sleep(6000);
                        returnedText = { text: document.querySelectorAll('code')[document.querySelectorAll('code').length - 1].innerText, length: document.querySelectorAll('code').length }
                    } catch (error) {
                        await sleep(1000);
                    }
                }
                return returnedText;
            });

        };

        let fetchData = await getData();

        while (fetchDataLength == fetchData?.length) {
            await sleep(2000);
            fetchData = await getData();
        };

        fetchDataLength = fetchData?.length;

        let foundData = fetchData.text;

        if (done) {
            await browserGPT.close();
        }

        return JSON.parse(foundData)
    }

}

async function initIproyal(countryList, gotNewData) {
    hasLaunchedGemini = false;
    getNames();
    await sleep(1000);

    let chromeDir = userDocument + '/iproyal';
    let chromeProfile = 'Person 1';
    let extensionPath = userDocument + '/dist/extension'
    const chrome = await chromeLauncher.launch({
        ignoreDefaultFlags: true,
        chromeFlags: ['--no-first-run', '--disable-gpu', '--profile-directory=' + chromeProfile, '--user-data-dir=' + chromeDir],
    });
    const browserURL = `http://localhost:${chrome.port}`;
    const browser = await puppeteer.connect({ browserURL, defaultViewport: null });
    const pages = await browser.pages();
    const page = pages[pages.length - 1];

    await page.goto('https://dashboard.iproyal.com/products/royal-residential-proxies', {
        timeout: 0,
        waitUntil: 'networkidle2'
    });

    await sleep(2000)

    async function returnBalCheck() {

        let balanceCheck;

        try {
            balanceCheck = await page.evaluate(() => {
                return document.querySelector('#app > div.dashboard-layout.grid.h-full.top-0 > header > div.tp-body-s.flex.h-64.w-full.shrink-0.items-center.justify-end.bg-neutral-0.px-24.contain-layout.sm\\:px-32 > a').innerText;
            })
        } catch (error) {
            balanceCheck = 'no'
        }

        return balanceCheck;

    }


    let reree = await returnBalCheck();
    let pageUrl = page.url()?.includes('register?redirect');
    // console.log(1)


    while (!pageUrl && !reree.includes('balance')) {
        await sleep(2000)
        pageUrl = page.url()?.includes('register?redirect');
        reree = await returnBalCheck()
        //   console.log(2)

    }


    if (page.url() != 'https://dashboard.iproyal.com/products/royal-residential-proxies') {

        await page.evaluate(() => {
            var zip_file_path = "https://dashboard.iproyal.com/login?redirect=/products/royal-residential-proxies" //put inside "" your path with file.zip
            var aFile = document.createElement("a");
            document.body.appendChild(aFile);
            aFile.style = "display: none";
            aFile.href = zip_file_path;
            aFile.click();
            document.body.removeChild(aFile);
        })

        await page.bringToFront();
        await sleep(2000);
    }


    pageUrl = page.url();

    while (pageUrl.includes('login?redirect=')) {
        await sleep(5000);
        pageUrl = page.url();
    }

    let confirmPage = page.url();

    if (!pageUrl.includes('login?redirect=') && !confirmPage.includes('royal-residential-proxies')) {
        await page.goto('https://dashboard.iproyal.com/products/royal-residential-proxies', {
            timeout: 0,
            waitUntil: 'networkidle2'
        });
    }

    // await sleep(1000);

    await page.waitForSelector(firstWaitSelector, {
        timeout: 0
    });

    // await sleep(1000);

    const targetElement = await page.$(scrollToSelector);

    await targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // await sleep(1000);

    let skipISPStatic = await page.$eval(skipISPStaticSelector, el => {
        return el.ariaChecked;
    });

    if (!skipISPStatic.includes('true')) {
        await page.click(skipISPStaticSelector)
    }

    let highEndPool = await page.$eval(highEndPoolSelector, el => {
        return el.ariaChecked;
    });

    if (!highEndPool.includes('true')) {
        await page.click(highEndPoolSelector)
    }

    await sleep(1000);
    let proxyFetch = 1;

    async function selectProxy(country, done) {

        

        await page.bringToFront();

        let randomCheck = await page.$eval("#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(1) > label > div.relative.w-full > div > div", el => {
            return el?.innerText;
        })

        if (randomCheck != 'Random') {
            await page.evaluate((countryRandom) => {
                document.querySelector(countryRandom).click();
            }, countryRandom);

            await sleep(1000)
            // await page.click('#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(1) > label > div.relative.w-full > div > div > div');
        }

        await sleep(1000);

        await page.evaluate((ifCountrySelectorOccupied) => {
            document.querySelector('#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div:nth-child(1) > label > div.relative.w-full > div').click();
        }, ifCountrySelectorOccupied);

        await sleep(2000);
        await page.keyboard.type(country, { delay: 50 });
        await sleep(1500);
        await page.waitForSelector(firstChildSelector)
        await page.click(firstChildSelector);

        let checkStateAvailable = await page.evaluate((stateAvailableSelector) => {
            return [...document.querySelector(stateAvailableSelector).classList].includes('bg-neutral-50');
        }, stateAvailableSelector)

        while (checkStateAvailable == true) {
            await sleep(2000);
            checkStateAvailable = await page.evaluate((stateAvailableSelector) => {
                return [...document.querySelector(stateAvailableSelector).classList].includes('bg-neutral-50');
            }, stateAvailableSelector)
        };

        await sleep(2000);

        await page.click(stateAvailableSelector);

        await sleep(2000);

        let stateList = await page.$eval(stateListSelector, el => el.children.length);

        if (stateList == 0) {
            stateList = 1
        }

        let chooseState = (Math.floor(Math.random() * stateList))

        await page.click(stateListClick + `${chooseState == 1 ? 2 : chooseState})`);

        await sleep(2000);

        let proxyUsername = await page.$eval(proxyUsernameSelector, el => el.value);
        let proxyPassword = await page.$eval(proxyPasswordSelector, el => el.value);
        let proxyCountry = country;
        let proxyState = await page.$eval(stateAvailableSelector, el => el.innerText);

        proxyFetch++

        if (done) {
            await page.bringToFront();
            await sleep(1000);
            await browser.close();
        }


        async function getProfile(newProfile) {

            fs.readFile(profileStore, 'utf8', async (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }
        
                let jsonData = JSON.parse(data);
                jsonData.lastProfile = newProfile;
        
                fs.writeFile(profileStore, JSON.stringify(jsonData, null, 2), async (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    }
                });
            });
        }
        
        function getDataProfile() {
            return fs.readFileSync(profileStore, 'utf8', async (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }
            })
        }
        
        let newProfile = JSON.parse(getDataProfile()).lastProfile + 1;
        
        getProfile(newProfile)
        

        return {
            proxyUsername: proxyUsername,
            proxyPassword: proxyPassword,
            proxyCountry: proxyCountry,
            proxyState: proxyState,
            profile: newProfile

        }

    }

    await sleep(1000);

    let protocol = await page.$eval(protocolSelector, el => {
        return el.innerText;
    })

    if (protocol.includes('HTTP')) {
        await page.click(protocolSelector);
        await sleep(1000);
        await page.click(rightProtocolRotaSelector);
    }

    let rotation = await page.$eval(rotaProtocolSelector, el => {
        return el.innerText;
    })

    if (rotation.includes('Randomize')) {
        await page.click(rotaProtocolSelector);
        await sleep(1000);
        await page.click(rightProtocolRotaSelector);
    }

    let ttl = await page.$eval('#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div.grid.grid-cols-1.gap-x-20.\\@md\\:col-span-2.\\@md\\:grid-cols-2 > div.grow.mt-auto > label > div.relative.w-full > div', el => {
        return el.innerText;
    })

    if (!ttl.includes('Day')) {
        await page.click("#app > div.dashboard-layout.grid.h-full.top-0 > div.row-2.relative.overflow-hidden.col-start-2 > div > div.mx-auto.flex.w-full.max-w-\\[var\\(--dash-max-content-width\\)\\].shrink-0.grow.flex-col.bg-\\[inherit\\].px-24.\\@container.sm\\:px-32 > div > div.mt-24.flex.flex-col.gap-20 > div:nth-child(5) > div.flex.flex-col.gap-20.transition-opacity > div > section:nth-child(1) > div > div.\\@container > div.mt-24.grid.grid-cols-1.items-center.gap-x-20.\\@md\\:grid-cols-2.\\@3xl\\:grid-cols-4 > div.grid.grid-cols-1.gap-x-20.\\@md\\:col-span-2.\\@md\\:grid-cols-2 > div.grow.mt-auto > label > div.relative.w-full > div");
        await sleep(1000);
        await page.click('#app > focus-trap > div > ul > li:nth-child(4)');
    }

    await sleep(1000);

    let countrySelect = await page.$eval(countrySelectSellector, el => {
        return el.innerText;
    })

    if (countrySelect != 'Random') {
        await page.evaluate((countryRandom) => {
            document.querySelector(countryRandom).click();
        }, countryRandom)
    };

    for (let i = 0; i < countryList.length; i++) {
        if (i == (countryList.length - 1)) {
            task(i, true);
        } else {
            task(i);
        }

    }

    function task(i, done) {
        setTimeout(async function () {
            let proxyDetails = await selectProxy(countryList[i], done);
            let nameDetails = await getNames(countryList[i], done);

            const wholeData = Object.assign({}, proxyDetails, nameDetails);

            async function modifyJsonFile(filename, newData) {

    // await sleep(2000)
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }
        
                let jsonData = JSON.parse(data);
                jsonData.push(newData);
        
                fs.writeFile(filename, JSON.stringify(jsonData, null, 2), (err) => {
                    if (err) {
                        console.error('Error writing file:', err);
                    } else {
                        console.log(newData, ' added successfully!');
                    }
                });
            });
        }

            modifyJsonFile(filename, wholeData);
        }, 20000 * i);
    }
}

const puppeteer = require('puppeteer');
const db = require('./database');

let scrape = async (browser, date) => {
    const page = await browser.newPage();

    await page.goto('https://www.kinopoisk.ru/top/day/' + date, {
        waitUntil: 'domcontentloaded'
    });

    const result = await page.evaluate(() => {
        let arrayOfFilms = [];

        let allFilmsInfo = document.querySelectorAll('[id^=top250_place_]');

        for (let currentFilmInfo of allFilmsInfo) {
            let place = currentFilmInfo.querySelector("a").getAttribute("name");
            let titleWithYear = currentFilmInfo.querySelector('.all').innerText;
            let rating = currentFilmInfo.querySelector('.continue').innerText;

            let title = titleWithYear.substring(0, titleWithYear.lastIndexOf(" ("));
            let year = titleWithYear.substring(
                titleWithYear.lastIndexOf("(") + 1,
                titleWithYear.lastIndexOf(")")
            );

            arrayOfFilms.push({
                place,
                title,
                year,
                rating
            });
        }

        return arrayOfFilms;
    });

    await page.close();
    return result;
};


const getInfo = async () => {
    const browser = await puppeteer.launch({headless: false}); // тут ли это должно быть?
    
    // здесь нужно добавить вычисление даты и цикл 
    let date = new Date().toISOString().substring(0,10);
    db(await scrape(browser, date), date);

    await browser.close();
}

module.exports = getInfo;
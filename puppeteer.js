const puppeteer = require("puppeteer");

const getTop500 = async() => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    // 네이버 데이터랩 페이지로 이동
    await page.goto("https://datalab.naver.com/shoppingInsight/sCategory.naver", {
        waitUntil: "networkidle2",
    });

    // 원하는 데이터가 로드될 때까지 기다림 
    await page.waitForSelector("ul.rank_top1000_list");

    let allData = []; // 전체 데이터를 저장할 리스트

    // 반복하여 다음 페이지 버튼 클릭
    let hasNextPage = true; 

    while (hasNextPage) {
        // 현재 페이지의 데이터를 추출
        const data = await page.evaluate(() => {
            const list = [];
            const items = document.querySelectorAll("ul.rank_top1000_list li");
            
            items.forEach((item) => {
                const rankRaw = item.querySelector("span.rank_top1000_num")?.innerText.trim();
                const titleRaw = item.querySelector("a.link_text")?.innerText.trim();

                const rank = rankRaw ? parseInt(rankRaw) : null;
                const title = titleRaw ? titleRaw.replace(/^\d+\n/g, "").trim() : null;

                if(rank && title) list.push({ rank, title });
            });

            // items.forEach((item, index) => {
            //     const rank = index + 1;
            //     const titleRaw = item.querySelector("a.link_text").innerText.trim();
            //     const title = titleRaw.replace(/^\d+\n/g, "").trim();
            //     list.push({ rank, title });
            // });
    
            return list;
    
        });

        allData = allData.concat(data); // 현재 페이지 데이터 추가(누적 시킴)

        // "다음 페이지"
        const nextButton = await page.$("a.btn_page_next");

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
        if(nextButton) {
            // 다음 페이지 버튼 클릭
            // await Promise.all([
            //     page.click(".btn_page_next"),
            //     page.waitForNavigation({ waitUntil: "load", timeout: 120000}),
            // ]);

            await page.click("a.btn_page_next");
            await sleep(3000);
        } else {
            // 다음 페이지 버튼 없으면 종료
            hasNextPage = false;
        }
    }

    console.log("Top 500 검색어 :", allData);
    
    await browser.close();

};

getTop500();
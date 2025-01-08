// top 20만 추출 
const puppeteer = require("puppeteer");

const getTop20 = async (keyword) => {
    const browser = await puppeteer.launch({ headless: true});
    const page = await browser.newPage();
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try{
        // 네이버 데이터랩 페이지로 이동
        await page.goto("https://datalab.naver.com/shoppingInsight/sCategory.naver", {
            waitUntil: "networkidle2", // 네트워크 요청이 끝날 때까지 대기
        });

         // 드롭다운 버튼 찾기
         console.log("드롭다운 버튼을 찾는 중...");
         await page.waitForSelector("span.select_btn", { timeout: 10000 }); // 드롭다운 버튼
         await page.click("span.select_btn"); // 드롭다운 열기

        // 카테고리 목록 가져오기
        const categoryItems = await page.$$eval("ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );

        // 드롭다운에서 키워드 찾기
        const keywordIndex = categoryItems.findIndex((item) => item.includes(keyword));
        // console.log("keykey", keywordIndex)
        if(keywordIndex === -1 ){
            console.error(`Keyword "${keyword}" not found in category list.`);
        }
        // 키워드 클릭
        console.log(`"${keyword}" 선택 중...`);
        await page.evaluate((index) => {
            const items = document.querySelectorAll("ul.select_list.scroll_cst li")[index];
            const item = items.querySelector("a.option"); 
            if(item) {
                item.click()
            } else {
                console.error("item not found");
            }
        }, keywordIndex);
        await sleep(2000); // 페이지 갱신 대기

        // 조회하기 클릭
        console.log('조회하기 클릭 중')
        await page.waitForSelector("a.btn_submit", { visible: false, timeout: 10000 });
        await page.click("a.btn_submit");

        // 원하는 데이터가 로드될 때까지 기다림
        await page.waitForSelector("ul.rank_top1000_list");

        // 데이터 추출
        const data = await page.evaluate(() => {
            const list = [];
            const items = document.querySelectorAll("ul.rank_top1000_list li");

            items.forEach((item) => {
                const rankElement = item.querySelector("span.rank_top1000_num");
                const rank = rankElement ? rankElement.innerText.trim() : ""; // rank가 없는 경우 빈 문자열
                const titleElement = item.querySelector("a.link_text");
                // 숫자와 줄바꿈 제거
                const title = titleElement ? titleElement.innerText.replace(/^\d+\n/, "").trim() : ""; // title이 없는 경우 빈 문자열
            
                if (rank && title) {
                    list.push({ rank, title }); // rank와 title이 모두 존재할 때만 추가
                }
            });

            return list;
        });

        console.log(`Top 20 검색어: for "${keyword}":`, data);

    }catch(error){
        console.error("Error", error)
    } finally{
        await browser.close();
    }
   
};

// 키워드별로 호출
(async () => {
    const keywords = ["패션잡화", "화장품/미용"];
    for (const keyword of keywords) {
        await getTop20(keyword);
    }
})();
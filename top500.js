// top 500 추출
const puppeteer = require("puppeteer");

const getTop500 = async (keyword) => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();
    // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try{

        // 네이버 데이터랩 페이지로 이동
        await page.goto("https://datalab.naver.com/shoppingInsight/sCategory.naver", {
        waitUntil: "networkidle2", // 네트워크 요청이 끝날 때까지 대기
        });

        // await sleep(5000);

        // 드롭다운 버튼 찾기
        console.log("드롭다운 버튼을 찾는 중...");
        await page.waitForSelector("span.select_btn", { visible: true, timeout: 15000 }); // 드롭다운 버튼
        await page.click("span.select_btn"); // 드롭다운 열기
        
        // 카테고리 목록 가져오기
        await page.waitForSelector("ul.select_list.scroll_cst li", { timeout: 10000});
        const categoryItems = await page.$$eval("ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );
        // console.log("xxxx", categoryItems);

        const targetCategory = keyword
        const targetIndex = categoryItems.findIndex(item => item === targetCategory);
        // console.log("zzz", targetIndex)

        if (targetIndex === -1) {
            throw new Error(`"${targetCategory}"를 찾을 수 없습니다.`);
        }

        console.log(`"${keyword}" 선택 중...`);
        await page.evaluate((index) => {
            const listItems = document.querySelectorAll("ul.select_list.scroll_cst li");
            listItems[index].querySelector("a.option").click()
        }, targetIndex);

        console.log(`"${targetCategory}"를 선택했습니다.`);


        // 조회하기 클릭
        console.log('조회하기 클릭 중')
        await page.waitForSelector("a.btn_submit", { visible: true, timeout: 10000 });
        await page.click("a.btn_submit");
        //  await sleep(2000); 


        // 원하는 데이터가 로드될 때까지 기다림
        console.log(`"${keyword}"에 대한 데이터 크롤링 시작...`);
        await page.waitForSelector("ul.rank_top1000_list");

        const allData = [];

        for ( let i = 0; i < 25; i ++) {
            console.log(`Fetching page ${i + 1}...`);
            try{
                const pageData = await page.evaluate(() => {
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
            
                allData.push(...pageData); // 각 페이지 데이터를 배열에 추가

                // 다음 페이지 버튼 클릭
                if(i < 24){
                    await page.click("a.btn_page_next");
                }

            }catch(error){
                console.error(`Error on page ${i + 1}:`, error);
                break;
            }
        }

        console.log(`Top 500 검색어 for "${keyword}":`, allData);

    } catch(error) {
        console.error("Error", error)
    } finally {
        await browser.close();
    }

};

// 키워드별로 호출
(async () => {
    await getTop500("패션잡화")
})();

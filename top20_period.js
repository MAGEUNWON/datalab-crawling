// top20, 기간 설정 파라미터 추가
const puppeteer = require("puppeteer");

// 공통함수 : 드롭다운 버튼 클릭 및 항목 선택
const selectDropdownItem = async (page, dropdownBtn, listSelector, targetText) => {
    console.log("드롭다운 버튼을 찾는 중...");
        await page.waitForSelector(dropdownBtn); // 드롭다운 버튼 선택
        await page.click(dropdownBtn); // 드롭다운 열기

    // 카테고리 목록 가져오기
    const categoryItems = await page.$$eval(listSelector, (items) => 
        items.map((item) => item.innerText.trim())
    );
    // console.log("zz", categoryItems);

    // 드롭다운에서 키워드 찾기
    const targetIndex = categoryItems.findIndex((item) => {
        const target = targetText.length === 1 ? `0${targetText}` : targetText;
        return item.toLowerCase() === target.toLowerCase();
    });
    if(targetIndex === -1 ){
        throw new Error(`${targetText} not found in category list.`);
    }

    // console.log("Xx", targetIndex);

    // 키워드 클릭
    console.log(`${targetText} 선택 중...`);
    await page.evaluate((index, selector) => {
        const items = document.querySelectorAll(selector)[index];
        const item = items.querySelector("a.option"); 

        if(item) {
            item.click()
        } else {
            console.error("item not found");
        }
    }, targetIndex, listSelector);

}

// 데이터 크롤링 함수
const crawlData = async(page) => {

    // 조회하기 클릭
    console.log('조회하기 클릭 중')
    await page.waitForSelector("a.btn_submit", { visible: false, timeout: 10000 });
    await page.click("a.btn_submit");

    // 원하는 데이터가 로드될 때까지 기다림
    await page.waitForSelector("ul.rank_top1000_list");
    const allData = [];
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

    return allData
};

// 함수 호출
(async () => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();

    try{
        // 네이버 데이터랩 페이지로 이동
        await page.goto("https://datalab.naver.com/shoppingInsight/sCategory.naver", {
            waitUntil: "networkidle2", // 네트워크 요청이 끝날 때까지 대기
        });

        const btn = {
            categorySelector : "span.select_btn",
            startYearSelector : "div.set_period_target span:nth-of-type(1) div.select.w2 span.select_btn",
            startMonthSelector : "div.set_period_target span:nth-of-type(1) div.select.w3 span.select_btn",
            starDaySelector : "div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(3) span.select_btn",
            endYearSelector : "div.set_period_target span:nth-of-type(3) div.select.w2 span.select_btn",
            endMonthSelector : "div.set_period_target span:nth-of-type(3) div.select.w3 span.select_btn",
            endDaySelector : "div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(3) span.select_btn"
        }
       
        const list = {
            categoryList : "div.set_period.category div.select ul.select_list.scroll_cst li",
            startYearList : "div.set_period_target div.select.w2 ul.select_list.scroll_cst li",
            startMonthList : "div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(2) ul.select_list.scroll_cst li",
            starDayList : "div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(3) ul.select_list.scroll_cst li",
            endYearList : "div.set_period_target span:nth-of-type(3) div.select.w2 ul.select_list.scroll_cst li",
            endMonthList : "div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(2) ul.select_list.scroll_cst li",
            endDayList : "div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(3) ul.select_list.scroll_cst li"
        }

        // 카테고리 선택
        await selectDropdownItem(
            page,
            btn.categorySelector, // 드롭다운 버튼 셀렉터
            list.categoryList,
            "패션잡화" // 선택할 텍스트
        );

        // 시작 연도 선택
        await selectDropdownItem(
            page,
            btn.startYearSelector,
            list.startYearList,
            "2025"
        );

        // 시작 월 선택
        await selectDropdownItem(
            page,
            btn.startMonthSelector,
            list.startMonthList,
            "1"
        );

        // 시작 일 선택
        await selectDropdownItem(
            page,
            btn.starDaySelector,
            list.starDayList,
            "6"
        );

        // 종료 연도 선택
        await selectDropdownItem(
            page,
            btn.endYearSelector,
            list.endYearList,
            "2025"
        );

        // 종료 월 선택
        await selectDropdownItem(
            page,
            btn.endMonthSelector,
            list.endMonthList,
            "1"
        );

        // 종료 일 선택
        await selectDropdownItem(
            page,
            btn.endDaySelector,
            list.endDayList,
            "7"
        );

        const data = await crawlData(page);
        console.log("Top 20 검색어:", data);

    } catch(error){
        console.error("Error occurred:", error);
    } finally {
        await browser.close();
    }
}) ();
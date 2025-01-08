// top20, 기간 설정 파라미터 추가
const puppeteer = require("puppeteer");

const getTop20 = async (keyword, startYear, startMonth, startDay, endYear, endMonth, endDay) => {
    const browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    const page = await browser.newPage();
    // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try{

        // 네이버 데이터랩 페이지로 이동
        await page.goto("https://datalab.naver.com/shoppingInsight/sCategory.naver", {
        waitUntil: "networkidle2", // 네트워크 요청이 끝날 때까지 대기
        });

        // 카테고리 드롭다운 버튼 찾기
        console.log("드롭다운 버튼을 찾는 중...");
        await page.waitForSelector("span.select_btn"); // 드롭다운 버튼
        await page.click("span.select_btn"); // 드롭다운 열기
        
        // 카테고리 목록 가져오기
        const categoryItems = await page.$$eval("div.set_period.category div.select ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );

        // 드롭다운에서 키워드 찾기
        const keywordIndex = categoryItems.findIndex((item) => {
            const target = keyword.length === 1 ? `0${keyword}` : keyword;
            return item.toLowerCase() === target.toLowerCase();
        });
        if(keywordIndex === -1 ){
            throw new Error(`"${keyword}" not found in category list.`);
        }

        // 키워드 클릭
        console.log(`"${keyword}" 선택 중...`);
        await page.evaluate((index) => {
            const items = document.querySelectorAll("div.set_period.category div.select ul.select_list.scroll_cst li")[index];
            const item = items.querySelector("a.option"); 

            if(item) {
                item.click()
            } else {
                console.error("item not found");
            }
        }, keywordIndex);

    
        // 년도 드롭다운 버튼 찾기
        console.log("start year 드롭다운 버튼을 찾는 중...");
        await page.waitForSelector("div.select.w2 span.select_btn"); // 드롭다운 버튼
        await page.click("div.select.w2 span.select_btn"); // 드롭다운 열기

        const startYearItems = await page.$$eval("div.set_period_target div.select.w2 ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );

        const startYearIndex = startYearItems.findIndex((item) => {
            const target = startYear.length === 1 ? `0${startYear}` : startYear;
            return item.toLowerCase() === target.toLowerCase();
        });
        if(startYearIndex === -1 ){
            throw new Error(`"${startYear}" not found in category list.`);
        }

        // 년도 클릭
        console.log("start year click")
        await page.evaluate((index) => {
            const items = document.querySelectorAll("div.set_period_target div.select.w2 ul.select_list.scroll_cst li")[index];
            const item = items.querySelector("a.option");
            
            if(item) {
                item.click()
            } else {
                console.error("item not found")
            }
        }, startYearIndex);

        
        // 월 드롭다운 버튼 찾기
        console.log("start month 드롭다운 버튼을 찾는 중...");
        await page.waitForSelector("div.set_period_target span:nth-of-type(1) div.select.w3 span.select_btn"); // 드롭다운 버튼
        await page.click("div.set_period_target span:nth-of-type(1) div.select.w3 span.select_btn"); // 드롭다운 열기

        const monthItems = await page.$$eval("div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(2) ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );

        const startMonthIndex = monthItems.findIndex((item) => {
            const target = startMonth.length === 1 ? `0${startMonth}` : startMonth;
            return item.toLowerCase() === target.toLowerCase();
        });
        if(startMonthIndex === -1 ){
            throw new Error(`"${startMonth}" not found in category list.`);
        }

        // 시작 월 클릭
        console.log("start month click")
        await page.evaluate((index) => {
            const items = document.querySelectorAll("div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(2) ul.select_list.scroll_cst li")[index];
            const item = items.querySelector("a.option");
            
            if(item) {
                item.click()
            } else {
                console.error("item not found")
            }
        }, startMonthIndex);

        // 시작 일 드롭다운 찾기
        console.log("start day 드롭다운 버튼을 찾는 중...");
        await page.waitForSelector("div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(3) span.select_btn"); // 드롭다운 버튼
        await page.click("div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(3) span.select_btn"); // 드롭다운 열기

        const dayItems = await page.$$eval("div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(3) ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );
        console.log("dayItems", dayItems)

        const startDayIndex = dayItems.findIndex((item) => {
            const target = startDay.length === 1 ? `0${startDay}` : startDay;
            return item.toLowerCase() === target.toLowerCase();
        });
        if(startDayIndex === -1 ){
            throw new Error(`"${startDay}" not found in category list.`);
        }


        // 시작 일 클릭 
        console.log("start day click")
        await page.evaluate((index) => {
            const items = document.querySelectorAll("div.set_period_target span:nth-of-type(1) div.select.w3:nth-of-type(3) ul.select_list.scroll_cst li")[index];
            const item = items.querySelector("a.option");
            
            if(item) {
                item.click()
            } else {
                console.error("item not found")
            }
        }, startDayIndex);


        // 마지막 년도 드롭다운 버튼 찾기
        console.log("end year 드롭다운 버튼을 찾는 중...");
        await page.waitForSelector("div.set_period_target span:nth-of-type(3) div.select.w2 span.select_btn"); // 드롭다운 버튼
        await page.click("div.set_period_target span:nth-of-type(3) div.select.w2 span.select_btn"); // 드롭다운 열기

        const endYearItems = await page.$$eval("div.set_period_target span:nth-of-type(3) div.select.w2 ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );
        // console.log("monthItems", monthItems)

        const endYearIndex = endYearItems.findIndex((item) => {
            const target = endYear.length === 1 ? `0${endYear}` : endYear;
            return item.toLowerCase() === target.toLowerCase();
        });
        if(endYearIndex === -1 ){
            throw new Error(`"${endYear}" not found in category list.`);
        }


        // 마지막 년도 클릭
        console.log("end year click")
        await page.evaluate((index) => {
            const items = document.querySelectorAll("div.set_period_target span:nth-of-type(3) div.select.w2 ul.select_list.scroll_cst li")[index];
            const item = items.querySelector("a.option");
            
            if(item) {
                item.click()
            } else {
                console.error("item not found")
            }
        }, endYearIndex);


        // 마지막 월 드롭다운 버튼 찾기
        console.log("start month 드롭다운 버튼을 찾는 중...");
        await page.waitForSelector("div.set_period_target span:nth-of-type(3) div.select.w3 span.select_btn"); // 드롭다운 버튼
        await page.click("div.set_period_target span:nth-of-type(3) div.select.w3 span.select_btn"); // 드롭다운 열기

        const endMonthItems = await page.$$eval("div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(2) ul.select_list.scroll_cst li", (items) => 
            items.map((item) => item.innerText.trim())
        );

        const endMonthIndex = endMonthItems.findIndex((item) => {
            const target = endMonth.length === 1 ? `0${endMonth}` : endMonth;
            return item.toLowerCase() === target.toLowerCase();
        });
        if(endMonthIndex === -1 ){
            throw new Error(`"${endMonth}" not found in category list.`);
        }

        // 마지막 월 클릭
        console.log("end month click")
        await page.evaluate((index) => {
            const items = document.querySelectorAll("div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(2) ul.select_list.scroll_cst li")[index];
            const item = items.querySelector("a.option");
            
            if(item) {
                item.click()
            } else {
                console.error("item not found")
            }
        }, endMonthIndex);

          // 마지막 일 드롭다운 찾기
          console.log("start day 드롭다운 버튼을 찾는 중...");
          await page.waitForSelector("div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(3) span.select_btn"); // 드롭다운 버튼
          await page.click("div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(3) span.select_btn"); // 드롭다운 열기
  
          const endDayItems = await page.$$eval("div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(3) ul.select_list.scroll_cst li", (items) => 
              items.map((item) => item.innerText.trim())
          );
  
          const endDayIndex = endDayItems.findIndex((item) => {
              const target = endDay.length === 1 ? `0${endDay}` : endDay;
              return item.toLowerCase() === target.toLowerCase();
          });
          if(endDayIndex === -1 ){
              throw new Error(`"${endDay}" not found in category list.`);
          }
  
  
          // 마지막 일 클릭 
          console.log("start day click")
          await page.evaluate((index) => {
              const items = document.querySelectorAll("div.set_period_target span:nth-of-type(3) div.select.w3:nth-of-type(3) ul.select_list.scroll_cst li")[index];
              const item = items.querySelector("a.option");
              
              if(item) {
                  item.click()
              } else {
                  console.error("item not found")
              }
          }, endDayIndex);

 
        // 조회하기 클릭
        console.log('조회하기 클릭 중')
        await page.waitForSelector("a.btn_submit", { visible: false, timeout: 10000 });
        await page.click("a.btn_submit");


        // 원하는 데이터가 로드될 때까지 기다림
        console.log(`"${keyword}"에 대한 데이터 크롤링 시작...`);
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

        console.log(`Top 20 검색어 for "${keyword}":`, allData);

    } catch(error) {
        console.error("Error", error)
    } finally {
        await browser.close();
    }

};

// 키워드 호출
(async () => {
    await getTop20("패션잡화", "2019", "08", "14", "2020", "6", "22")
})();
const axios = require("axios");
const cheerio = require("cheerio");

const getHTML = async() => {
    try {
        const html = await axios.get("https://datalab.naver.com/shoppingInsight/sCategory.naver");
        let ulList = [];

        const $ = cheerio.load(html.data);

        const bodyList = $("ul.rank_top1000_list");
        bodyList.map((i, element) => {
            ulList[i] = {
                rank: i + 1,
                title: $(element).find("li a.link_text").text()
            };
        });
        console.log("bodyList : ", ulList);
    } catch(error) {
        console.error(error);
    }
};

getHTML();
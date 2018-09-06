const puppeteer = require('puppeteer');
const express = require('express')
const app = express()

async function createPdf(pageUrl, type) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768});
    await page.emulateMedia('screen');
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    
    const uuidv5 = require('uuid/v5');
    const uid = uuidv5(pageUrl, uuidv5.URL)

    const pdffilename = uid+'.pdf'

    const pngfilename = uid+'.png'


    if(type == 'png') {
        await page.screenshot({
            path: 'docs/'+pngfilename,
            fullPage: true
        });
        await browser.close();
        return pngfilename
    } else {
        await page.pdf({
            path: 'docs/'+pdffilename,
            format: 'Tabloid',
            printBackground: true,
            displayHeaderFooter: true
        });
        await browser.close();
        return pdffilename
    }
}

function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
  }

app.get('/', async (req, res, next) => {

    // const urlToConvert = req.query.q;

    const queryParams = req.query;

    var url = ""
    for (var key in queryParams) {
        if (queryParams.hasOwnProperty(key)) {

            var foo = key == "url" ? "" : key+"="

            url += foo+queryParams[key] + "&"
        }
    }

    const urlToConvert = url.replace(/&\s*$/, ""); // remove "&" at the end

    console.log(urlToConvert)

    if (urlToConvert) {

        var options = {
            root: __dirname + '/docs/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        const filename = await createPdf(urlToConvert, req.query.t);
        // console.log(filename)

        res.sendFile(filename, options, function(err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', filename);
            }
        });
    } else {
        res.status(404).send("Please pass a valid url as param")
    }
})

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`))
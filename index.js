const puppeteer = require('puppeteer');
const express = require('express')
const app = express()

async function createPdf(pageUrl, type) {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();

    await page.setViewport({ width: 1366, height: 768});
    await page.emulateMedia('screen');
    await page.goto(pageUrl, { waitUntil: 'networkidle2' });
    
    await page.waitFor(1000);

    
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
            format: 'A4',
            printBackground: true,
            displayHeaderFooter: true
        });
        await browser.close();
        return pdffilename
    }
}

app.get('/', async (req, res, next) => {
    if (req.query.url) {

        var options = {
            root: __dirname + '/docs/',
            dotfiles: 'deny',
            headers: {
                'x-timestamp': Date.now(),
                'x-sent': true
            }
        };

        const filename = await createPdf(req.query.url, req.query.type);
        console.log(filename)

        res.sendFile(filename, options, function(err) {
            if (err) {
                next(err);
            } else {
                console.log('Sent:', filename);
            }
        });
    } else {
        res.status(404).send("Please pass a url as param")
    }
})

const port = process.env.PORT || 3000;
console.log(JSON.stringify(process.env.port))
app.listen(port, () => console.log(`Server running on port ${port}`))
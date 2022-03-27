const { Telegraf, Markup } = require('telegraf')

const axios = require('axios');
const cheerio = require('cheerio');

require('dotenv').config()

const text = require('./const')
const bot = new Telegraf(process.env.BOT_TOKEN)

bot.start((ctx) => ctx.reply(`Привет ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец'}!`))
bot.help((ctx) => ctx.reply(text.commands))

bot.command('exchange', async (ctx) => {
    try {
        await ctx.replyWithHTML('<strong>Курсы валют в Бресте</strong>', Markup.inlineKeyboard(
            [
                [Markup.button.callback('Курс USD', 'btn_1')],
                // [Markup.button.callback('Курс EUR', 'btn_2')],
                // [Markup.button.callback('Курс RUB', 'btn_3')]

            ]
        ))
    } catch(e) {
        console.error(e)
    }
})
bot.command('weather', async (ctx) => {
    try {
        await ctx.replyWithHTML('<strong>Погода в Бресте</strong>', Markup.inlineKeyboard(
            [
                [Markup.button.callback('Погода в Бресте', 'btn_4')]
            ]
        ))
    } catch(e) {
        console.error(e)
    }
})

bot.command('services', async (ctx) => {
    try {
        await ctx.replyWithHTML('<strong>Сервисы</strong>', Markup.inlineKeyboard(
            [
                [Markup.button.callback('Курс USD', 'btn_1'), Markup.button.callback('Курс EUR', 'btn_2'), Markup.button.callback('Курс RUB', 'btn_3')],
                [Markup.button.callback('Погода в Бресте', 'btn_4')]
            ]
        ))
    } catch(e) {
        console.error(e)
    }
})

//Курсы вылют
//переменные для ф-ции
const selectorPurchase = '#workarea > div.content_i.converter > div.bank-info-head.content_i.calc_color > div > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(2)'
const salePurchase = '#workarea > div.content_i.converter > div.bank-info-head.content_i.calc_color > div > div > div > div > table > tbody > tr:nth-child(1) > td:nth-child(3)'
//USD
const srcParsingUsd = 'https://myfin.by/currency/usd/brest'
const textUsd = 'USD'
//EUR
const srcParsingEur = 'https://myfin.by/currency/eur/brest'
const textEur = 'EUR'
//RUB
const srcParsingRub = 'https://myfin.by/currency/rub/brest'
const textRub = 'RUB'

//общая функция для валют
function addAction(btn, src, currency){
    bot.action(btn, async (ctx) => {
        try{
            await ctx.answerCbQuery()
            await axios.get(src).then(html => {
                const list = cheerio.load(html.data)
                let purchase = ''
                let sale = ''
                let rub = ''
                list(selectorPurchase).each((i, element) => {
                //курс покупки
                purchase = `${list(element).text()}`
                }) 
                list(salePurchase).each((i, element) => {
                //курс продажи
                sale = `${list(element).text()}`
                })
                //показываем курсы валют
                if(currency === 'RUB'){
                    rub = '100 '
                }
                ctx.replyWithHTML(`По данным Myfin курс ${rub}${currency}\nна сегодня в Бресте\n<b>Курс покупки ${currency}:</b> ${purchase} BYN\n<b>Курс продажи ${currency}:</b> ${sale} BYN`)
                
            })
            
        }catch (error) {
            console.log(error);
          }
    })
}
//вызываем ф-цию
addAction('btn_1', srcParsingUsd, textUsd)
addAction('btn_2', srcParsingEur, textEur)
addAction('btn_3', srcParsingRub, textRub)
//Погода
bot.action('btn_4', async (ctx) => {
    try{
        await ctx.answerCbQuery()
        //отправляем запрос
        await axios.get('https://weather.com/ru-RU/weather/hourbyhour/l/0eddc9a9504cfce4e23f4fb590a3affc5905976c6e63972792d8673546482937').then(html => {
            const list = cheerio.load(html.data)
            let temp = ''
            let condition = ''
            // ищем по селектору данные
            list('#titleIndex0 > div.DetailsSummary--temperature--1Syw3 > span').each((i, element) => {
            //temperature 
            temp = `${list(element).text()}`
            }) 
            list('#titleIndex0 > div.DetailsSummary--condition--24gQw > span').each((i, element) => {
            //condition
            condition = `${list(element).text()}`
            })

            ctx.replyWithHTML(`По данным weather.com сегодня в Бресте\n<b>${condition}</b>  ${temp}`)
            
        })
        
    }catch (error) {
        console.log(error);
      }
})

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
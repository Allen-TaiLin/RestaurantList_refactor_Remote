// require packages used in the projects
const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const handlebars = require('handlebars')
const app = express()
//const mongoose = require('mongoose')
const db = require('./config/mongoose')
const RestaurantData = require('./models/restaurant')
const port = 3000

// setting template engine
app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs' }))
app.set('view engine', 'hbs')
// setting static files
app.use(express.static('public'))
// 用 app.use 規定每一筆請求都需要透過 body-parser 進行前置處理
app.use(bodyParser.urlencoded({ extended: true }))

//自定義helper
handlebars.registerHelper('if_equal', function (job, expectedJob, options) {
  if (job === expectedJob) {
    return options.fn(this);
  }
  return options.inverse(this);
})
//設定連線字串
//mongoose.connect('mongodb://localhost/restaurant-list-refactor', { useNewUrlParser: true, useUnifiedTopology: true })
// 取得資料庫連線狀態
//const db = mongoose.connection
// 連線異常
// db.on('error', () => {
//   console.log('mongodb error!')
// })
// // 連線成功
// db.once('open', () => {
//   console.log('mongodb connected!')
// })

// routes setting
app.get('/', (req, res) => {
  RestaurantData.find() // 取出 restaurant model 裡的所有資料
    .lean() // 把 Mongoose 的 Model 物件轉換成乾淨的 JavaScript 資料陣列
    .then((restaurants) => res.render('index', { restaurants: restaurants })) // 將資料傳給 index 樣板
    .catch((error) => console.log(error)) // 錯誤處理
})

app.get('/restaurants/new', (req, res) => {
  //讀取new檔案、渲染畫面
  return res.render('new')
})

app.post('/restaurants/new', (req, res) => {
  // 從 req.body 拿出表單裡的資料
  const options = req.body
  //建立實例模型
  const restaurantAddNew = new RestaurantData({
    name: options.name,
    category: options.category,
    image: options.image,
    location: options.location,
    phone: options.phone,
    google_map: options.google_map,
    rating: options.rating,
    description: options.description,
    region: options.region
  })

  //將實例存入資料庫
  return restaurantAddNew.save()
    .then(() => res.redirect('/'))  //導向router
    .catch((error) => console.log(error))  //例外處理
})

//讀取特定資料
app.get('/restaurants/:id/detail', (req, res) => {
  //取得restaurant_id
  const id = req.params.id
  return RestaurantData.findById(id)  //從資料庫找出相關資料
    .lean()  //把資料轉成javascript物件
    .then((restaurant) => res.render('detail', { restaurant: restaurant }))  //發送至前端樣板
    .catch((error) => console.log(error))  //例外處理
})

//修改頁面
app.get('/restaurants/:id/edit', (req, res) => {
  //取得restaurant_id
  const id = req.params.id
  return RestaurantData.findById(id)  //從資料庫找出相關資料
    .lean()  //把資料轉成javascript物件
    .then((restaurant) => res.render('edit', { restaurant: restaurant }))  //發送至前端樣板
    .catch((error) => console.log(error))  //例外處理
})

//確定修改
app.post('/restaurants/:id/edit', (req, res) => {
  //取得restaurant_id
  const id = req.params.id
  // 從 req.body 拿出表單裡的資料
  const options = req.body
  return RestaurantData.findById(id)  //從資料庫找出相關資料
    .then((restaurant) => {
      //對應資料，寫入資料庫
      restaurant = Object.assign(restaurant, options)
      return restaurant.save()
    })
    .then(() => res.redirect(`/restaurants/${id}/detail`))  //導向router
    .catch((error) => console.log(error))  //例外處理
})


app.listen(port, () => {
  console.log(`Express is listening on http://localhost:${port}`)
})
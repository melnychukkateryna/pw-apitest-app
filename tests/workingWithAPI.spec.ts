import { test, expect, request } from '@playwright/test';
import tags from '../test-data/tags.json'

test.beforeEach(async({page}) => {
  await page.route('*/**/api/tags', async route => { //'https://conduit.productionready.io/api/tags'
    /*const tags = { --- using tags.json
    "tags": [
      "automation",
      "playwright",
    ]}*/
    await route.fulfill({
      body: JSON.stringify(tags)
    })
  })

  await page.goto('https://angular.realworld.how/')
  /*await page.getByText('Sign in').click()
  await page.getByRole('textbox', {name: "Email"}).fill('pwtest12@test.com')
  await page.getByRole('textbox', {name: "Password"}).fill('Welcome1!')
  await page.getByRole('button').click()*/ //removed after auth.setup
})

test('has title', async ({ page }) => {
await page.route('*/**/api/articles*', async route => {
  const response =  await route.fetch() //to complete an API call and get the response
  const responseBody = await response.json()
  responseBody.articles[0].title = "This is a MOCK test title" // response modification 
  responseBody.articles[0].description = "This is a MOCK test description" // response modification 
     
  await route.fulfill({
    body: JSON.stringify(responseBody) //fulfil the response as a desired result in the browser
    })
})

  await page.getByText('Global Feed').click() // to refresh the page
  await expect(page.locator('.navbar-brand')).toHaveText('conduit')
  await expect(page.locator('app-article-list h1').first()).toContainText('This is a MOCK test title')
  await expect(page.locator('app-article-list p').first()).toContainText('This is a MOCK test description')
});


test('delete article', async({page, request}) => {
    /*const response = await request.post('https://api.realworld.io/api/users/login', {
        data: {"user":{"email":"pwtest12@test.com","password":"Welcome1!"}}
    })
    const responseBody = await response.json()
    const accessToken = responseBody.user.token*/ //added to auth.setup and config
   
    const articleResponse = await request.post('https://api.realworld.io/api/articles/', {
        data: {"article":{"title":"This is a test title","description":"This is a test description","body":"This is a test body","tagList":[]}
        }/*,
        headers: {
            Authorization : `Token ${accessToken}` //added to auth.setup and config
        }*/
    })
    expect(articleResponse.status()).toEqual(201)

    await page.getByText('Global Feed').click()
    await page.getByText('This is a test title').click()
    await page.getByRole('button', {name: "Delete Article"}).first().click()
    await page.getByText('Global Feed').click()

    await expect(page.locator('app-article-list h1').first()).not.toContainText('This is a test title')
})

test ('create article and delete using API', async({page, request}) => {
    await page.getByText('New article').click()
    await page.getByRole('textbox', {name: 'Article Title'}).fill('Playwright is awesome')
    await page.getByRole('textbox', {name: 'What\'s this article about?'}).fill('About the Playwright')
    await page.getByRole('textbox', {name: 'Write your article (in markdown)'}).fill('Automation with Playwright')
    await page.getByRole('button', {name: 'Publish Article'}).click()
    const articleResponse = await page.waitForResponse('https://api.realworld.io/api/articles/')
    const articleResponseBody = await articleResponse.json()
    const slugId = articleResponseBody.article.slug

    await expect(page.locator('.article-page h1')).toContainText('Playwright is awesome')
    await page.getByRole('link', { name: 'Home' }).nth(1).click()
    await page.getByText('Global Feed').click()

    await expect(page.locator('app-article-list h1').first()).toContainText('Playwright is awesome')

    /*const response = await request.post('https://api.realworld.io/api/users/login', {
        data: {"user":{"email":"pwtest12@test.com","password":"Welcome1!"}}
    })
    const responseBody = await response.json()
    const accessToken = responseBody.user.token */ //added to auth.setup and config

    const deleteArticleResponse = await request.delete(`https://api.realworld.io/api/articles/${slugId}`/*, {
        headers: {
            Authorization : `Token ${accessToken}`
    }*/) //added to auth.setup and config
    expect(deleteArticleResponse.status()).toEqual(204)
})
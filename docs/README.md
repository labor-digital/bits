---
home: true
heroImage: /bits-icon.svg
actionText: Get Started →
actionLink: /guide/index.html
footer: Apache 2.0 licence | Copyright © 2021-present LABOR.digital
---

<style type="text/css">
.home .hero img {
    max-height: 150px;
}
</style>

## What it does

Data binding and reactive re-rendering of HTML is a concept that lies at the foundation of all modern javascript frameworks like, react, vue or angular. While
their component based architecture and rendering of HTML in a virtual DOM (or whatever your framework calls it) is quite convenient, it is a commitment - If you
go the framework route, you do ALL HTML in your framework - no (classic) server side rendering of HTML in PHP, Java or Node for you. (Yes, I know you CAN do
something like it, but it ain't pretty).

That's were bits come in handy. This library utilizes the web-component api to create javascript blocks/plugins/widgets on a statically rendered HTML page. Each
block or bit runs like a (web)component in your typical framework, but binds to the real/light dom instead of a virtual abstraction.

This library aims to do three things:

* Create a loose scaffold to structure the code of your javascript
* Simplify the data-binding between javascript and your dom
* Keep your head free from unbinding listeners or data when your bit/component is destroyed

::: tip Typescript

This is library is designed to be used with **typescript** and **decorators**. While you could use it without typescript, it is currently clearly not optimized to
run without it. If you like what you see, but typescript is a no-go for you, give me a shout, and we will figure something out :)

:::

## Postcardware

You're free to use this package, but if it makes it to your production environment, we highly appreciate you sending us a postcard from your hometown,
mentioning which of our package(s) you are using.

Our address is: LABOR.digital - Fischtorplatz 21 - 55116 Mainz, Germany.

We publish all received postcards on our [company website](https://labor.digital). 

<hr>

Icon made by [Freepik](https://www.freepik.com) from [www.flaticon.com](https://www.flaticon.com/)
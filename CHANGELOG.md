# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.6.0](https://github.com/labor-digital/bits/compare/v2.5.3...v2.6.0) (2022-01-25)


### Features

* allow [@reference](https://github.com/reference) selectors in complex css queries ([fa7c37b](https://github.com/labor-digital/bits/commit/fa7c37b04d198f86a8379d8d5fc27397fc5e92fe))
* install jest as testing framework ([d73a7b9](https://github.com/labor-digital/bits/commit/d73a7b9b5c8e788238aed9bf093aac6c42354569))


### Bug Fixes

* **AbstractBit:** ensure that $attr() allows null as third parameter ([ca07f3d](https://github.com/labor-digital/bits/commit/ca07f3d68e6c3ff8ad9f83f2ef088ae1b4233f5e))

### [2.5.3](https://github.com/labor-digital/bits/compare/v2.5.2...v2.5.3) (2021-12-19)


### Bug Fixes

* **Core\Binding:** ensure watchers are triggered when array values update ([8583980](https://github.com/labor-digital/bits/commit/8583980e1a7642664a200c56cfc9742e27160fbf))
* **Core\propertyAccess:** use substring instead of substr ([f590b56](https://github.com/labor-digital/bits/commit/f590b568b8e211c381f890db7a62ccd214735198))
* **Reactivity:** adjust types for new mobx version ([d1db4a7](https://github.com/labor-digital/bits/commit/d1db4a7f9f950fa2f97fe9f40b6fe472b768048f))

### [2.5.2](https://github.com/labor-digital/bits/compare/v2.5.1...v2.5.2) (2021-09-11)


### Bug Fixes

* **Bootstrap:** use "callable" type instead of invalid "function" in hook definition ([513032e](https://github.com/labor-digital/bits/commit/513032e20a036e533e05c7ae030a57dc05f9bfe2))

### [2.5.1](https://github.com/labor-digital/bits/compare/v2.5.0...v2.5.1) (2021-08-31)


### Bug Fixes

* **transitionUtil:** fix import of addClass and removeClass ([349859b](https://github.com/labor-digital/bits/commit/349859bcce7746dbb96fe9485f00021b59f30cd1))

## [2.5.0](https://github.com/labor-digital/bits/compare/v2.4.3...v2.5.0) (2021-08-30)


### Features

* **Binding:** change directive/bindable api to match bit instance ([e4396eb](https://github.com/labor-digital/bits/commit/e4396eb34be4f7010888875b83acddb81e4b2712))

### [2.4.3](https://github.com/labor-digital/bits/compare/v2.4.2...v2.4.3) (2021-08-30)


### Bug Fixes

* **Binding:** ensure IDirectiveCtor is compatible with AbstractBindable ([1407a69](https://github.com/labor-digital/bits/commit/1407a69d02d6a4632995aea3ae3845b22e827ef1))

### [2.4.2](https://github.com/labor-digital/bits/compare/v2.4.1...v2.4.2) (2021-08-30)

### [2.4.1](https://github.com/labor-digital/bits/compare/v2.4.0...v2.4.1) (2021-08-30)


### Bug Fixes

* **AbstractDirective:** use [@example](https://github.com/example) tags for doc examples ([816bdc5](https://github.com/labor-digital/bits/commit/816bdc55a2f9e541bceb03763dd914b5657ac901))

## [2.4.0](https://github.com/labor-digital/bits/compare/v2.3.0...v2.4.0) (2021-08-30)


### Features

* make directives configurable ([b338021](https://github.com/labor-digital/bits/commit/b3380217e0131a039ffd32f3231cc58d52815400))

## [2.3.0](https://github.com/labor-digital/bits/compare/v2.2.3...v2.3.0) (2021-08-29)


### Features

* **AbstractDirective:** introduce registerDataGetter() helper ([949f0a5](https://github.com/labor-digital/bits/commit/949f0a5b124b2eb43620392be84dd5b6545d353b))
* **Binder:** add reactToChangeEvent() back to binder class to fix lit-html integration ([7df2777](https://github.com/labor-digital/bits/commit/7df2777d189b789d393a9ee1c344563fc894ceb7))
* **Binder:** ensure correct invocation of bind() ([9520414](https://github.com/labor-digital/bits/commit/95204145f1906d341e30e7b7e762c22a23d99cc5))
* **Binding:** refactor bindData() to loop elements separately ([39126ae](https://github.com/labor-digital/bits/commit/39126ae967c466bfe016103b62ed6ea595a73083))
* **IfDirective:** implement transitions and "data-else" ([54e59c0](https://github.com/labor-digital/bits/commit/54e59c0edb6cd8561fa07d286b7af6655adbb5a8))
* update dependencies ([409646e](https://github.com/labor-digital/bits/commit/409646ea9fae6aa72d4cf3bfb9a8e9c7ad89695a))
* **Binder:** refactor binder to be more modular ([cf29feb](https://github.com/labor-digital/bits/commit/cf29feb19a2e226fffa5106dff13625b8bc671e8))


### Bug Fixes

* **Binder:** fix issue (no this) when destroying bindables ([f237e0a](https://github.com/labor-digital/bits/commit/f237e0a9f816c498ebf49e32f2308538f3d5637e))
* **Binder:** fix multiple binding issues after refactoring ([a1503b8](https://github.com/labor-digital/bits/commit/a1503b8b9fe2429289fa12cf68d757d1d2eb195c))
* **Binder:** streamline getAccessor() handling to avoid multiple lookups ([8e344dc](https://github.com/labor-digital/bits/commit/8e344dcfd5fdba4865ed2576d43247cc7b88879f))

### [2.2.3](https://github.com/labor-digital/bits/compare/v2.2.2...v2.2.3) (2021-08-20)


### Bug Fixes

* **tplAdapterHandlebars:** require handlebars implementation to avoid build issues without it ([0c19338](https://github.com/labor-digital/bits/commit/0c19338ffb103479c8ef2866867a4135aad5a2d4))

### [2.2.2](https://github.com/labor-digital/bits/compare/v2.2.1...v2.2.2) (2021-08-20)


### Bug Fixes

* **tplAdapterHandlebars:** import handlebars only if really needed ([524a501](https://github.com/labor-digital/bits/commit/524a5016d5df249fb97835a034f9a73c6ed2ce8c))

### [2.2.1](https://github.com/labor-digital/bits/compare/v2.2.0...v2.2.1) (2021-08-16)


### Bug Fixes

* **AbstractBit:** remove triple braces from doc blocks to avoid vuepress issues ([29c4374](https://github.com/labor-digital/bits/commit/29c4374427589898b72cbe43d375612fc8bde67c))

## [2.2.0](https://github.com/labor-digital/bits/compare/v2.1.0...v2.2.0) (2021-08-16)


### Features

* **AbstractBit:** add read support for the $attr() method ([9b99e0b](https://github.com/labor-digital/bits/commit/9b99e0b3602f7f7e59501ca12d23a240b7db6aca))
* improve template rendering integration ([791608a](https://github.com/labor-digital/bits/commit/791608aac087312385e34f3067cbe39c28f1bcc7))


### Bug Fixes

* **utils:** use di container to resolve event bus in resolveEventTarget ([1f11295](https://github.com/labor-digital/bits/commit/1f1129517b77500a32ec4becc8ea4a5156d9059c))

## [2.1.0](https://github.com/labor-digital/bits/compare/v2.0.0...v2.1.0) (2021-08-16)


### Features

* remove docs and demo from main repository ([3f79042](https://github.com/labor-digital/bits/commit/3f7904284886e5e6a0c3a7facb261eb85d25756e))


### Bug Fixes

* remove .idea and .github directories from npm bundle ([67e47a8](https://github.com/labor-digital/bits/commit/67e47a827ba27509246c35f13c663dd75ae7d1bd))

## [2.0.0](https://github.com/labor-digital/bits/compare/v1.9.1...v2.0.0) (2021-08-12)


### ⚠ BREAKING CHANGES

* Translator and LitHtml are now separate plugins that
have to be installed independently

### Features

* **Translator:** implement translator as standalone plugin ([c1af53b](https://github.com/labor-digital/bits/commit/c1af53bba171615034a198a2bef1a8b49ade7128))
* **Translator:** implement translator as standalone plugin ([a1d50bb](https://github.com/labor-digital/bits/commit/a1d50bb675c8830b59f1974e58fb6e1cc9056cb2))
* extract plugin features ([47eb5a2](https://github.com/labor-digital/bits/commit/47eb5a2e5c8154a3066f7da516d09e1aa1536e8d))
* implement plugin loader ([4bc1b24](https://github.com/labor-digital/bits/commit/4bc1b246f365f1db0499bef01afe90f2cc37b301))
* remove legacy integration with translator and litHtml ([0ca97a9](https://github.com/labor-digital/bits/commit/0ca97a9d2d5343c252bfa2c26ffe1ab499fbaa1f))
* **LitHtml:** implement lit html plugin plugin ([816cda9](https://github.com/labor-digital/bits/commit/816cda9b08952a1ac35b4a614f2cec509b0417e2))
* **Translator:** implement translator plugin ([8c46590](https://github.com/labor-digital/bits/commit/8c465902937c11ae5d1959a53a6f8d378fde843f))


### Bug Fixes

* **Binder:** check if this._proxy actually exists before destroying it ([17cd916](https://github.com/labor-digital/bits/commit/17cd91690aa62acbaed16522b30e260966829186))

## [2.0.0](https://github.com/labor-digital/bits/compare/v1.9.1...v2.0.0) (2021-08-10)


### ⚠ BREAKING CHANGES

* Translator and LitHtml are now separate plugins that
have to be installed independently

### Features

* **Translator:** implement translator as standalone plugin ([c1af53b](https://github.com/labor-digital/bits/commit/c1af53bba171615034a198a2bef1a8b49ade7128))
* **Translator:** implement translator as standalone plugin ([a1d50bb](https://github.com/labor-digital/bits/commit/a1d50bb675c8830b59f1974e58fb6e1cc9056cb2))
* extract plugin features ([47eb5a2](https://github.com/labor-digital/bits/commit/47eb5a2e5c8154a3066f7da516d09e1aa1536e8d))
* implement plugin loader ([4bc1b24](https://github.com/labor-digital/bits/commit/4bc1b246f365f1db0499bef01afe90f2cc37b301))
* remove legacy integration with translator and litHtml ([0ca97a9](https://github.com/labor-digital/bits/commit/0ca97a9d2d5343c252bfa2c26ffe1ab499fbaa1f))
* **LitHtml:** implement lit html plugin plugin ([816cda9](https://github.com/labor-digital/bits/commit/816cda9b08952a1ac35b4a614f2cec509b0417e2))
* **Translator:** implement translator plugin ([8c46590](https://github.com/labor-digital/bits/commit/8c465902937c11ae5d1959a53a6f8d378fde843f))


### Bug Fixes

* **Binder:** check if this._proxy actually exists before destroying it ([17cd916](https://github.com/labor-digital/bits/commit/17cd91690aa62acbaed16522b30e260966829186))

### [1.9.1](https://github.com/labor-digital/bits/compare/v1.9.0...v1.9.1) (2021-07-01)


### Bug Fixes

* fix issue where only the first element was resolved using $findAll ([adb3593](https://github.com/labor-digital/bits/commit/adb3593b0a59979112830b3aa4a7b34398c40032))

## [1.9.0](https://github.com/labor-digital/bits/compare/v1.8.0...v1.9.0) (2021-07-01)


### Features

* implement pivot element for $find and $findAll ([8f25066](https://github.com/labor-digital/bits/commit/8f250668c8c6ac7394ed713a387b9bec171dc543))


### Bug Fixes

* **$closest:** add dom change dependency to the closest method ([27e5476](https://github.com/labor-digital/bits/commit/27e5476a188cbb6536c9a2d4e85e745287276dfc))

## [1.8.0](https://github.com/labor-digital/bits/compare/v1.7.0...v1.8.0) (2021-07-01)


### Features

* implement $closest() helper ([748cd23](https://github.com/labor-digital/bits/commit/748cd23c5ecf88f6fb741e86e3ef03482720ac72))

## [1.7.0](https://github.com/labor-digital/bits/compare/v1.6.0...v1.7.0) (2021-06-30)


### Features

* implement dependency injection container ([b9afbfd](https://github.com/labor-digital/bits/commit/b9afbfda5ae4b8c67bd0db73b408391082eb0013))
* update dependencies ([79c98b4](https://github.com/labor-digital/bits/commit/79c98b4d0b709235e9c0d655e892ad9327eaef3e))

## [1.6.0](https://github.com/labor-digital/bits/compare/v1.5.2...v1.6.0) (2021-04-19)


### Features

* **Reactivity:** add watch options + better default value comparison ([d1399c4](https://github.com/labor-digital/bits/commit/d1399c42e5a7ea68d9852efd95bf284157f0adac))

### [1.5.2](https://github.com/labor-digital/bits/compare/v1.5.1...v1.5.2) (2021-04-15)


### Bug Fixes

* **Binding:** fully embrace async operations ([ae37b2b](https://github.com/labor-digital/bits/commit/ae37b2b643540882f7e945c85532fc4d4cc2df5f))
* **Reactivity:** run reactToDomChanged in action ([fb38c83](https://github.com/labor-digital/bits/commit/fb38c831a3dd1164b342788608c9c092d9eefd4d))

### [1.5.1](https://github.com/labor-digital/bits/compare/v1.5.0...v1.5.1) (2021-04-15)


### Bug Fixes

* **Binding:** make cross-bit value lookup async ([014d943](https://github.com/labor-digital/bits/commit/014d9439d38a5bc970b057971c6dae09d6165cd9))

## [1.5.0](https://github.com/labor-digital/bits/compare/v1.4.0...v1.5.0) (2021-04-15)


### Features

* **AbstractBit:** implement $attr() and $style() helpers ([24cd3c9](https://github.com/labor-digital/bits/commit/24cd3c9af3788a7ed9562f9ab70975a8d91edffb))
* **AbstractBit:** refine $style and $attr helpers + introduce $class helper ([f8ce58b](https://github.com/labor-digital/bits/commit/f8ce58bb1e2f7eb2e3d1f8d893696cf4417b1a08))
* **Binding:** use method instead of getter/setter in propertyAccess ([5bb6e09](https://github.com/labor-digital/bits/commit/5bb6e09e963f0d1edfe878149b79438294abd704))
* **Reactivity:** handle $find() and $findAll() as reactive dependencies ([2598f4c](https://github.com/labor-digital/bits/commit/2598f4ce721ec01d632a8c31533638360e67f293))
* implement @AutoRun and @NonAction decorators ([861d15c](https://github.com/labor-digital/bits/commit/861d15cf53fe98126771ec561be13cf04835164c))

## [1.4.0](https://github.com/labor-digital/bits/compare/v1.3.1...v1.4.0) (2021-04-14)


### Features

* **AbstractBit:** add $runInAction() shortcut for mobx ([d60d0bd](https://github.com/labor-digital/bits/commit/d60d0bdd59540322ac9105572ccacdcdeebf4caa))
* **AbstractBit:** implement $emitChange() helper ([4a83b82](https://github.com/labor-digital/bits/commit/4a83b82227935bf71f6a58b774d09097babcdada))
* **AbstractBit:** implement $off() as counterpart to $on() ([8ad35f1](https://github.com/labor-digital/bits/commit/8ad35f19a2daf6fe74eeef5cedb7bb952c704e59))


### Bug Fixes

* **AbstractBit:** make $autoRun() protected ([3f995d1](https://github.com/labor-digital/bits/commit/3f995d1a1a14e212f5060ce4d1eea497ee94e489))
* **HmrRegistry:** emit "domChange" after HMR patching ([61a9b53](https://github.com/labor-digital/bits/commit/61a9b5355016d08db46e78ca3748b56ab5b967e1))

### [1.3.1](https://github.com/labor-digital/bits/compare/v1.3.0...v1.3.1) (2021-04-13)


### Bug Fixes

* **TranslatorContext:** make sure the label path is generated correctly ([3597b6a](https://github.com/labor-digital/bits/commit/3597b6a843427c334b081be4c080841719a5482c))

## [1.3.0](https://github.com/labor-digital/bits/compare/v1.2.1...v1.3.0) (2021-04-12)


### Features

* implement extended translation and locale handling ([5033343](https://github.com/labor-digital/bits/commit/50333438755908a2860b51d373434cd48c150104))
* make translations more intuitive ([3b20700](https://github.com/labor-digital/bits/commit/3b20700351210e3a6c73c86322031170540cdaa9))
* remove translate-js library, and rewrite functionality in the core ([7bbc008](https://github.com/labor-digital/bits/commit/7bbc00867319cef8de5a407e4e552d32dd6b6c5f))
* validate translator options in the TranslatorFactory ([881fbca](https://github.com/labor-digital/bits/commit/881fbca896c3169c1838e781e46033ead2fe81fb))


### Bug Fixes

* **TranslatorFactory:** correctly resolve default key ([0b217f8](https://github.com/labor-digital/bits/commit/0b217f8ac1bd22bb534f04369f8e756263d63b93))

### [1.2.1](https://github.com/labor-digital/bits/compare/v1.2.0...v1.2.1) (2021-04-09)

## [1.2.0](https://github.com/labor-digital/bits/compare/v1.1.3...v1.2.0) (2021-04-09)


### Features

* implement hot module replacement ([e00f938](https://github.com/labor-digital/bits/commit/e00f938a04141b7198cf1d4a454c3ffc31245d71))

### [1.1.3](https://github.com/labor-digital/bits/compare/v1.1.2...v1.1.3) (2021-03-24)

### [1.1.2](https://github.com/labor-digital/bits/compare/v1.1.1...v1.1.2) (2021-03-23)

### [1.1.1](https://github.com/labor-digital/bits/compare/v1.1.0...v1.1.1) (2021-03-23)

## 1.1.0 (2021-03-19)


### Features

* **Reactivity:** listen only to known attribute mutations ([672acc9](https://github.com/labor-digital/bits/commit/672acc9a4ac757409ff49a6081cdf5bc61d66019))
* export "Watch" decorator ([3cea283](https://github.com/labor-digital/bits/commit/3cea2834c483640e59cd3591fae262321502f801))
* implement @Watch decorator and $autoRun() helper ([10db100](https://github.com/labor-digital/bits/commit/10db10038b5ff19e7e65b28fc0cc7d92bda1579a))
* streamline event interfaces ([f6b878d](https://github.com/labor-digital/bits/commit/f6b878d3dda304df1f0363b3d328acb7579ecbb7))
* unify event target/name definition ([96c0096](https://github.com/labor-digital/bits/commit/96c00966aac6aa8dc7076824410d42ad7623a822))
* **AbstractBit:** make $on and $emit signatures more intuitive ([6a352ba](https://github.com/labor-digital/bits/commit/6a352bac0d07d8a7d07883f1708e4b7670302e20))
* **AbstractBit:** splice $find(..., true) into $findAll() ([d25c332](https://github.com/labor-digital/bits/commit/d25c332b2625d40b0321cdf421ec79e3feab468a))
* implement two-way data pulling ([c004bed](https://github.com/labor-digital/bits/commit/c004bedc632fbbaa52817b2b1703e7214673b16a))
* **BitApp:** allow '' as key for nested bit definitions to define the / path ([314d7ac](https://github.com/labor-digital/bits/commit/314d7ac1af1997b4f9b66b7dfebfa9569f8dfdef))
* initial commit ([ac58604](https://github.com/labor-digital/bits/commit/ac586047857da8387ad2e5d8edb7c1bf2a6d11e7))


### Bug Fixes

* **AbstractBit:** define return type for $find ([07b7bba](https://github.com/labor-digital/bits/commit/07b7bbae6c155eedcd87c0f9ccbe493af10e5dca))
* **Binding:** only allow "prop" binding for @Property fields and not for @Data fields ([6336247](https://github.com/labor-digital/bits/commit/6336247278cb1ba68b52f7a1f99f306c68ddefe1))
* **BitDefinition:** make sure event listener provider resolves correctly ([dcb479e](https://github.com/labor-digital/bits/commit/dcb479e972525e93e96aae4043125c5cef1e1cfe))
* **Reactivity:** allow to parse "false", "off", or "0" from a property to be FALSE ([20e983d](https://github.com/labor-digital/bits/commit/20e983dd6f6ee86640e57a877a53d79ebd884f3f))
* **Reactivity:** parse "false" as false not as true /o\ ([8fe194a](https://github.com/labor-digital/bits/commit/8fe194a9113106da5c00f337cd90b76e248f3e8b))
* make sure @Watch decorator is bound correctly and "this" is set, too ([e59a38f](https://github.com/labor-digital/bits/commit/e59a38f5d59223e483f7123f38a36d1b93284c7f))
* remove unwanted node modules directory ([c0b299a](https://github.com/labor-digital/bits/commit/c0b299a11e1605388fa378508ae3d4e3b679e37a))

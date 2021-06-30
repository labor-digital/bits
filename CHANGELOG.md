# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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

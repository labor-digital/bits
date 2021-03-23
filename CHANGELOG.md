# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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

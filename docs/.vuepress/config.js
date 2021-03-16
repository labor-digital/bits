/*
 * Copyright 2021 LABOR.digital
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Last modified: 2021.03.09 at 15:25
 */

module.exports = {
    title: 'Bits - A reactive JS micro framework',
    description: 'Only a little bit inspired by vue.js',
    themeConfig: {
        nav: [
            {
                text: 'Guide',
                link: '/guide/'
            },
            {
                text: 'API',
                link: '/api/'
            },
            {
                text: 'GitHub',
                link: 'https://github.com/labor-digital/bits'
            }
        ],
        sidebar: {
            '/guide/': [
                '/guide/',
                {
                    title: 'Essentials',
                    collapsable: false,
                    sidebarDepth: 3,
                    children: [
                        'Lifecycle',
                        'Reactivity',
                        'DomAccess',
                        'ClassAndStyle',
                        'FormBinding',
                        'EventsAndProxy'
                    ]
                },
                {
                    title: 'Advanced',
                    sidebarDepth: 3,
                    collapsable: false,
                    children: [
                        'AdvancedReactivity',
                        'BitInteraction',
                        'HtmlAndTemplates',
                        'Mixins'
                    ]
                }
            ]
        }
    },
    plugins: [
        [
            'vuepress-plugin-typedoc',
            {
                entryPoints: ['../src/index.ts'],
                tsconfig: '../tsconfig.json',
                excludeInternal: true,
                excludePrivate: true,
                readme: 'none',
                out: 'api',
                hideInPageTOC: true,
                sidebar: {
                    fullNames: true,
                    parentCategory: 'API'
                }
            }
        ]
    ]
};
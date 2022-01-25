/*
 * Copyright 2022 LABOR.digital
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
 * Last modified: 2022.01.25 at 11:05
 */


import {prepareCssSelector} from '../../../../src/Core/util';

const data = [
    ['@selector', '*[data-ref="selector"]'],
    ['@selector-with-dash', '*[data-ref="selector-with-dash"]'],
    ['@selectorAsCamelCase', '*[data-ref="selectorAsCamelCase"]'],
    ['#id:not(.foo) .class @selector', '#id:not(.foo) .class *[data-ref="selector"]'],
    ['.class:@selector', '.class[data-ref="selector"]'],
    ['.class:@selector:not(.foo)', '.class[data-ref="selector"]:not(.foo)'],
    [
        '.class:@selector:not(.foo):not(@otherSelector)',
        '.class[data-ref="selector"]:not(.foo):not(*[data-ref="otherSelector"])'
    ],
    ['.class:@selector .anotherClass', '.class[data-ref="selector"] .anotherClass']
];

describe.each(data)('A processed selector', (i, o) => {
    it('with input of ' + i + ' should look like this ' + o, () => {
        expect(prepareCssSelector(i)).toBe(o);
    });
});
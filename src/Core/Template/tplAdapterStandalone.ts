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
 * Last modified: 2021.08.16 at 10:09
 */

import type {PlainObject} from '@labor-digital/helferlein';
import {forEach, getPath, htmlEncode, isEmpty, isUndefined} from '@labor-digital/helferlein';
import {setElementContent} from '../Binding/util';

export function tplAdapterStandalone(template: string, data: PlainObject): string
{
    // @deprecated but kept for backward compatibility until the next major release
    if (!isEmpty(data) && template.indexOf('data-value') !== -1) {
        const tpl = document.createElement('div');
        tpl.innerHTML = template;
        forEach(tpl.querySelectorAll('[data-value]') as any, (v: HTMLElement) => {
            const val = v.dataset.value!;
            if (!isUndefined(data[val])) {
                setElementContent(v, data[val], true);
            }
        });
        template = tpl.innerHTML;
    }
    
    return template.replace(/{{{([^{}]*?)}}}|{{([^{}]*?)}}/g, function (_, a?: string, b?: string) {
        const doHtmlEncode = a === undefined;
        const path = a || b;
        const val = getPath(data, path + '', '');
        return doHtmlEncode ? htmlEncode(val) : val;
    });
}
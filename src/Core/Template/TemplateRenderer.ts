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
 * Last modified: 2021.08.16 at 10:02
 */

import {isPlainObject, PlainObject} from '@labor-digital/helferlein';
import {tplAdapterStandalone} from './tplAdapterStandalone';
import type {ITemplateRendererAdapter} from './types';

export class TemplateRenderer
{
    
    protected _adapter: ITemplateRendererAdapter;
    
    public constructor(adapter?: ITemplateRendererAdapter)
    {
        if (!adapter) {
            adapter = tplAdapterStandalone;
        }
        this._adapter = adapter;
    }
    
    /**
     * Renders a template string using either the provided or default adapter
     *
     * @param template The template string that should be rendered
     * @param data The data to be provided to the view for being rendered
     * @param hash A unique hash to identify the template (to avoid recompilation for some engines).
     *              If omitted a fallback hash will be generated based on the template content
     * @param adapter Optional alternative adapter to use for this specific rendering process
     */
    public render(template: string, data?: PlainObject, hash?: string, adapter?: ITemplateRendererAdapter): string
    {
        return (adapter ?? this._adapter)(
            template + '',
            isPlainObject(data) ? data : {},
            hash ?? this.makeFallbackHash(template)
        );
    }
    
    /**
     * Generates a simple, insecure hash for the template if none was provided
     * @param template
     * @protected
     */
    protected makeFallbackHash(template: string): string
    {
        var h = 0, l = template.length, i = 0;
        if (l > 0) {
            while (i < l) {
                h = (h << 5) - h + template.charCodeAt(i++) | 0;
            }
        }
        return h + '';
    }
}
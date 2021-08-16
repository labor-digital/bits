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
 * Last modified: 2021.08.16 at 10:03
 */

import type {PlainObject} from '@labor-digital/helferlein';

export interface ITemplateRendererAdapter
{
    /**
     * Should render the template provided and return the resulting HTML string.
     *
     * @param template is the source code of the template tag that was requested
     * @param data is an object literal containing the view data that should be injected into the template
     * @param hash is a hash that is unique for each html `template` tag that is rendered. This allows you to efficiently compile
     */
    (template: string, data: PlainObject, hash: string): string;
}

export interface ITemplateDataProvider
{
    (): PlainObject
}
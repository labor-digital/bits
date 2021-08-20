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
 * Last modified: 2021.08.16 at 10:04
 */
import type {PlainObject} from '@labor-digital/helferlein';
import type {ITemplateRendererAdapter} from './types';

type KnownHelpers = {
    [name in BuiltinHelperName | CustomHelperName]: boolean;
};

type BuiltinHelperName =
    'helperMissing' |
    'blockHelperMissing' |
    'each' |
    'if' |
    'unless' |
    'with' |
    'log' |
    'lookup';

type CustomHelperName = string;

interface IHandlebarsCompileOptions
{
    data?: boolean;
    compat?: boolean;
    knownHelpers?: KnownHelpers;
    knownHelpersOnly?: boolean;
    noEscape?: boolean;
    strict?: boolean;
    assumeObjects?: boolean;
    preventIndent?: boolean;
    ignoreStandalone?: boolean;
    explicitPartialContext?: boolean;
}

/**
 * Adapter to use handlebars in the $tpl method
 * @param handlebars either the result require('handlebars/dist/handlebars.js');
 *                  or "Handlebars" if you use: import * as Handlebars from 'handlebars/dist/handlebars'
 *                  depending on your build setup
 * @param options additional handlebars compiler options
 */
export function tplAdapterHandlebars(
    handlebars: PlainObject,
    options?: IHandlebarsCompileOptions
): ITemplateRendererAdapter
{
    const compiled: Map<string, Function> = new Map();
    
    if (!handlebars || !handlebars.compile) throw new Error('Invalid handlebars implementation given!');
    
    return function (template: string, data: PlainObject, hash: string): string {
        if (!compiled.has(hash)) {
            compiled.set(hash, handlebars.compile(template, options ?? {}));
        }
        
        return compiled.get(hash)!(data);
    };
    
}
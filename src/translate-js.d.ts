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
 * Last modified: 2021.04.09 at 20:34
 */

declare module 'translate-js'
{
    import {PlainObject} from '@labor-digital/helferlein';
    
    declare namespace translate
    {
        export function add(phrases: PlainObject, locale?: string, keyPrefix?: string): void;
        
        export function setLocale(locale: string): void;
        
        export function getLocale(): string | undefined;
        
        export function interpolateWith(rule: RegExp): void;
        
        export function clear(): void;
        
        export function whenUndefined(key: string, locale: string): void
        
        export function setPluralizationRule(locale: string, callback: (count: number) => number): void;
        
        export function createRegistry(): typeof import('translate-js');
    }
    
    function translate(key: string, templateData?: PlainObject, options?: PlainObject): string;
    
    export = translate;
}
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
 * Last modified: 2021.08.02 at 18:54
 */
import type {PlainObject} from '@labor-digital/helferlein';
import type {Translator} from './Translator';
import type {TranslatorFactory} from './TranslatorFactory';
import {TranslatorPlugin} from './TranslatorPlugin';
import type {ITranslateOptions} from './types';

declare module '@labor-digital/bits/dist/Core/AbstractBit'
{
    interface AbstractBit
    {
        /**
         * Returns the translator instance for this bit
         * @protected
         */
        readonly $translator: Translator
        
        /**
         * Translates a single key using the loaded labels and returns the matched value.
         *
         * @param key The label key to use for translation
         * @param args An array of arguments to replace using sprintf in your label.
         * @param options Advanced translation options
         *
         * @see Translator::translate()
         */
        $t(
            key: string,
            args?: Array<string | number> | PlainObject<string | number>,
            options?: ITranslateOptions
        ): string
    }
}

declare module '@labor-digital/bits/dist/Core/Di/DiContainer'
{
    interface DiContainer
    {
        /**
         * The translator factory to generate the actual translator instances for the bit mounts
         */
        readonly translatorFactory: TranslatorFactory;
        
        /**
         * The link to the global translator
         */
        readonly translator: Translator
        
    }
}

export * from './Translator';
export * from './TranslatorFactory';
export * from './TranslatorContext';
export * from './TranslatorPlugin';
export * from './types';

export default TranslatorPlugin;
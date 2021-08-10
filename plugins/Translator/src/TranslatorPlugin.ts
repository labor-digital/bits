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

import type {AbstractBit, BitApp, DiContainer, IBitPlugin, IBitPluginExtensionInjector} from '@labor-digital/bits';
import type {PlainObject} from '@labor-digital/helferlein';
import {TranslatorFactory} from './TranslatorFactory';
import type {ITranslateOptions, ITranslatorOptions} from './types';

/**
 * @hidden
 */
export class TranslatorPlugin implements IBitPlugin
{
    protected _options: ITranslatorOptions;
    
    constructor(options?: ITranslatorOptions)
    {
        this._options = options ?? {};
    }
    
    public initialized(app: BitApp): void
    {
        app.di.setFactory('translatorFactory', () => new TranslatorFactory(this._options))
           .setFactory('translator', (di: DiContainer) => di.translatorFactory.requireGlobalTranslator());
    }
    
    public extendBits(inject: IBitPluginExtensionInjector): void
    {
        inject('t', function (
            key: string,
            args?: Array<string | number> | PlainObject<string | number>,
            options?: ITranslateOptions
        ) {
            return this.$translator.translate(key, args, options);
        });
        
        inject('translator', {
            callback: function (this: AbstractBit | any) {
                if (!this.$_translator) {
                    this.$_translator = this.$di.translatorFactory.requireTranslator(
                        this.$context.mount.el ?? document.documentElement as any
                    );
                }
                return this.$_translator;
            },
            destructor: function (this: any) {
                delete this.$_translator;
            },
            getter: true
        });
    }
}
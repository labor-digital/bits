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
 * Last modified: 2021.08.04 at 13:54
 */

import type {AbstractBit, IBitPlugin, IBitPluginExtensionInjector} from '@labor-digital/bits';
import {isString} from '@labor-digital/helferlein';
import {render} from 'lit-html';
import {ClassInfo, classMap} from 'lit-html/directives/class-map';
import {StyleInfo, styleMap} from 'lit-html/directives/style-map';
import type {IReactionDisposer} from 'mobx';
import type {ILitHtmlTemplateProvider, TLitDirectiveResult} from './types';

export class LitHtmlPlugin implements IBitPlugin
{
    /**
     * @deprecated temporary marker until the next major version of the bits library
     */
    public _bitsLegacyIdentifier = 'litHtml';
    
    public extendBits(inject: IBitPluginExtensionInjector): void
    {
        inject('html', function (
            this: AbstractBit,
            a: string | HTMLElement | ILitHtmlTemplateProvider,
            b?: ILitHtmlTemplateProvider
            ): IReactionDisposer {
                const template: ILitHtmlTemplateProvider = b ?? a as any;
                let target: string | HTMLElement | null = template === a ? this.$el : a as any;
                
                if (isString(target)) {
                    target = this.$find(target);
                }
                
                if (target !== null) {
                    return this.$context.reactivityProvider.addAutoRun(() => {
                        try {
                            render(
                                ((template as any).call(this)),
                                target as HTMLElement,
                                {eventContext: this as any}
                            );
                        } catch (e) {
                            console.log('RENDERING ERROR', e);
                        }
                    });
                }
                
                console.error('HTML rendering failed! No target found!');
                const disposer: IReactionDisposer = function () {};
                disposer.$mobx = {} as any;
                return disposer;
            }
        );
        
        // @todo remove those in the next major release, because this breaks treeshaking
        //  and bloats the package even if the directives are not needed
        inject('classMap', function (classInfo: ClassInfo): TLitDirectiveResult {
            return classMap(classInfo);
        });
        inject('styleMap', function (styleInfo: StyleInfo): TLitDirectiveResult {
            return styleMap(styleInfo);
        });
    }
    
}
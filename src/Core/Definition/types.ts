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
 * Last modified: 2021.03.14 at 17:26
 */

import type {PlainObject} from '@labor-digital/helferlein';
import type {IObservableFactory} from 'mobx';
import type {IComputedFactory} from 'mobx/dist/api/computed';
import type {IPropertyOptions} from '../../Reactivity/types';
import type {AbstractBit} from '../AbstractBit';

export interface IListenerSelectorProvider
{
    (this: AbstractBit): HTMLElement | NodeListOf<HTMLElement> | Array<HTMLElement>
}

export interface IBitStaticListenerDefinition
{
    provider: IListenerSelectorProvider
    method: string,
    events: Array<string>
}

export type TBitPropertyOptionMap = Map<string, IPropertyOptions>;
export type TBitAttributeMap = Map<string, string | any>;
export type TBitAnnotations = PlainObject<IComputedFactory | IObservableFactory>;
export type TBitListeners = Set<IBitStaticListenerDefinition>;

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
import type {IAutorunOptions, IObservableFactory} from 'mobx';
import type {IComputedFactory} from 'mobx/dist/api/computed';
import type {TCssClass, TCssStyle} from '../../Binding/types';
import type {IPropertyOptions, TWatchTarget} from '../../Reactivity/types';
import type {TEventList, TEventTarget} from '../types';

export interface IBitStaticListenerDefinition
{
    target?: TEventTarget
    deep?: boolean,
    method: string,
    events: TEventList
}

export interface IBitStaticWatcherDefinition
{
    target: TWatchTarget,
    method: string,
}

export type TBitPropertyOptionMap = Map<string, IPropertyOptions>;
export type TBitAttributeMap = Map<string, string | any>;
export type TBitAnnotations = PlainObject<IComputedFactory | IObservableFactory>;
export type TBitListeners = Set<IBitStaticListenerDefinition>;
export type TBitWatchers = Set<IBitStaticWatcherDefinition>
export type TBitAutoRunMap = Map<string, IAutorunOptions | undefined>
export type TBitNonObservable = Set<string>;

export type TBitAttrValue = string | number | boolean | TCssStyle | TCssClass | PlainObject | null
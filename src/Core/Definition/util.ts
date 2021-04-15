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
 * Last modified: 2021.03.14 at 20:18
 */

import {forEach, isFunction} from '@labor-digital/helferlein';
import {action, computed, observable} from 'mobx';
import type {TBitAnnotations, TBitNonObservable, TBitPropertyOptionMap} from './types';

/**
 * Helper to generate the observable annotations for the mobx makeObservable() function of the
 * given prototype. If neither properties nor getters are present an empty object literal will be returned
 * @param proto
 */
export function makeObservableAnnotationsFor(proto: any): TBitAnnotations
{
    const list = {};
    
    // Automatically detect the annotations for getters -> computed
    for (let method of Object.getOwnPropertyNames(proto)) {
        if (method === 'constructor') {
            continue;
        }
        
        const desc = Object.getOwnPropertyDescriptor(proto, method);
        if (desc && !!desc['get']) {
            list[method] = computed;
        } else if (isFunction(proto[method])) {
            // All other functions are converted as action
            list[method] = action;
        }
    }
    
    return list;
}

/**
 * Late binding of the properties as observable annotations
 * @param annotations
 * @param properties
 * @param nonObservable
 */
export function prepareObservableAnnotations(
    annotations: TBitAnnotations,
    properties: TBitPropertyOptionMap,
    nonObservable: TBitNonObservable
): TBitAnnotations
{
    const clone: TBitAnnotations = {...annotations};
    
    forEach(properties, (_, key) => {
        clone[key] = observable;
    });
    
    forEach(nonObservable, (key) => {
        delete clone[key];
    });
    
    return clone;
}

/**
 * Receives the observable annotations and extracts the list of all computed property names
 * @param annotations
 */
export function extractComputedProperties(annotations: TBitAnnotations): Array<string>
{
    const computedProperties: Array<string> = [];
    
    forEach(annotations, (v, k) => {
        if (v === computed) {
            computedProperties.push(k);
        }
    });
    
    return computedProperties;
}
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
 * Last modified: 2021.08.27 at 23:01
 */

import {
    forEach,
    inflectToCamelBack,
    isArray,
    isNumber,
    isPlainObject,
    isString,
    isUndefined,
    PlainObject,
    reduce
} from '@labor-digital/helferlein';
import type {AbstractBit} from '../AbstractBit';
import type {BitMountHTMLElement} from '../Mount/types';
import type {IPropertyAccessor, TCssClass, TCssStyle} from './types';

declare global
{
    interface HTMLElement
    {
        _bitOldClasses: Array<string>;
    }
}

/**
 * Helper to serialize a given value into a string.
 *
 * @param value
 */
function serializeValue(value: any): string
{
    if (isNumber(value) || isString(value)) {
        return value + '';
    }
    return JSON.stringify(value, null, 2);
}

/**
 * Helper to detect if the given value is an array, or a LegacyObservableArray if we are running
 * in a es5 environment where mobx will use a fallback observable
 * @param value
 */
function isArrayOrLOArray(value: any): value is Array<any>
{
    return isArray(value) || value && value.length;
}

/**
 * Helper to set the "class" special property on a dom element
 * @param target The element to attach the classes to
 * @param classes Either a string or an object for dynamic class calculation
 */
export function setNodeClasses(target: HTMLElement, classes: TCssClass): void
{
    if (isString(classes)) {
        const obj: PlainObject = {};
        
        forEach(classes.split(' '), c => {
            if (c !== '') {
                obj[c] = true;
            }
        });
        
        classes = obj;
    } else if (classes === null) {
        classes = {};
    }
    
    if (isPlainObject(classes)) {
        const classList = target.classList;
        const activeClasses: Array<string> = [];
        
        forEach(classes, (state, c) => {
            if (state) {
                classList.add(c);
                activeClasses.push(c);
            } else {
                classList.remove(c);
            }
        });
        
        // I want to be able to write {['my-class-' + this.property]: true},
        // therefore I have to keep track of the classes WE set last time, in order to
        // drop zombie classes. I COULD also check the current classes and remove
        // everything that does not match, but that would even remove classes that were set by the author
        if (target._bitOldClasses && target._bitOldClasses != activeClasses) {
            forEach(target._bitOldClasses, c => {
                if (activeClasses.indexOf(c) === -1) {
                    classList.remove(c);
                }
            });
        }
        
        target._bitOldClasses = activeClasses;
        
        return;
    }
}

/**
 * Helper to set the "style" special property on a dom element
 *
 * @param target The element to attach the styles to
 * @param styles Either a normal, inline css style string, or a object representation of the styles
 */
export function setNodeStyle(target: HTMLElement, styles: TCssStyle): void
{
    if (isString(styles)) {
        const obj: PlainObject = {};
        forEach(styles.split(';'), pair => {
            const p = pair.split(':');
            
            if (p.length !== 2) {
                return;
            }
            
            obj[inflectToCamelBack(p[0].trim())] = p[1].trim();
        });
        styles = obj;
    }
    
    // @todo does this make sense? We could just ignore it
    // because using it like this we even remove classes that were set in the template?
    if (styles === null) {
        target.removeAttribute('style');
        return;
    }
    
    forEach(styles as any, (v, k) => {
        target.style[k] = v ?? '';
    });
}

/**
 * Helper to set the given value as content of a specific dom node
 *
 * @param target The dom node to set the value for
 * @param value The value to set as content of the element
 * @param escape If true, the value will be html encoded, if false is set, not.
 */
export function setElementContent(target: HTMLElement, value: any, escape: boolean): void
{
    value = serializeValue(value);
    
    if (escape) {
        target.innerText = value;
    } else {
        target.innerHTML = value;
    }
}

interface ISplitMapPair
{
    target: string,
    source: string
}

/**
 * Helper to break up a mapping string into an array of mapping objects.
 * A map looks like: "target:source" or, if you have multiple mappings inside a single string,
 * like: "target:source,attribute:property".
 *
 * The result will be an array containing parsed objects like:
 * [{target: 'target', source: 'source'}, {target: 'attribute', source: 'property'}]
 *
 * @param map
 * @param allowEmptySource If set to true there needs to be no ":" to create a pair.
 */
export function splitMapString(map: string, allowEmptySource?: boolean): Array<ISplitMapPair>
{
    const result: Array<ISplitMapPair> = [];
    
    forEach(map.split(','), (pair, k) => {
        
        const p = pair.split(':');
        if (p.length !== 2) {
            if (allowEmptySource && p.length === 1) {
                p.push('');
            } else {
                console.error(
                    'Invalid map pair: "' + pair + '", at position: ' + k + ' in given map: "' + map + '"! '
                    + 'A pair must look like: "target:source" / "attribute:property", with multiple pairs separated by ",".');
            }
        }
        
        result.push({target: p[0].trim(), source: p[1].trim()});
    });
    
    return result;
}

/**
 * Returns true if the given target is a bit mount element
 * @param target
 */
export function isBitMount(target: HTMLElement): target is BitMountHTMLElement
{
    return target && !isUndefined((target as any)._bitMount);
}

/**
 * Runs the provided callback either directly (if the bit already exists)
 * or as soon as it is created as a mount
 * @param target
 * @param callback
 */
export async function runOnBitOrWaitForLoad(
    target: BitMountHTMLElement,
    callback: (bit: AbstractBit | any) => void
): Promise<any>
{
    if (!isBitMount(target)) {
        throw new Error('Provided target is not a valid bit mount!');
    }
    
    if (target.bit) {
        return callback(target.bit);
    } else {
        if (!isArray(target._bitOnLoadQueue)) {
            target._bitOnLoadQueue = [];
        }
        
        target._bitOnLoadQueue.push(callback);
    }
}

/**
 * Helper to set a given value to a specific attribute to a dom node
 *
 * @param target The dom node to set the attribute for
 * @param attribute The name of the attribute to set
 * @param value The value to set for the attribute
 * @param ignoreBitMounts If set to TRUE, the special handling for bit-mounts will be ignored.
 */
export function setElementAttribute(target: HTMLElement, attribute: string, value: any, ignoreBitMounts?: boolean): void
{
    switch (attribute) {
        case 'class':
            return setNodeClasses(target, value);
        case 'style':
            return setNodeStyle(target, value);
    }
    
    if (!ignoreBitMounts && isBitMount(target)) {
        runOnBitOrWaitForLoad(target, bit => bit.$context.binder.setForeignProperty(attribute, value, false));
        return;
    }
    
    if (target.getAttribute(attribute) === value) {
        return;
    }
    
    if (value === null || value === '') {
        target.removeAttribute(attribute);
    } else {
        target.setAttribute(attribute, serializeValue(value));
    }
}

/**
 * Helper to extract the value of a html node for a two-way binding
 * @param target
 * @param prop
 */
export async function getElementValue(target: HTMLElement, prop?: IPropertyAccessor): Promise<any>
{
    if (isBitMount(target)) {
        return runOnBitOrWaitForLoad(target, bit => bit.$context.binder.getForeignProperty('value'));
    }
    
    if (target.tagName === 'INPUT') {
        const el: HTMLInputElement = target as any;
        if (el.type === 'radio') {
            return el.checked ? el.value : '';
        }
        
        if (el.type === 'checkbox') {
            const val = prop ? prop.get() : [];
            
            if (!isArrayOrLOArray(val)) {
                return el.checked ? [el.value] : [];
            }
            
            if (el.checked && val.indexOf(el.value) === -1) {
                return [...val, el.value];
            }
            
            if (!el.checked && val.indexOf(el.value) !== -1) {
                return val.filter(v => v !== el.value);
            }
            
            return val;
        }
        
    }
    
    if (target.tagName === 'SELECT') {
        const el: HTMLSelectElement = target as any;
        
        if (el.multiple) {
            return reduce(el.options as any, (v, option: HTMLOptionElement) => {
                if (option.selected) {
                    v.push(option.value);
                }
                return v;
            }, []);
        }
    }
    
    if (!isUndefined((target as any).value)) {
        return (target as any).value;
    }
    
    throw new Error('Failed to read element value on unknown node: ' + target);
}

/**
 * Helper to set a value to a html node for a two-way binding
 * @param target
 * @param value
 */
export function setElementValue(target: HTMLElement, value: any): void
{
    if (isBitMount(target)) {
        runOnBitOrWaitForLoad(target, bit => bit.$context.binder.setForeignProperty('value', value, true));
        return;
    }
    
    if (target.tagName === 'INPUT') {
        const el: HTMLInputElement = target as any;
        if (el.type === 'radio') {
            el.checked = el.value === value;
            return;
        }
        
        if (el.type === 'checkbox') {
            if (!isArrayOrLOArray(value)) {
                el.checked = false;
                return;
            }
            
            el.checked = value.indexOf(el.value) !== -1;
            return;
        }
    }
    
    if (target.tagName === 'SELECT') {
        const el: HTMLSelectElement = target as any;
        
        if (el.multiple) {
            value = isArrayOrLOArray(value) ? value : [];
            forEach(el.options, option => {
                option.selected = value.indexOf(option.value) !== -1;
            });
            return;
        }
    }
    
    if (!isUndefined((target as any).value)) {
        // value !== null ? ... is a fix for IE, because otherwise textareas would show "null" as a text
        (target as any).value = value !== null ? value : '';
        return;
    }
    
    throw new Error('Failed to set element value on unknown node: ' + target);
}
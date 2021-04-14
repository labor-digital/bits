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
 * Last modified: 2021.03.16 at 18:07
 */

import {
    asArray,
    closest,
    ComponentProxy,
    ComponentProxyEventTarget,
    forEach,
    isArray,
    isFunction,
    isNumber,
    isString,
    isUndefined
} from '@labor-digital/helferlein';
import type {AbstractBit} from './AbstractBit';
import type {BitMountHTMLElement} from './Mount/types';
import type {IEventListener, TEventList, TEventTarget} from './types';

/**
 * Internal helper to resolve the "find" request inside a single mount
 * @param mount The mount element to resolve the request in
 * @param selector any query selector to find your element with. As a "magic" helper you can provide "@my-ref"
 * that will be converted into '*[data-ref="my-ref"]' internally before the query is resolved.
 * @param multiple By default only a single element is returned "querySelector", if set to true "querySelectorAll"
 * is used instead.
 * @param deep By default only elements inside the current mount are resolved, but children
 * are ignored while retrieving elements. If you set this to true, even elements in child-mounts are returned
 * @internal
 */
export function findElement(
    mount: BitMountHTMLElement,
    selector: string,
    multiple: boolean,
    deep?: boolean
): Array<HTMLElement>
{
    
    if (selector.substr(0, 1) === '@') {
        selector = '*[data-ref="' + selector.substr(1) + '"]';
    }
    
    const mountTag = mount.tagName;
    const list: NodeListOf<HTMLElement> = mount.querySelectorAll(selector);
    
    // We need to check if an element is currently inside this elements root in order
    // to simulate the behaviour of a component.
    if (!deep) {
        const filtered: Array<HTMLElement> = [];
        forEach(list as any, (el) => {
            const closestEl = closest(mountTag, el);
            if (!closestEl) {
                return false;
            }
            
            if (closestEl === mount ||
                // We also want to include child-mounts that are in our domain
                closestEl === el && closest(mountTag, closestEl.parentElement!) === mount) {
                filtered.push(el);
                if (!multiple) {
                    return false;
                }
            }
        });
        return filtered;
    } else {
        return asArray(list);
    }
}

/**
 * Internal helper to translate the given event target into an array of valid component proxy event targets
 * @param target
 * @param deep
 */
export function resolveEventTarget(
    this: AbstractBit,
    target: TEventTarget | undefined,
    deep?: boolean
): Array<ComponentProxyEventTarget>
{
    if (isUndefined(target)) {
        return [this.$el];
    }
    
    if (isFunction(target)) {
        return resolveEventTarget.call(this, target.call(this), deep);
    }
    
    if (target === true) {
        return [this.$app.eventBus];
    } else if (isString(target)) {
        return this.$findAll(target, deep);
    } else if (isNumber((target as any).length) && !(target as any).addEventListener) {
        return asArray(target);
    }
    
    return [target as any];
}

/**
 * Internal helper to translate all possible event target definitions and event name lists
 * and bind or unbind them using the provided component proxy instance
 *
 * @param proxy
 * @param target
 * @param deep
 * @param events
 * @param listener
 * @param method
 */
export function runOnEventProxy(
    this: AbstractBit,
    proxy: ComponentProxy,
    target: TEventTarget | undefined,
    deep: boolean | undefined,
    events: TEventList,
    listener: IEventListener,
    method: 'bind' | 'unbind'
): void
{
    forEach(resolveEventTarget.call(this, target, deep), function (el) {
        forEach(isArray(events) ? events : [events], function (event) {
            proxy[method](el, event, listener);
        });
    });
}

/**
 * Internal helper to keep the event binding/unbinding code inside a single bit as DRY as possible
 * @param method
 * @param a
 * @param b
 * @param c
 */
export function bitEventActionWrap(
    this: AbstractBit,
    method: 'bind' | 'unbind',
    a: TEventTarget | TEventList,
    b: TEventList | IEventListener,
    c: IEventListener | undefined
): AbstractBit | any
{
    
    const hasTarget = !isUndefined(c);
    const event = hasTarget ? b : a;
    const listener = hasTarget ? c : b;
    
    runOnEventProxy.call(
        this,
        this.$proxy,
        hasTarget ? a : undefined,
        false,
        event as TEventList,
        listener as IEventListener,
        method);
    
    return this;
}
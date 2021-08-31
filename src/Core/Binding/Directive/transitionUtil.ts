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
 * Last modified: 2021.08.28 at 22:53
 */

import {addClass, map, removeClass} from '@labor-digital/helferlein';

const userAgent = window.navigator.userAgent.toLowerCase();
const isIe9 = userAgent.indexOf('msie 9.0') > 0;
const hasTransition = !isIe9;
export const transitionTickLength = 20;

// This part is a copy of the vue.js implementation
// @see https://github.com/vuejs/vue/blob/0603ff695d2f41286239298210113cbe2b209e28/src/platforms/web/runtime/transition-util.js#L44
export let transitionProp = 'transition';
export let transitionEndEvent = 'transitionend';
export let animationProp = 'animation';
export let animationEndEvent = 'animationend';

if (hasTransition) {
    const win: any = window;
    if (win.ontransitionend === undefined &&
        win.onwebkittransitionend !== undefined
    ) {
        transitionProp = 'WebkitTransition';
        transitionEndEvent = 'webkitTransitionEnd';
    }
    
    if (win.onanimationend === undefined &&
        win.onwebkitanimationend !== undefined
    ) {
        animationProp = 'WebkitAnimation';
        animationEndEvent = 'webkitAnimationEnd';
    }
}

export interface ITransitionDisposer
{
    (): void;
}

type TTransitionOptList = Array<string>;


function toMs(s: string): number
{
    return Number(s.slice(0, -1).replace(',', '.')) * 1000;
}

function findCssOptList(css: any, prop: string, duration: boolean): TTransitionOptList
{
    return (css[prop + (duration ? 'Duration' : 'Delay')] || '').split(', ');
}

function findMaxDuration(delays: TTransitionOptList, durations: TTransitionOptList): number
{
    // Make sure we have the same number of delays as durations
    while (delays.length < durations.length) {
        delays = delays.concat(delays);
    }
    
    return Math.max(...map(durations, (duration: string, i) => toMs(duration) + toMs(delays[i])));
}

/**
 * Parses a the animation duration from the given DOM node.
 * It takes both "transition" and "animation" into account
 * @param target
 */
export function findCssDuration(target: HTMLElement)
{
    const css: any = window.getComputedStyle(target);
    
    return Math.max(
        findMaxDuration(
            findCssOptList(css, transitionProp, false),
            findCssOptList(css, transitionProp, true)
        ),
        findMaxDuration(
            findCssOptList(css, animationProp, false),
            findCssOptList(css, animationProp, true)
        )
    );
}

/**
 * Executes the transition classes and handles potential canceling
 * @param target The DOM element that gets the transition classes
 * @param state The state to with is transitioned TRUE -> enter, FALSE -> leave
 * @param name Optional name as prefix for the transition, if omitted "b" is used
 * @param duration Optional duration in milliseconds that defines how long the transition should take,
 *                  if omitted it will be parsed from the css of the element
 * @param displayType Optional display type to set when the $state is ture. If omitted "block" is used
 * @param elseTarget Optional element that should be counter-toggled with this element
 */
export function handleTransition(
    target: HTMLElement,
    state: boolean,
    name?: string | undefined,
    duration?: number | undefined,
    displayType?: string,
    elseTarget?: HTMLElement
): ITransitionDisposer
{
    displayType = displayType || 'block';
    const namePrefix = (name || 'b') + '-';
    
    if (elseTarget) {
        let cancel = runTransition(
            state ? elseTarget : target,
            state ? !state : state,
            namePrefix,
            duration,
            displayType,
            function (graceful) {
                cancel = runTransition(
                    state ? target : elseTarget,
                    state ? state : !state,
                    namePrefix,
                    graceful ? duration : 0,
                    displayType!,
                    function () {}
                );
            }
        );
        return () => cancel();
    }
    
    return runTransition(target, state, namePrefix, duration, displayType!, function () {});
}

/**
 * Internal helper to run the actual class transition
 *
 * See handleTransition() for options
 *
 * @param target
 * @param state
 * @param namePrefix
 * @param duration
 * @param displayType
 * @param completed Executed when the transition completed. Callback receives:
 *                  "graceful" => true if animation completed, false if it was canceled
 *                  "state" => Pass through of the $state argument
 */
function runTransition(
    target: HTMLElement,
    state: boolean,
    namePrefix: string,
    duration: number | undefined,
    displayType: string,
    completed: (graceful: boolean, state: boolean) => void
): ITransitionDisposer
{
    const classBase = namePrefix + (state ? 'enter' : 'leave') + '-';
    const fromClass = classBase + 'from';
    const toClass = classBase + 'to';
    const activeClass = classBase + 'active ' + namePrefix + 'active';
    
    const end = function (graceful: boolean) {
        removeClass(target, fromClass + ' ' + toClass + ' ' + activeClass);
        !state && (target.style.display = 'none');
        completed(graceful, state);
    };
    
    addClass(target, fromClass + ' ' + activeClass);
    
    state && (target.style.display = displayType);
    
    duration = duration ?? findCssDuration(target);
    
    // If duration is less then a single tick, we just skip it...
    if (duration <= transitionTickLength) {
        end(true);
        return function () {};
    }
    
    const firstTickTimeout = setTimeout(function () {
        removeClass(target, fromClass);
        addClass(target, toClass);
    }, transitionTickLength);
    
    const endTimeout = setTimeout(function () {
        end(true);
    }, duration);
    
    return function () {
        clearTimeout(firstTickTimeout);
        clearTimeout(endTimeout);
        end(false);
    };
}
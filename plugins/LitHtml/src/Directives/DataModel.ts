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
 * Last modified: 2021.08.04 at 12:47
 */

import type {AbstractBit} from '@labor-digital/bits';
import {setElementValue} from '@labor-digital/bits';
import {directive, EventPart} from 'lit-html';

declare global
{
    interface Element
    {
        _bitHtmlListener?: boolean
    }
}

/**
 * Directive to simplify two-way data binding on form elements.
 *
 * You simply bind it to the input event it should listen for (change/keydown for the most part)
 * and tell it which property you want to bind it to.
 *
 * The binding will then update the input value in the same way data-model would.
 *
 * You can also use @context if you would really want to.
 *
 * Example:
 * <label>
 *   Edit your two way binding<br>
 *   <input type="text" @keyup="${dataModel('data.model')}">
 * </label>
 */
export const dataModel = directive((property: string) => async (part: any) => {
    if (!(part instanceof EventPart)) {
        throw new Error(
            'dataModel can only be used in event bindings! Use it like: @keyup="${dataModel(\'yourProperty\')}"');
    }
    
    if (part.element._bitHtmlListener) {
        return;
    }
    
    let handler: Function = function () {};
    part.element._bitHtmlListener = true;
    part.setValue(function (e) {
        handler(e);
    });
    
    const bit: AbstractBit = part.eventContext as any;
    const prop = await bit.$context.binder.getAccessor(property);
    if (prop === null) {
        return;
    }
    
    setElementValue(part.element as HTMLElement, prop.get());
    handler = function (e: UIEvent | KeyboardEvent) {
        bit.$context.binder.reactToChangeEvent(e, part.element as HTMLElement, prop);
    };
});
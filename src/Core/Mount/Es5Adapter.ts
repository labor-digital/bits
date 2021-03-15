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
 * Last modified: 2021.03.10 at 22:19
 */

import type {PlainObject} from '@labor-digital/helferlein';
import type {BitApp} from '../BitApp';
import {Mount} from './Mount';
import type {BitMountHTMLElement} from './types';

/**
 * This adapter is used for the IE or all other browsers that don't support ES6 features like custom components.
 * It simulates the custom component features we need by deploying a mutation observer on the document and watching for changes.
 */
export class Es5Adapter
{
    /**
     * Holds the global mutation observer that watches the changes on the document tree
     * @protected
     */
    protected static _documentObserver: MutationObserver | null = null;
    
    /**
     * A list of mount tags that are registered to be watches
     * @protected
     */
    protected static _mountTags: Array<string> = [];
    
    /**
     * A map of the registered mount tags an their corresponding apps
     * @protected
     */
    protected static _appsByTags: PlainObject<BitApp> = {};
    
    /**
     * Adds a new app to the registry
     * @param app
     */
    public static registerApp(app: BitApp): void
    {
        this.createObserverIfRequired();
        const tag = app.mountTag.toUpperCase();
        this._appsByTags[tag] = app;
        this._mountTags.push(tag);
    }
    
    /**
     * Handles the addition of new mount-nodes to the dom by connecting the mount to their bit instance
     * @param list
     * @protected
     */
    protected static handleAddedNodes(list: NodeListOf<HTMLElement>): void
    {
        for (let i = 0; i < list.length; i++) {
            if (this._mountTags.indexOf(list[i].tagName) !== -1) {
                const el: BitMountHTMLElement = list[i] as any;
                if (!el._bitMount) {
                    el._bitMount = new Mount(this._appsByTags[list[i].tagName]);
                }
                el._bitMount.connect(el).then(() => {
                    el.bit = el._bitMount.bit;
                });
            }
        }
    }
    
    /**
     * Handles the removal of nodes by disconnecting the mount from the bit
     * @param list
     * @protected
     */
    protected static handleRemovedNodes(list: NodeListOf<HTMLElement>): void
    {
        for (let i = 0; i < list.length; i++) {
            if (this._mountTags.indexOf(list[i].tagName) !== -1) {
                const el: BitMountHTMLElement = list[i] as any;
                if (el._bitMount) {
                    el._bitMount.disconnect();
                    delete el.bit;
                }
            }
        }
    }
    
    /**
     * Internal helper to create the global document observer once, and only once for the current page
     * @protected
     */
    protected static createObserverIfRequired(): void
    {
        if (this._documentObserver !== null) {
            return;
        }
        
        this._documentObserver = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.type === 'childList') {
                    if (mutation.addedNodes.length > 0) {
                        Es5Adapter.handleAddedNodes(mutation.addedNodes as any);
                    }
                    
                    if (mutation.removedNodes.length > 0) {
                        Es5Adapter.handleRemovedNodes(mutation.removedNodes as any);
                    }
                }
            });
        });
        
        const container = document.documentElement || document.body;
        this._documentObserver.observe(container, {
            childList: true,
            subtree: true
        });
    }
}
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
 * Last modified: 2021.03.09 at 13:34
 */

import {
    ComponentProxy,
    EventEmitter,
    forEach,
    isPlainObject,
    isString,
    isUndefined,
    PlainObject
} from '@labor-digital/helferlein';
import {render} from 'lit-html';
import {ClassInfo, classMap} from 'lit-html/directives/class-map';
import {StyleInfo, styleMap} from 'lit-html/directives/style-map';
import type {IAutorunOptions, IReactionDisposer, IReactionPublic} from 'mobx';
import {setElementContent} from '../Binding/util';
import type {TWatchTarget} from '../Reactivity/types';
import type {BitApp} from './BitApp';
import type {BitContext} from './BitContext';
import type {BitMountHTMLElement} from './Mount/types';
import type {Translator} from './Translator/Translator';
import type {ITranslateOptions} from './Translator/types';
import type {IEventListener, IHtmlTemplateProvider, IPropertyWatcher, TEventList, TEventTarget} from './types';
import {bindEventsOnProxy, findElement, resolveEventTarget} from './util';

export interface AbstractBit
{
    
    /**
     * Lifecycle hook, that is executed once after the bit class has been instantiated.
     * There is no reactivity or dom linked, yet!
     */
    created?(): void;
    
    /**
     * Lifecycle hook, that is executed one, after the bit has been mounted to the DOM the FIRST TIME!
     * For subsequent mounts, (like when the element was moved around in the dom), take a look at remounted()
     */
    mounted?(): void;
    
    /**
     * Lifecycle hook, that is executed every time the element gets de-attached from the dom.
     */
    unmounted?(): void;
    
    /**
     * Lifecycle hook, that gets executed every time the bit gets attached to the DOM and WAS already attached
     * once, in which case mounted() would be executed instead.
     */
    remounted?(): void;
    
    /**
     * Lifecycle hook, that gets executed once when the bit instance gets destroyed.
     * A bit gets destroyed every time you detach/move it in a DOM, except the b-mount has the "keep-alive" attribute set
     */
    beforeDestroy?(): void;
    
    /**
     * Lifecycle hook, that gets executed after the bit instance was destroyed.
     * A bit gets destroyed every time you detach/move it in a DOM, except the b-mount has the "keep-alive" attribute set
     */
    destroyed?(): void
    
    /**
     * Lifecycle hook, that gets executed every time this bit receives or triggers the "domChange" event using the
     * this.$domChanged() method
     */
    domChanged?(): void;
}

export class AbstractBit
{
    /**
     * The actual context instance, you should use $context to access it!
     * @internal
     */
    protected _context: BitContext;
    
    constructor(context: BitContext)
    {
        this._context = context;
    }
    
    /**
     * Marker to detect if this element is a bit class
     * @internal
     */
    public static get __bit(): true
    {
        return true;
    }
    
    /**
     * Returns the instance of the bit mount / root dom node for this bit
     * @protected
     */
    public get $el(): BitMountHTMLElement
    {
        return this._context.mount.el!;
    }
    
    /**
     * Returns the context of this bit containing connected instances and meta information
     * @protected
     */
    public get $context(): BitContext
    {
        return this._context;
    }
    
    /**
     * Returns the root app this bit was linked with
     * @protected
     */
    protected get $app(): BitApp
    {
        return this._context.app;
    }
    
    /**
     * Returns the instance of the global event bus that allows cross-bit event emitting
     * @protected
     */
    protected get $eventBus(): EventEmitter
    {
        return this.$app.eventBus;
    }
    
    /**
     * Returns the component proxy instance to keep track of event listeners
     * and other outside connections.
     *
     * @see ComponentProxy to find out what it does
     * @protected
     */
    protected get $proxy(): ComponentProxy
    {
        return this._context.proxy;
    }
    
    /**
     * Allows you to find elements inside the dom elements of this bit' mount.
     *
     * @param selector any query selector to find your element with. As a "magic" helper you can provide "@my-ref"
     * @param deep By default only elements inside the current mount are resolved, but children
     * are ignored while retrieving elements. If you set this to true, even elements in child-mounts are returned
     */
    protected $find(selector: string, deep?: boolean): HTMLElement | null
    {
        return findElement(this.$el, selector, false, deep)[0] ?? null;
    }
    
    /**
     * A shortcode for this.$find(selector, true).
     *
     * @param selector any query selector to find your element with. As a "magic" helper you can provide "@my-ref"
     * that will be converted into '*[data-ref="my-ref"]' internally before the query is resolved.
     * @param deep By default only elements inside the current mount are resolved, but children
     * are ignored while retrieving elements. If you set this to true, even elements in child-mounts are returned
     *
     * @see $find
     */
    protected $findAll(selector: string, deep?: boolean): Array<HTMLElement>
    {
        return findElement(this.$el, selector, true, deep);
    }
    
    /**
     * Binds a given listener to a certain event
     *
     * @param target A target to bind the event on.
     *               - mount (default): Bound to the mount dom node itself
     *               - true: Bound to the global this.$app.eventBus, that allows cross-bit events
     *               - ComponentProxyEventTarget: Any of the valid options, like DOM elements
     * @param event The name of the event to bind the listener to. If you use "@mutation" a MutationObserver will track
     * any changes of the dom and call the listener on it
     * @param listener The listener which is called when the event is emitted on the given target
     */
    protected $on(target: TEventTarget, event: TEventList, listener: IEventListener): this
    
    /**
     * Binds a given listener to a certain event
     *
     * @param event The name of the event to bind the listener to. If you use "@mutation" a MutationObserver will track
     * any changes of the dom and call the listener on it
     * @param listener The listener which is called when the event is emitted on the given target
     */
    protected $on(event: TEventList, listener: IEventListener): this
    
    protected $on(
        a: TEventTarget | TEventList,
        b: TEventList | IEventListener,
        c?: IEventListener
    ): this
    {
        const hasTarget = !isUndefined(c);
        const event = hasTarget ? b : a;
        const listener = hasTarget ? c : b;
        
        bindEventsOnProxy.call(
            this,
            this.$proxy,
            hasTarget ? a : undefined,
            false,
            event as TEventList,
            listener as IEventListener);
        
        return this;
    }
    
    /**
     * Emits a dom event on the selected target
     *
     *
     * @param target A target to emit the event on.
     *               - mount (default): Bound to the mount dom node itself
     *               - true: Bound to the global this.$app.eventBus, that allows cross-bit events
     *               - ComponentProxyEventTarget: Any of the valid options, like DOM elements
     * @param event the name of the event to emit
     * @param args additional arguments to pass to the event
     */
    protected $emit(target: TEventTarget, event: string, args?: PlainObject): this
    
    /**
     * Emits a dom event on this bits b-mount node
     *
     * @param event the name of the event to emit
     * @param args additional arguments to pass to the event
     */
    protected $emit(event: string, args?: PlainObject): this
    
    protected $emit(a: TEventTarget, b?: PlainObject | string, c?: PlainObject): this
    {
        const hasTarget = isString(b);
        const event = hasTarget ? b : a;
        const args = hasTarget ? c : b;
        
        forEach(resolveEventTarget.call(this, hasTarget ? a : undefined), target => {
            this.$proxy.emit(target, event as string, args as PlainObject);
        });
        
        return this;
    }
    
    /**
     * Registers a callback which is executed every time the property was updated
     * @see https://mobx.js.org/reactions.html#reaction
     *
     * @param target  Either the name of the property to watch, or an expression to define the watchable target,
     *                like () => this.computed
     * @param watcher The callback to execute when the property was updated.
     *                It will receive the new and the old value as parameters.
     */
    protected $watch(target: TWatchTarget, watcher: IPropertyWatcher): IReactionDisposer
    {
        return this._context.reactivityProvider.addWatcher(target, watcher);
    }
    
    /**
     * Registers a new auto-runner for this bit, and automatically adds it to the garbage collection
     * @see https://mobx.js.org/reactions.html#autorun
     *
     * @param watcher The function to execute, when one or more of the used observables changed
     * @param options Additional options
     */
    public $autoRun(watcher: (r: IReactionPublic) => any, options?: IAutorunOptions): IReactionDisposer
    {
        return this._context.reactivityProvider.addAutoRun(watcher, options);
    }
    
    /**
     * Helper to tell this and all parent mounts that the DOM was somehow changed.
     * This forces all elements in the tree to recalculate their bindings and reattach the event listeners.
     *
     * @protected
     */
    protected $domChanged(): void
    {
        this.$emit('domChange');
    }
    
    /**
     * See the main implementation for additional features!
     *
     * Allows you to mount a reactively, rendered HTML template into the dom. The template is rendered using
     * lit-html, so you can use all natively supported features.
     *
     * The template will be rendered at the root of the bit mount component
     *
     * @param template
     * @protected
     * @see https://lit-html.polymer-project.org/guide
     */
    protected $html(template: IHtmlTemplateProvider): void
    
    /**
     * See the main implementation for additional features!
     *
     * Allows you to mount a reactively, rendered HTML template into the dom. The template is rendered using
     * lit-html, so you can use all natively supported features.
     *
     * The template will be rendered as content of the provided target
     *
     * @param target
     * @param template
     * @protected
     * @see https://lit-html.polymer-project.org/guide
     */
    protected $html(target: string | HTMLElement, template: IHtmlTemplateProvider): void
    
    /**
     * Allows you to mount a reactively, rendered HTML template into the dom. The template is rendered using
     * lit-html, so you can use all natively supported features.
     *
     * ATTENTION: While it is possible to use declarative data-binds using data-bind="..." in your template,
     * I would strongly recommend using the lit-html binding technic instead. For two-way data binding you should
     * take a look at the dataModel() that is provided by the package.
     *
     * WARNING: The mounted HTML is reactive! You don't have to re-render it every time a reactive property changed!
     * Call this method in the mounted() hook, or use the returned disposer function, to unbind the html first!
     *
     * If no target is provided, the rendered html will be mounted directly into the mount point of this bit!
     *
     * The template must be provided using the "html"/"svg" processor of lit-html.
     * You can import those directly from this package.
     *
     * @param a
     * @param b
     * @protected
     * @see https://lit-html.polymer-project.org/guide
     */
    protected $html(
        a: string | HTMLElement | IHtmlTemplateProvider,
        b?: IHtmlTemplateProvider
    ): IReactionDisposer
    {
        const template: IHtmlTemplateProvider = b ?? a as any;
        let target: string | HTMLElement | null = template === a ? this.$el : a as any;
        
        if (isString(target)) {
            target = this.$find(target);
        }
        
        if (target !== null) {
            return this.$context.reactivityProvider.addAutoRun(() => {
                try {
                    
                    render(
                        template.call(this),
                        target as HTMLElement,
                        {eventContext: this as any}
                    );
                } catch (e) {
                    console.log('RENDERING ERROR', e);
                }
            });
        } else {
            console.error('HTML rendering failed! No target found!');
        }
        
        const disposer: IReactionDisposer = function () {};
        disposer.$mobx = {} as any;
        return disposer;
    }
    
    
    /**
     * Shortcut to the classMap directive of lit-html
     *
     * A directive that applies CSS classes. This must be used in the class attribute and must be the only part
     * used in the attribute. It takes each property in the classInfo argument and adds the property name to the
     * element's class if the property value is truthy; if the property value is falsey, the property name is removed
     * from the element's class. For example {foo: bar} applies the class foo if the value of bar is truthy.
     *
     * @param classInfo
     * @protected
     * @see https://lit-html.polymer-project.org/guide/styling-templates#classmap
     */
    protected $classMap(classInfo: ClassInfo)
    {
        return classMap(classInfo);
    }
    
    /**
     * Shortcut to the styleMap directive of lit-html
     *
     * A directive that applies CSS properties to an element.
     * styleMap can only be used in the style attribute and must be the only expression in the attribute. It takes the
     * property names in the styleInfo object and adds the property values as CSS properties. Property names with
     * dashes (-) are assumed to be valid CSS property names and set on the element's style object using setProperty().
     * Names without dashes are assumed to be camelCased JavaScript property names and set on the element's style object
     * using property assignment, allowing the style object to translate JavaScript-style names to CSS property names.
     * For example styleMap({backgroundColor: 'red', 'border-top': '5px', '--size': <br />'0'}) sets the
     * background-color, border-top and --size properties.
     *
     * @param styleInfo
     * @protected
     * @see https://lit-html.polymer-project.org/guide/styling-templates#stylemap
     */
    protected $styleMap(styleInfo: StyleInfo)
    {
        return styleMap(styleInfo);
    }
    
    /**
     * Utility to load the content of a "template" tag into a new sub-node which will be returned.
     * To be selectable, your template should have a data-ref="$ref" attribute.
     *
     * The method allows you to provide a one-dimensional list of values that should be injected
     * while the template is loaded. NOTE: This is not reactive, but merely an initial state.
     * To define a marker add the data-value="key" attribute to any child of your template tag,
     * and provide the data like {key: 'my-value'}. All data is injected as text and therefore auto-escaped.
     *
     * NOTE: If your template contains binding attributes like data-bind or data-model, you have to execute
     * the $domChanged() method once, after the node was attached to the dom tree!
     *
     * ADVICE: For advanced templating tasks I would strongly advise you, to use $html() instead, as it is reactive
     * to any data changes and allows special features like event-listeners.
     *
     * @param ref The key to find the template with. Set data-ref="$ref" on your template tag
     * @param data Optional data to be injected, when the template is loaded.
     * @protected
     */
    protected $tpl(ref: string, data?: PlainObject): DocumentFragment
    {
        const tpl = this.$find('template[data-ref="' + ref + '"]');
        
        if (!tpl) {
            throw new Error('Could not find a template with the data-ref="' + ref + '" attribute on it!');
        }
        
        const node = (tpl as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment;
        if (isPlainObject(data)) {
            forEach(node.querySelectorAll('[data-value]') as any, (v: HTMLElement) => {
                const val = v.dataset.value!;
                
                if (isUndefined(data[val])) {
                    return;
                }
                
                setElementContent(v, data[val], true);
            });
        }
        
        return node;
    }
    
    /**
     * Returns the translator instance for this bit
     * @protected
     */
    protected get $translator(): Translator
    {
        return this._context.translator;
    }
    
    /**
     * Translates a single key using the loaded labels and returns the matched value.
     *
     * @param key The label key to use for translation
     * @param args An array of arguments to replace using sprintf in your label.
     * @param options Advanced translation options
     *
     * @see Translator::translate()
     */
    protected $t(
        key: string,
        args?: Array<string | number> | PlainObject<string | number>,
        options?: ITranslateOptions
    ): string
    {
        return this.$translator.translate(key, args, options);
    }
    
    /**
     * This is the the DANGER ZONE! Calling this method will destroy the bit instance completely
     * @protected
     */
    public $destroy(): void
    {
        if (this.beforeDestroy) {
            this.beforeDestroy();
        }
        
        this._context.destroy();
        this._context = null as any;
    }
}
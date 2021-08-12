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
 * Last modified: 2021.08.02 at 11:26
 */

import type {AbstractBit} from '../AbstractBit';
import type {BitApp} from '../BitApp';
import type {DiContainer} from '../Di/DiContainer';
import type {IBitNs} from '../types';

/**
 * Defines the main plugin class
 */
export interface IBitPlugin
{
    /**
     * Executed right after the plugin instance was initialized
     * @param app
     */
    initialized?(app: BitApp): void
    
    /**
     * Executed when the bits app reaches the "created" lifecycle hook, before the DOM gets mounted
     * @param app
     */
    created?(app: BitApp): void | Promise<void>
    
    /**
     * Executed when the bits app reaches the "mounted" lifecycle hook, after the bits have been mounted to the DOM
     * @param app
     */
    mounted?(app: BitApp): void | Promise<void>
    
    /**
     * Allows the plugin to provide a list of bits to be registered in the application.
     * The returned object must have the same syntax normally used in the bits definition of the bits app.
     *
     * @param app
     */
    provideBits?(app: BitApp): IBitNs
    
    /**
     * Executed once when the plugin was instantiated, allows you to register extension
     * methods to be registered on every bit instance.
     *
     * @param inject
     * @param app
     */
    extendBits?(inject: IBitPluginExtensionInjector, app: BitApp): void;
    
}

export type TBitPluginList = Array<IBitPlugin>

/**
 * Factory method to create a plugin instance using the container or app
 */
export interface IBitPluginFactory
{
    (container: DiContainer, app: BitApp): IBitPlugin
}

export interface IBitPluginExtensionCallback
{
    (this: AbstractBit, ...args: any): any
}

export interface IBitPluginExtensionDestructor
{
    (this: AbstractBit, ...args: any): any
}

export interface IBitPluginExtensionOptions
{
    /**
     * Callback to execute when the extension method is executed,
     * or a factory to retrieve a value to return when "getter" was set to true
     */
    callback: IBitPluginExtensionCallback
    
    /**
     * Callback to be executed when a bit gets destroyed
     */
    destructor?: IBitPluginExtensionDestructor
    
    /**
     * True if the extension
     */
    getter?: boolean
}

export type TBitPluginExtensionValue = IBitPluginExtensionOptions | IBitPluginExtensionCallback

export interface IBitPluginExtensionInjector
{
    (
        key: string,
        callbackOrOptions: TBitPluginExtensionValue
    ): void
}

export interface IBitPluginHandler
{
    (bit: AbstractBit): void
}
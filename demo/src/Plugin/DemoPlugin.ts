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
 * Last modified: 2021.08.04 at 16:13
 */

import {AbstractBit, BitApp, IBitNs, IBitPlugin, IBitPluginExtensionInjector} from '@labor-digital/bits';
import {PluginBit} from './PluginBit';
import {PluginService} from './PluginService';

declare module '@labor-digital/bits/dist/Core/AbstractBit'
{
    interface AbstractBit
    {
        $changePluginMessage(message: string): void;
        
        readonly $pluginService: PluginService;
    }
}

declare module '@labor-digital/bits/dist/Core/Di/DiContainer'
{
    interface DiContainer
    {
        readonly pluginService: PluginService
    }
}


export class DemoPlugin implements IBitPlugin
{
    public initialized(app: BitApp): void
    {
        // Either as instance that must be available at all times
        app.di.set('pluginService', new PluginService());
        // Or as factory to be created only when required
        // app.di.setFactory('pluginService', () => new PluginService());
    }
    
    public provideBits(app: BitApp): IBitNs
    {
        return {
            plugin: {
                demo: PluginBit
            }
        };
    }
    
    public extendBits(inject: IBitPluginExtensionInjector): void
    {
        inject('changePluginMessage', function (this: AbstractBit, message: string) {
            this.$di.pluginService.message = message;
        });
        
        inject('pluginService', {
            callback: function (this: AbstractBit) {
                return this.$di.pluginService;
            },
            getter: true
        });
    }
    
    
}
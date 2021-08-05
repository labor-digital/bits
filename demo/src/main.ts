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
 * Last modified: 2021.03.01 at 18:26
 */

import {BitApp} from '@labor-digital/bits';
import {LitHtmlPlugin} from '@labor-digital/bits-lit-html';
import TranslatorPlugin from '@labor-digital/bits-translator';
import {ucFirst} from '@labor-digital/helferlein';
import 'bootstrap/dist/css/bootstrap-reboot.css';
import 'bootstrap/dist/css/bootstrap.css';
import {InteractionContextChild} from './Bits/Advanced/InteractionContextChild';
import {InteractionContextParent} from './Bits/Advanced/InteractionContextParent';
import {InteractionPropsChild} from './Bits/Advanced/InteractionPropsChild';
import {InteractionPropsParent} from './Bits/Advanced/InteractionPropsParent';
import {InteractionPropsProgChild} from './Bits/Advanced/InteractionPropsProgChild';
import {InteractionPropsProgParent} from './Bits/Advanced/InteractionPropsProgParent';
import {Mixins} from './Bits/Advanced/Mixins';
import {ReactivityAutoRun} from './Bits/Advanced/ReactivityAutoRun';
import {ReactivityWatcher} from './Bits/Advanced/ReactivityWatcher';
import {Templates} from './Bits/Advanced/Templates';
import {FormBinding} from './Bits/Essentials/FormBinding';
import {FormBindingBasic} from './Bits/Essentials/FormBindingBasic';
import {LifecycleChild} from './Bits/Essentials/LifecycleChild';
import {LifecycleParent} from './Bits/Essentials/LifecycleParent';
import {Reactivity} from './Bits/Essentials/Reactivity';
import {ReactivityAlternative} from './Bits/Essentials/ReactivityAlternative';
import {ReactivityButton} from './Bits/Essentials/ReactivityButton';
import {ReactivityComputed} from './Bits/Essentials/ReactivityComputed';
import {StyleAndClasses} from './Bits/Essentials/StyleAndClasses';
import {DependencyInjection} from './Bits/Misc/DependencyInjection';
import {Hmr} from './Bits/Misc/Hmr';
import {NoopBit} from './Bits/Misc/NoopBit';
import {LitHtml} from './Bits/Plugins/LitHtml/LitHtml';
import {LitHtmlAdvanced} from './Bits/Plugins/LitHtml/LitHtmlAdvanced';
import {LitHtmlBinding} from './Bits/Plugins/LitHtml/LitHtmlBinding';
import {LitHtmlModel} from './Bits/Plugins/LitHtml/LitHtmlModel';
import {Translator} from './Bits/Plugins/Translator/Translator';
import {Display} from './Bits/Util/Display';
import {DemoPlugin} from './Plugin/DemoPlugin';
import {ServiceA} from './Services/ServiceA';
import {ServiceB} from './Services/ServiceB';

new BitApp({
    bits: {
        // Using a key, your bit is defined globally so type="example" will resolve the example bit
        example: NoopBit,
        
        // You can either define namespaces for props as a string...
        'namespace/bitA': NoopBit,
        
        // ...or as nested list of definitions
        namespace: {
            bitB: NoopBit
        },
        
        advanced: {
            
            interaction: {
                context: {
                    child: InteractionContextChild,
                    parent: InteractionContextParent
                },
                
                props: {
                    child: InteractionPropsChild,
                    parent: InteractionPropsParent,
                    
                    prog: {
                        child: InteractionPropsProgChild,
                        parent: InteractionPropsProgParent
                    }
                }
            },
            
            mixins: Mixins,
            
            reactivity: {
                autoRun: ReactivityAutoRun,
                watcher: ReactivityWatcher
            },
            
            templates: Templates
        },
        
        essentials: {
            formBinding: {
                // An empty string defines the bit as "essentials/formBinding"
                '': FormBinding,
                basic: FormBindingBasic
            },
            
            lifecycle: {
                child: LifecycleChild,
                parent: LifecycleParent
            },
            
            reactivity: {
                '': Reactivity,
                alternative: ReactivityAlternative,
                button: ReactivityButton,
                computed: ReactivityComputed
            },
            
            styleAndClasses: StyleAndClasses
        },
        
        plugins: {
            litHtml: {
                '': LitHtml,
                binding: LitHtmlBinding,
                model: LitHtmlModel,
                advanced: LitHtmlAdvanced
            },
            
            translator: {
                '': Translator
            }
        },
        
        misc: {
            di: DependencyInjection,
            hmr: Hmr
        },
        
        util: {
            display: Display
        }
    },
    
    plugins: [
        new DemoPlugin(),
        
        // Until the next major version, the translator is included in the base distribution
        // After that, you have to install and register the plugin through the @labor-digital/bits-translator package
        new TranslatorPlugin(),
        new LitHtmlPlugin()
    ],
    
    bitResolver: type => {
        if (type === 'async') {
            type = '';
        }
        return import('./Bits/Advanced/Async' + ucFirst(type));
    },
    
    // You can listen on a per-app state on events triggered on the global event bus
    // This can be quite useful for error handling. Other than normal event listeners
    // app event listeners always retrieve the "app" instance as a second parameter.
    events: {
        globalEvent: (e, app) => {
            console.log('Global event handler triggered', 'event', e, 'app', app);
        }
    },
    
    // This configures the available services in the dependency injection container.
    // Note, that you only configure factories here. The actual instances will be created
    // once the service is required. All service instances are singletons and are shared between
    // all bits inside your application.
    
    // Take a look at the globals.d.ts to see how you can add auto-completion hints for the dependency
    // injection container inside your bits. Please note, that extending the types there is optional
    services: {
        stringService: () => new ServiceB(),
        
        // Each factory receives the container instance you can use to retrieve other services with.
        helloService: (c) => new ServiceA(c.stringService)
        
        // Note: Sadly the auto-completion does not work in this file. I can't, for the life of me
        // figure out, why not, so if you have a solution for this, please give me a shout.
    }
});
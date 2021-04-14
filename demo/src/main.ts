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
import {ucFirst} from '@labor-digital/helferlein';
import 'bootstrap/dist/css/bootstrap-reboot.css';
import 'bootstrap/dist/css/bootstrap.css';
import {Child} from './Bits/Context/Child';
import {Parent} from './Bits/Context/Parent';
import {FormBasic} from './Bits/Docs/Form/FormBasic';
import {Html} from './Bits/Docs/Html/Html';
import {HtmlBinding} from './Bits/Docs/Html/HtmlBinding';
import {HtmlModel} from './Bits/Docs/Html/HtmlModel';
import {Reactivity} from './Bits/Docs/Reactivity/Reactivity';
import {ReactivityAlternative} from './Bits/Docs/Reactivity/ReactivityAlternative';
import {ReactivityButton} from './Bits/Docs/Reactivity/ReactivityButton';
import {ReactivityComputed} from './Bits/Docs/Reactivity/ReactivityComputed';
import {ReactivityWatcher} from './Bits/Docs/Reactivity/ReactivityWatcher';
import {Escape} from './Bits/Escape';
import {Forms} from './Bits/Forms';
import {Hmr} from './Bits/Hmr';
import {HtmlBit} from './Bits/HtmlBit';
import {Child as ChildCycle} from './Bits/Lifecycle/Child';
import {Parent as ParentCycle} from './Bits/Lifecycle/Parent';
import {ExtendedBit} from './Bits/Mixins/ExtendedBit';
import {Child as ChildProp} from './Bits/Props/Child';
import {Parent as ParentProp} from './Bits/Props/Parent';
import {ProgChild} from './Bits/Props/Programmatic/ProgChild';
import {ProgParent} from './Bits/Props/Programmatic/ProgParent';
import {Style} from './Bits/Style';
import {Templates} from './Bits/Templates';
import {Translation} from './Bits/Translation';
import {Display} from './Bits/Util/Display';

new BitApp({
    bits: {
        style: Style,
        
        // You can either define namespaces for props as a string...
        'context/parent': Parent,
        'context/child': Child,
        // ...or as nested list of definitions
        props: {
            prog: {
                parent: ProgParent,
                child: ProgChild
            },
            parent: ParentProp,
            child: ChildProp
        },
        lifecycle: {
            parent: ParentCycle,
            child: ChildCycle
        },
        extended: ExtendedBit,
        templates: Templates,
        forms: Forms,
        escape: Escape,
        html: HtmlBit,
        hmr: Hmr,
        translation: Translation,
        
        util: {
            display: Display
        },
        
        docs: {
            reactivity: {
                '': Reactivity,
                withButton: ReactivityButton,
                computed: ReactivityComputed,
                alternative: ReactivityAlternative,
                watcher: ReactivityWatcher
            },
            form: {
                basic: FormBasic
            },
            html: {
                '': Html,
                binding: HtmlBinding,
                model: HtmlModel
            }
        }
    },
    
    bitResolver: type => {
        return import('./Bits/Async/' + ucFirst(type) + 'Bit');
    }
});
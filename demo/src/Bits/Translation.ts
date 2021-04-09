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
 * Last modified: 2021.04.09 at 21:35
 */

import {AbstractBit} from '@labor-digital/bits';

export class Translation extends AbstractBit
{
    public mounted()
    {
        // If an unknown label is required, a warning is rendered in the browser console.
        // Instead of a translated value the required key will be returned
        console.log('Unknown label:', this.$t('unknown.label'));
        
        this.$find('@output')!.innerText = this.$t('translated.label');
        this.$find('@locale')!.innerText = this.$translator().locale;
    }
}
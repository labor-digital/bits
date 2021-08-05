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
 * Last modified: 2021.04.15 at 11:56
 */

import {AbstractBit, AutoRun, Data, Hot, Listener} from '@labor-digital/bits';
import {forEach} from '@labor-digital/helferlein';

@Hot(module)
export class ReactivityAutoRun extends AbstractBit
{
    @Data()
    protected filter: string | null = null;
    
    @AutoRun()
    protected applyFilter(): void
    {
        const items = this.$findAll('@item');
        const filter = this.filter?.toLowerCase();
        
        let found = false;
        
        if (!filter) {
            this.$class(items, {'d-none': false});
            found = true;
        } else {
            forEach(items, el => {
                const text = (el.childNodes[1] as HTMLElement).innerText ?? '';
                const isMatch = text.toLowerCase().indexOf(filter) !== -1;
                this.$class(el, {'d-none': !isMatch});
                found = found || isMatch;
            });
        }
        
        this.$class('@notFound', {'d-none': found});
    }
    
    @Listener('click', '@clear')
    protected clear(): void
    {
        this.filter = '';
    }
    
    @Listener('click', '@button')
    protected addCountry(): void
    {
        const countries = [
            'Benin',
            'Bermuda',
            'Botswana',
            'Bouvet Island',
            'Greenland',
            'Grenada',
            'Guyana',
            'Haiti',
            'Iceland',
            'India',
            'Indonesia',
            'Italy'
        ];
        
        this.$find('@items')?.appendChild(
            this.$tpl('itemTpl', {
                country: countries[Math.floor(countries.length * Math.random())]
            })
        );
        
        this.$domChanged();
    }
}
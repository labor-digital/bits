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
 * Last modified: 2021.03.07 at 21:10
 */

import {AbstractBit, Data, dataModel, html} from '@labor-digital/bits';

export class HtmlBit extends AbstractBit
{
    @Data()
    data = {
        timer: 0,
        count: 0,
        clicks: 0,
        showSection: true,
        model: 'Change me away!'
    };
    
    protected countClick()
    {
        this.data.clicks++;
    }
    
    protected toggleSection()
    {
        this.data.showSection = !this.data.showSection;
    }
    
    protected startInterval()
    {
        this.stopInterval();
        this.data.count++;
        this.data.timer = this.$proxy.setInterval(() => {
            this.data.count++;
        }, 500);
    }
    
    protected stopInterval()
    {
        this.$proxy.clearInterval(this.data.timer);
    }
    
    protected resetCounter()
    {
        this.data.count = 0;
    }
    
    public mounted()
    {
        this.$html(() => html`
            <div class="card-body">
                <div class="mb-4">
                    <h4 class="mb-3">Timer</h4>
                    
                    <div class="btn-group mb-3" role="group">
                        <button class="btn btn-success" @click="${this.startInterval}">Start</button>
                        <button class="btn btn-warning" @click="${this.stopInterval}">Stop</button>
                        <button class="btn btn-secondary" @click="${this.resetCounter}">Reset</button>
                    </div>
                    
                    <ul class="list-group">
                        <li class="list-group-item">
                            Counter: <strong>${this.data.count}</strong>
                        </li>
                    </ul>
                </div>
                
                <hr>
                
                <div class="mb-3 mt-3">
                    <h4 class="mb-3">Click counter</h4>
                    
                    <button class="btn btn-primary mb-3" @click="${this.countClick}">Click me!</button>
                    
                    <ul class="list-group">
                        <li class="list-group-item">
                            Clicks: <strong>${this.data.clicks}</strong>
                        </li>
                    </ul>
                </div>
                
                <hr>
                
                <div class="mb-3 mt-3">
                    <h4 class="mb-3">Data binding</h4>
                    
                    <div class="form-floating mb-3">
                        <!--
                        Sadly, two-way data binding is not really intuitive in lit-html
                        Therefore this library provides an additional glue layer in form of the "dataModel" directive,
                        to ease the pain a bit. It is not perfect, but the best I can currently provide.
                        
                        To get it wo work, you define the input event to listen for (change/keydown for the most part),
                        like any other event listener and then, tell the directive which property you want to bind it to.
                        The binding will automatically update the input value in the same way data-model would.
                        -->
                        <input type="text" class="form-control" @keydown="${dataModel('data.model')}" id="textInput"/>
                        <label for="textInput">Two-way data binding</label>
                    </div>
                    
                    <ul class="list-group">
                        <li class="list-group-item">
                            Bound data: <strong>${this.data.model}</strong>
                        </li>
                    </ul>
                </div>
                
                <hr>
                
                <div class="mb-3 mt-3">
                    <h4 class="mb-3">Conditionals</h4>
                    
                    <button class="btn btn-primary mb-3" @click="${this.toggleSection}">Toggle</button>
                    
                    ${this.data.showSection ?
                        html`
                            <div class="card bg-success text-white">
                                <div class="card-body">This card can be toggled</div>
                            </div>` : ''
                    }
                </div>
            </div>`);
    }
    
    
}
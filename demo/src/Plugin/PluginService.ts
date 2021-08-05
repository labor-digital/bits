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
 * Last modified: 2021.08.04 at 16:45
 */

import {makeObservable, observable} from 'mobx';

export class PluginService
{
    protected _message: string = 'Hello world! I am a demo plugin :)';
    
    constructor()
    {
        makeObservable(this, {_message: observable} as any);
    }
    
    public set message(message)
    {
        this._message = message;
    }
    
    public get message(): string
    {
        return this._message;
    }
}
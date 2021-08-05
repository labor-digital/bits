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
 * Last modified: 2021.06.27 at 21:18
 */
// This helper is used to automatically set the version in the ext_emconf.php file to the latest version
// after the conventional release generated a new number for us
const fs = require('fs');
const path = require('path');
const version = process.argv[2];
const pJson = require('./package.json');

function updatePackageVersion(filename, version)
{
    let content = fs.readFileSync(filename).toString('utf-8');
    const patternName = pJson.name.replace(/\//g, '\\\/').replace(/\./g, '\\\.');
    const pattern = new RegExp('("' + patternName + '"\\s?:\\s+)(".*?")');
    content = content.replace(pattern, '$1"' + version + '"');
    fs.writeFileSync(filename, content);
}

updatePackageVersion(path.join(__dirname, 'plugins/LitHtml', 'package.json'), version);
updatePackageVersion(path.join(__dirname, 'plugins/Translator', 'package.json'), version);


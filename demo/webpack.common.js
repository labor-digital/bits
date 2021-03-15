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
 * Last modified: 2021.03.01 at 18:23
 */

const path = require('path');

module.exports = {
    entry: [
        '@webcomponents/template/template.js',
        'core-js/features/object/assign',
        'core-js/features/object/is',
        'core-js/features/object/entries',
        'core-js/features/promise',
        'core-js/features/symbol',
        './src/main.ts'
    ],
    target: 'web',
    module: {
        rules: [
            {
                test: /\.[jt]sx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            // We just transpile typescript, so we don't have to exclude the node_modules here
                            // This way we can utilize typescript as es5 transpiler, which has a far better performance
                            // as babel
                            transpileOnly: true,
                            configFile: path.resolve(__dirname, 'tsconfig.json')
                        }
                    }
                ]
            },
            {
                test: /\.css/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    output: {
        filename: 'bundle.js',
        publicPath: '../dist/',
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js']
    }
};